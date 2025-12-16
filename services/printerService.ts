import { PrinterDevice, ReceiptData, ReceiptItem, PrintOptions } from "../types";

// --- ESC/POS COMMAND CONSTANTS ---
const ESC = 0x1B;
const GS = 0x1D;

const COMMANDS = {
  INIT: [ESC, 0x40], // Initialize printer
  LF: [0x0A], // Line feed
  CUT_FULL: [GS, 0x56, 0x00], // Cut paper (Full)
  CUT_PARTIAL: [GS, 0x56, 0x42, 0x00], // Cut paper (Partial + Feed)
  
  // Cash Drawer (Kick Pulse)
  KICK_DRAWER_2: [ESC, 0x70, 0x00, 0x19, 0xFA], // Pin 2
  KICK_DRAWER_5: [ESC, 0x70, 0x01, 0x19, 0xFA], // Pin 5
  
  // Text Formatting
  TXT_NORMAL: [ESC, 0x21, 0x00],
  TXT_2HEIGHT: [ESC, 0x21, 0x10],
  TXT_2WIDTH: [ESC, 0x21, 0x20],
  TXT_4SQUARE: [ESC, 0x21, 0x30],
  TXT_BOLD_ON: [ESC, 0x45, 0x01],
  TXT_BOLD_OFF: [ESC, 0x45, 0x00],
  
  // Alignment
  TXT_ALIGN_LT: [ESC, 0x61, 0x00],
  TXT_ALIGN_CT: [ESC, 0x61, 0x01],
  TXT_ALIGN_RT: [ESC, 0x61, 0x02],

  // Barcode
  BARCODE_HRI_OFF: [GS, 0x48, 0x00],
  BARCODE_HRI_BELOW: [GS, 0x48, 0x02],
  BARCODE_HEIGHT: [GS, 0x68, 0x50],
  BARCODE_WIDTH: [GS, 0x77, 0x02],
};

// --- HELPER CLASSES ---

class EscPosEncoder {
  private buffer: number[] = [];

  constructor() {
    this.initialize();
  }

  initialize() {
    this.buffer.push(...COMMANDS.INIT);
    return this;
  }

  text(content: string) {
    // Sanitize to ASCII/PC437
    // eslint-disable-next-line no-control-regex
    const safeContent = content.replace(/[^\x00-\x7F]/g, "?");
    for (let i = 0; i < safeContent.length; i++) {
        this.buffer.push(safeContent.charCodeAt(i));
    }
    return this;
  }

  newline(count = 1) {
    for (let i = 0; i < count; i++) {
      this.buffer.push(...COMMANDS.LF);
    }
    return this;
  }

  align(align: 'left' | 'center' | 'right') {
    if (align === 'center') this.buffer.push(...COMMANDS.TXT_ALIGN_CT);
    else if (align === 'right') this.buffer.push(...COMMANDS.TXT_ALIGN_RT);
    else this.buffer.push(...COMMANDS.TXT_ALIGN_LT);
    return this;
  }

  bold(active: boolean) {
    this.buffer.push(...(active ? COMMANDS.TXT_BOLD_ON : COMMANDS.TXT_BOLD_OFF));
    return this;
  }

  size(size: 'normal' | 'large') {
    this.buffer.push(...(size === 'large' ? COMMANDS.TXT_4SQUARE : COMMANDS.TXT_NORMAL));
    return this;
  }

  line(char = '-') {
    this.text(char.repeat(32));
    this.newline();
    return this;
  }

  cut() {
    this.newline(4); 
    this.buffer.push(...COMMANDS.CUT_PARTIAL);
    return this;
  }
  
  pulse() {
    this.buffer.push(...COMMANDS.KICK_DRAWER_2);
    this.buffer.push(...COMMANDS.KICK_DRAWER_5);
    return this;
  }

  barcode(data: string) {
    if (!data) return this;
    this.buffer.push(...COMMANDS.BARCODE_WIDTH);
    this.buffer.push(...COMMANDS.BARCODE_HEIGHT);
    this.buffer.push(...COMMANDS.BARCODE_HRI_OFF); 
    this.buffer.push(GS, 0x6B, 73, data.length);
    for (let i = 0; i < data.length; i++) {
        this.buffer.push(data.charCodeAt(i));
    }
    return this;
  }

  addImageData(width: number, height: number, data: Uint8Array) {
    this.buffer.push(GS, 0x76, 0x30, 0x00);
    const bytesPerLine = Math.ceil(width / 8);
    this.buffer.push(bytesPerLine % 256);
    this.buffer.push(Math.floor(bytesPerLine / 256));
    this.buffer.push(height % 256);
    this.buffer.push(Math.floor(height / 256));
    data.forEach(b => this.buffer.push(b));
    return this;
  }

  getUint8Array() {
    return new Uint8Array(this.buffer);
  }
}

// --- UTILITIES ---

const processImageForPrinter = (imageSrc: string, targetWidth: number = 384): Promise<{ width: number, height: number, data: Uint8Array }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const correctedWidth = Math.floor(targetWidth / 8) * 8;
      const scale = correctedWidth / img.width;
      const height = Math.floor(img.height * scale);
      
      canvas.width = correctedWidth;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("No Canvas Context");

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, correctedWidth, height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, correctedWidth, height);
      
      const imgData = ctx.getImageData(0, 0, correctedWidth, height);
      const pixels = imgData.data; 
      
      const grayPixels = new Float32Array(correctedWidth * height);
      
      for (let i = 0; i < pixels.length; i += 4) {
        let brightness = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
        if (brightness > 230) brightness = 255; 
        else if (brightness < 30) brightness = 0; 
        grayPixels[i / 4] = brightness;
      }

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < correctedWidth; x++) {
          const idx = y * correctedWidth + x;
          const oldPixel = grayPixels[idx];
          const newPixel = oldPixel < 128 ? 0 : 255;
          grayPixels[idx] = newPixel;
          const quantError = oldPixel - newPixel;

          if (x + 1 < correctedWidth) grayPixels[idx + 1] += quantError * 7 / 16;
          if (y + 1 < height) {
            if (x - 1 >= 0) grayPixels[idx + correctedWidth - 1] += quantError * 3 / 16;
            grayPixels[idx + correctedWidth] += quantError * 5 / 16;
            if (x + 1 < correctedWidth) grayPixels[idx + correctedWidth + 1] += quantError * 1 / 16;
          }
        }
      }

      const bytesPerLine = Math.ceil(correctedWidth / 8);
      const buffer = new Uint8Array(bytesPerLine * height);
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < correctedWidth; x++) {
          const byteIndex = y * bytesPerLine + Math.floor(x / 8);
          const bitIndex = 7 - (x % 8);
          const idx = y * correctedWidth + x;
          if (grayPixels[idx] === 0) {
             buffer[byteIndex] |= (1 << bitIndex);
          }
        }
      }
      resolve({ width: correctedWidth, height, data: buffer });
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
};

// --- MAIN SERVICE FUNCTIONS (REAL HARDWARE LOGIC) ---

export const sendDataToDevice = async (device: PrinterDevice, data: Uint8Array, onProgress?: (percent: number) => void) => {
  if (!device) throw new Error("Device not connected");

  // Chunk size is crucial for Bluetooth Low Energy (MTU limitation).
  // 128 bytes is a safe sweet spot for generic Chinese thermal printers.
  // Sending too fast without waiting leads to buffer overflow and garbage printing.
  const MAX_CHUNK = 128; 
  
  const total = data.length;
  let sent = 0;

  if (device.type === 'ble') {
    if (!device.characteristic) throw new Error("Bluetooth Characteristic not found");
    
    // REAL LOOP: Iterating through buffer
    for (let i = 0; i < data.length; i += MAX_CHUNK) {
      const chunk = data.slice(i, i + MAX_CHUNK);
      
      // REAL IO: This Promise waits until the hardware acknowledges the packet
      await device.characteristic.writeValue(chunk);
      
      sent += chunk.length;
      if (onProgress) {
          const percent = Math.min(100, Math.round((sent / total) * 100));
          onProgress(percent);
      }
      
      // Safety delay for printer processing buffer
      await new Promise(r => setTimeout(r, 25)); 
    }
    
  } else if (device.type === 'usb') {
    if (!device.deviceInterface) throw new Error("USB Interface not found");
    
    const iface = device.deviceInterface.configuration.interfaces[0];
    const endpoint = iface.alternate.endpoints.find((ep: any) => ep.direction === 'out');
    const endpointNumber = endpoint ? endpoint.endpointNumber : 1;

    // REAL LOOP for USB
    for (let i = 0; i < data.length; i += MAX_CHUNK) {
        const chunk = data.slice(i, i + MAX_CHUNK);
        
        // REAL IO: WebUSB transferOut waits for transfer completion
        await device.deviceInterface.transferOut(endpointNumber, chunk);
        
        sent += chunk.length;
        if (onProgress) {
            const percent = Math.min(100, Math.round((sent / total) * 100));
            onProgress(percent);
        }
    }
  } else {
    throw new Error("Unsupported device type.");
  }
};

export const printReceipt = async (device: PrinterDevice, data: ReceiptData, options?: PrintOptions, onProgress?: (percent: number) => void) => {
  const encoder = new EscPosEncoder();
  encoder.initialize();
  if (options?.openCashDrawer) encoder.pulse();

  encoder.align('center');
  if (data.merchantLogo) {
     try {
       const imgData = await processImageForPrinter(data.merchantLogo, 250);
       encoder.addImageData(imgData.width, imgData.height, imgData.data);
       encoder.newline();
     } catch (e) { console.warn("Logo print failed", e); }
  }
  
  encoder.bold(true).size('large').text(data.merchantName).newline().size('normal').bold(false);
  if (data.merchantAddress) encoder.text(data.merchantAddress).newline();
  encoder.text(data.date).newline();
  encoder.text("-".repeat(32)).newline();

  encoder.align('left');
  data.items.forEach(item => {
     encoder.text(item.name).newline();
     const qtyPrice = `${item.qty}x${item.price.toLocaleString('id-ID')}`;
     const totalStr = (item.qty * item.price).toLocaleString('id-ID');
     const spaceNeeded = 32 - (qtyPrice.length + totalStr.length);
     encoder.text(qtyPrice + " ".repeat(Math.max(1, spaceNeeded)) + totalStr).newline();
  });
  encoder.text("-".repeat(32)).newline();

  encoder.align('right');
  if (data.discount > 0) encoder.text(`Diskon: -${data.discount.toLocaleString('id-ID')}`).newline();
  if (data.tax > 0) encoder.text(`Pajak: ${data.tax.toLocaleString('id-ID')}`).newline();
  encoder.bold(true).size('normal').text(`TOTAL: ${data.total.toLocaleString('id-ID')}`).newline();
  encoder.bold(false);
  
  if (data.showSignature) {
      encoder.newline();
      encoder.align('right');
      encoder.text(" ".repeat(10)).newline();
      encoder.text("_______________").newline();
      encoder.text(" Tanda Tangan  ").newline();
  }
  
  encoder.align('center').newline();
  if (data.footerMessage) encoder.text(data.footerMessage).newline();
  
  if (data.barcode) {
      encoder.newline();
      encoder.barcode(data.barcode);
      encoder.text(data.barcode).newline();
  }

  if (!data.removeFooter) {
    encoder.newline();
    encoder.align('center');
    encoder.size('normal');
    encoder.text("• Struk Di Cetak Via AltoPrint •").newline();
  }

  if (options?.autoCut !== false) encoder.cut();
  else encoder.newline(4);
  
  await sendDataToDevice(device, encoder.getUint8Array(), onProgress);
};

export const printImage = async (device: PrinterDevice, base64Image: string, onProgress?: (percent: number) => void) => {
    const encoder = new EscPosEncoder();
    encoder.align('center');
    try {
        const imgData = await processImageForPrinter(base64Image, 384);
        encoder.addImageData(imgData.width, imgData.height, imgData.data);
        encoder.cut();
        await sendDataToDevice(device, encoder.getUint8Array(), onProgress);
    } catch (e) {
        throw new Error("Gagal memproses gambar: " + e);
    }
};

export const testPrint = async (device: PrinterDevice, onProgress?: (percent: number) => void) => {
    const encoder = new EscPosEncoder();
    encoder.initialize();
    
    encoder.align('center');
    encoder.bold(true).size('large').text("ALTOPRINT CAFE").newline();
    encoder.size('normal').bold(false).text("Jl. Teknologi No. 88, Jakarta").newline();
    encoder.text("Telp: 0812-3456-7890").newline();
    encoder.text("--------------------------------").newline();

    encoder.align('left');
    encoder.text("Tanggal : " + new Date().toLocaleString('id-ID')).newline();
    encoder.text("Kasir   : Admin Demo").newline();
    encoder.text("Device  : " + device.name.substring(0, 15)).newline();
    encoder.text("--------------------------------").newline();

    encoder.text("Item              Qty      Harga").newline();
    encoder.text("Kopi Susu Gula     1      18.000").newline();
    encoder.text("Roti Bakar Keju    2      24.000").newline();
    encoder.text("Teh Manis Dingin   1       5.000").newline();
    encoder.text("--------------------------------").newline();

    encoder.align('right');
    encoder.text("Subtotal:     47.000").newline();
    encoder.text("Pajak (10%):   4.700").newline();
    encoder.bold(true).size('normal').text("TOTAL:    51.700").newline().bold(false);
    
    encoder.newline();
    encoder.align('center');
    encoder.text("* CONTOH STRUK TESTING *").newline();
    encoder.text("Terima Kasih atas kunjungan Anda").newline();
    encoder.text("Simpan struk ini sebagai bukti.").newline();
    
    encoder.newline();
    encoder.barcode("1234567890"); 
    encoder.text("1234567890").newline();
    
    encoder.newline();
    encoder.size('normal');
    encoder.text("• Struk Di Cetak Via AltoPrint •").newline();

    encoder.cut();
    await sendDataToDevice(device, encoder.getUint8Array(), onProgress);
};