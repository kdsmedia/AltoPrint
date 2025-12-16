import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, ShoppingBag, AlertTriangle, FileUp, Image as ImageIcon, FileText, QrCode, ScanBarcode, Settings2, Eye, X, ScanLine, Copy, RotateCcw, Store, Percent, SlidersHorizontal, ChevronDown, Check, Palette, ScrollText, Sparkles, Wand2, Upload, LayoutTemplate, PenLine, Save, Layout, Download, Lock, Crown, Eraser, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import ReceiptPreview from './ReceiptPreview';
import { ReceiptData, ReceiptItem, PrinterDevice, PrintMode, PAPER_SIZES, PaperSize, ReceiptStyle, ReceiptTemplate, PrintOptions } from '../types';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Html5QrcodeScanner } from "html5-qrcode";
import { generateReceiptFromText } from '../services/geminiService';
import { printReceipt, printImage } from '../services/printerService';

interface SmartComposeProps {
  connectedDevice: PrinterDevice | null;
  initialMode?: PrintMode;
  settings: any; // Using any for simplicity as Settings type is implicit in App state
  isPremium?: boolean; // New prop
  onUpgrade?: () => void; // Trigger for upgrade modal
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  onShowConfirm: (title: string, desc: string, onConfirm: () => void) => void;
}

const SC_TRANSLATIONS = {
  id: {
    tabs: { receipt: 'Struk', image: 'Gambar', qr: 'QR', barcode: 'Barcode', scan: 'Scan' },
    editor: {
      title: 'Editor Struk',
      items: 'Barang',
      aiBtn: 'Magic Import AI',
      templatesBtn: 'Template Tersimpan',
      merchantBtn: 'Info Toko',
      aiHintTitle: 'Coba Magic Import!',
      aiHintDesc: 'Tempel teks pesanan dari WhatsApp, biar AI yang ketik.',
      addItem: 'TAMBAH BARANG',
      total: 'Total Pembayaran',
      toggleSig: 'Toggle Signature Line',
      uploadImg: 'Upload Gambar',
      uploadDesc: 'JPG, PNG supported',
      colorPrint: 'Cetak Berwarna',
      colorDesc: 'Untuk printer Inkjet/Laser',
      qrContent: 'Konten QR',
      barcodeContent: 'Isi Barcode',
      advSettings: 'Pengaturan Lanjutan',
      topLabel: 'Label Atas',
      showText: 'Tampilkan teks konten di bawah QR',
      barcodeFmt: 'Format Barcode',
      scannerInactive: 'Scanner Inaktif',
      startCamera: 'Mulai Kamera',
      scanSuccess: 'Berhasil Dipindai!',
      copy: 'Salin',
      scanAgain: 'Scan Lagi',
      preview: 'Preview',
      printNow: 'Cetak Sekarang',
      printing: 'Mencetak...',
      printToDevice: 'CETAK KE PRINTER',
      ready: 'Ready',
      disconnected: 'Printer Disconnected',
      phName: 'Nama Barang',
      phQty: 'QTY',
      phRp: 'RP',
      lockedFeature: 'Fitur Premium',
      upgradeReq: 'Upgrade untuk akses'
    },
    modals: {
      previewTitle: 'Preview Cetak',
      aiTitle: 'Magic Import AI',
      aiDesc: 'Tempel chat pesanan, biar AI yang buat struknya.',
      aiPlaceholder: 'Contoh: Pesanan untuk Budi. 2 Nasi Goreng (25rb), 1 Es Teh (5rb). Diskon 10% ya.',
      processAI: 'Proses dengan AI',
      processing: 'Sedang Menyulap...',
      shopInfo: 'Info Toko',
      shopName: 'Nama Toko',
      address: 'Alamat / Kontak',
      footerMsg: 'Pesan Footer',
      style: 'Gaya Struk',
      sigLine: 'Kolom TTD',
      shopLogo: 'Logo Toko',
      logoHint: 'Upload logo hitam putih untuk hasil terbaik.',
      removeLogo: 'Hapus Logo',
      saveChanges: 'Simpan Perubahan',
      taxDisc: 'Pajak & Diskon',
      enableTax: 'Aktifkan Pajak (PPN)',
      enableDisc: 'Diskon Global',
      savedTemplates: 'Template Tersimpan',
      saveCurrent: 'Simpan Struk Saat Ini',
      phTemplate: 'Nama Template (mis: Warung Makan)',
      noTemplates: 'Belum ada template tersimpan.',
      premiumLimit: 'Batas Template Tercapai (Free: 1)',
      removeWatermark: 'Hapus Watermark Aplikasi',
      upgradeNow: 'Upgrade ke Pro'
    },
    printStatus: {
        printing: 'Sedang Mencetak',
        sending: 'Mengirim Data...',
        success: 'Cetak Selesai!',
        failed: 'Gagal Mencetak',
        disconnected: 'Koneksi Terputus',
        error: 'Terjadi Kesalahan',
        retry: 'Coba Lagi'
    },
    toast: {
        copySuccess: 'Teks berhasil disalin!',
        saveSuccess: 'Template tersimpan!',
        imgError: 'Mohon unggah file gambar (JPG, PNG).',
        aiError: 'Gagal memproses dengan AI. Coba lagi.',
        noData: 'Tidak ada data untuk dicetak.',
    },
    confirm: {
        deleteTitle: 'Hapus Template',
        deleteDesc: 'Apakah Anda yakin ingin menghapus template ini?',
        yes: 'Ya, Hapus',
        no: 'Batal'
    }
  },
  en: {
    tabs: { receipt: 'Receipt', image: 'Image', qr: 'QR', barcode: 'Barcode', scan: 'Scan' },
    editor: {
      title: 'Receipt Editor',
      items: 'Items',
      aiBtn: 'Magic Import AI',
      templatesBtn: 'Saved Templates',
      merchantBtn: 'Shop Info',
      aiHintTitle: 'Try Magic Import!',
      aiHintDesc: 'Paste order text from WhatsApp, let AI type it out.',
      addItem: 'ADD ITEM',
      total: 'Total Payment',
      toggleSig: 'Toggle Signature Line',
      uploadImg: 'Upload Image',
      uploadDesc: 'JPG, PNG supported',
      colorPrint: 'Color Print',
      colorDesc: 'For Inkjet/Laser printers',
      qrContent: 'QR Content',
      barcodeContent: 'Barcode Content',
      advSettings: 'Advanced Settings',
      topLabel: 'Top Label',
      showText: 'Show text below QR',
      barcodeFmt: 'Barcode Format',
      scannerInactive: 'Scanner Inactive',
      startCamera: 'Start Camera',
      scanSuccess: 'Scan Successful!',
      copy: 'Copy',
      scanAgain: 'Scan Again',
      preview: 'Preview',
      printNow: 'Print Now',
      printing: 'Printing...',
      printToDevice: 'PRINT TO DEVICE',
      ready: 'Ready',
      disconnected: 'Printer Disconnected',
      phName: 'Item Name',
      phQty: 'QTY',
      phRp: 'PRICE',
      lockedFeature: 'Premium Feature',
      upgradeReq: 'Upgrade to access'
    },
    modals: {
      previewTitle: 'Print Preview',
      aiTitle: 'Magic Import AI',
      aiDesc: 'Paste order chat, let AI build the receipt.',
      aiPlaceholder: 'Example: Order for John. 2 Fried Rice (25k), 1 Iced Tea (5k). 10% discount please.',
      processAI: 'Process with AI',
      processing: 'Doing Magic...',
      shopInfo: 'Shop Info',
      shopName: 'Shop Name',
      address: 'Address / Contact',
      footerMsg: 'Footer Message',
      style: 'Receipt Style',
      sigLine: 'Signature Line',
      shopLogo: 'Shop Logo',
      logoHint: 'Upload B&W logo for best results.',
      removeLogo: 'Remove Logo',
      saveChanges: 'Save Changes',
      taxDisc: 'Tax & Discount',
      enableTax: 'Enable Tax (VAT)',
      enableDisc: 'Global Discount',
      savedTemplates: 'Saved Templates',
      saveCurrent: 'Save Current Receipt',
      phTemplate: 'Template Name (e.g. Lunch Menu)',
      noTemplates: 'No templates saved yet.',
      premiumLimit: 'Template Limit Reached (Free: 1)',
      removeWatermark: 'Remove App Watermark',
      upgradeNow: 'Upgrade to Pro'
    },
    printStatus: {
        printing: 'Printing...',
        sending: 'Sending Data...',
        success: 'Print Finished!',
        failed: 'Print Failed',
        disconnected: 'Disconnected',
        error: 'An Error Occurred',
        retry: 'Retry'
    },
    toast: {
        copySuccess: 'Text copied successfully!',
        saveSuccess: 'Template saved!',
        imgError: 'Please upload an image file (JPG, PNG).',
        aiError: 'AI processing failed. Try again.',
        noData: 'No data to print.',
    },
    confirm: {
        deleteTitle: 'Delete Template',
        deleteDesc: 'Are you sure you want to delete this template?',
        yes: 'Yes, Delete',
        no: 'Cancel'
    }
  }
};

const SmartCompose: React.FC<SmartComposeProps> = ({ connectedDevice, initialMode = 'receipt', settings, isPremium = false, onUpgrade, onShowToast, onShowConfirm }) => {
  const [mode, setMode] = useState<PrintMode>(initialMode);
  const [selectedPaper, setSelectedPaper] = useState<PaperSize>(PAPER_SIZES[1]); // Default 80mm
  
  // Translation
  const langStr = (settings.language === 'en' ? 'en' : 'id');
  const t = SC_TRANSLATIONS[langStr];

  // --- Receipt State ---
  const [merchantName, setMerchantName] = useState('Toko Saya');
  const [merchantAddress, setMerchantAddress] = useState('Jl. Contoh No. 123, Jakarta');
  const [merchantLogo, setMerchantLogo] = useState<string | null>(null);
  const [footerMessage, setFooterMessage] = useState('Terima kasih atas kunjungan Anda!');
  const [receiptStyle, setReceiptStyle] = useState<ReceiptStyle>('classic');
  const [showSignature, setShowSignature] = useState(false);
  const [removeFooter, setRemoveFooter] = useState(false); // Premium feature state
  
  const [items, setItems] = useState<ReceiptItem[]>([
    { name: 'Contoh Produk A', qty: 1, price: 15000 },
    { name: 'Contoh Produk B', qty: 2, price: 5000 },
  ]);
  
  // Tax & Discount State
  const [enableTax, setEnableTax] = useState(false);
  const [taxRate, setTaxRate] = useState(10); // Percent
  
  const [enableDiscount, setEnableDiscount] = useState(false);
  const [discountRate, setDiscountRate] = useState(0); // Percent

  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // --- Templates State ---
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // --- Image Import State ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [enableColor, setEnableColor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- QR & Barcode State ---
  const [qrContent, setQrContent] = useState('');
  const [qrLabel, setQrLabel] = useState('');
  const [showQrText, setShowQrText] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const [showQrSettings, setShowQrSettings] = useState(false); // Toggle for QR settings

  const [barcodeContent, setBarcodeContent] = useState('');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [generatedBarcode, setGeneratedBarcode] = useState<string | null>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  // --- Scan State ---
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);

  // --- UI Toggles ---
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMerchantSettings, setShowMerchantSettings] = useState(false);
  const [showCalcSettings, setShowCalcSettings] = useState(false);
  
  // --- AI State ---
  const [showAIMagic, setShowAIMagic] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // --- PRINT PROGRESS STATE ---
  type PrintStatus = 'idle' | 'printing' | 'success' | 'error';
  const [printStatus, setPrintStatus] = useState<PrintStatus>('idle');
  const [printProgress, setPrintProgress] = useState(0);
  const [printErrorMessage, setPrintErrorMessage] = useState('');

  // Helper currency
  const formatRp = (value: number) => new Intl.NumberFormat(langStr === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: langStr === 'id' ? 'IDR' : 'USD', minimumFractionDigits: 0 }).format(value);

  // --- Effects (Same Logic) ---
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = enableDiscount ? subtotal * (discountRate / 100) : 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = enableTax ? taxableAmount * (taxRate / 100) : 0;
    const total = taxableAmount + taxAmount;

    const data: ReceiptData = {
      merchantName,
      merchantAddress,
      merchantLogo: merchantLogo || undefined,
      date: new Date().toLocaleString(langStr === 'id' ? 'id-ID' : 'en-US'),
      items,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      footerMessage,
      barcode: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      style: receiptStyle,
      showSignature,
      removeFooter: isPremium && removeFooter // Only apply if premium
    };
    setReceiptData(data);
  }, [merchantName, merchantAddress, merchantLogo, footerMessage, items, taxRate, enableTax, discountRate, enableDiscount, receiptStyle, showSignature, langStr, removeFooter, isPremium]);

  // Load Templates
  useEffect(() => {
    const saved = localStorage.getItem('altoprint_templates');
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
  }, []);

  const saveTemplatesToStorage = (newTemplates: ReceiptTemplate[]) => {
      localStorage.setItem('altoprint_templates', JSON.stringify(newTemplates));
      setTemplates(newTemplates);
  }

  useEffect(() => {
    const generateQr = async () => {
      if (!qrContent.trim()) {
        setGeneratedQr(null); return;
      }
      try {
        const canvas = document.createElement('canvas');
        const size = 300; const padding = 20; const labelHeight = qrLabel ? 40 : 0; const textHeight = showQrText ? 24 : 0;
        canvas.width = size; canvas.height = size + labelHeight + textHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            const qrDataUrl = await QRCode.toDataURL(qrContent, { margin: 2, width: size - (padding * 2) });
            const qrImage = new Image(); qrImage.src = qrDataUrl;
            qrImage.onload = () => {
                ctx.drawImage(qrImage, padding, padding + (labelHeight > 0 ? 10 : 0));
                if (qrLabel) { ctx.fillStyle = '#000000'; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'; ctx.fillText(qrLabel, size / 2, 35); }
                if (showQrText) { ctx.fillStyle = '#333333'; ctx.font = '12px monospace'; ctx.textAlign = 'center'; const displaySafeText = qrContent.length > 35 ? qrContent.substring(0, 32) + '...' : qrContent; ctx.fillText(displaySafeText, size / 2, canvas.height - 12); }
                setGeneratedQr(canvas.toDataURL());
            };
        }
      } catch (err) { console.error("QR Error", err); }
    };
    const timeout = setTimeout(generateQr, 500); return () => clearTimeout(timeout);
  }, [qrContent, qrLabel, showQrText]);

  useEffect(() => {
    if (!barcodeContent.trim() || !barcodeCanvasRef.current) { setGeneratedBarcode(null); return; }
    try {
        JsBarcode(barcodeCanvasRef.current, barcodeContent, { format: barcodeFormat, width: 2, height: 80, displayValue: true, margin: 10, fontSize: 14, textMargin: 5 });
        setGeneratedBarcode(barcodeCanvasRef.current.toDataURL());
    } catch (e) { setGeneratedBarcode(null); }
  }, [barcodeContent, barcodeFormat]);

  useEffect(() => {
    let scanner: any = null;
    if (mode === 'scan' && !scannedResult && isScannerActive) {
       const timer = setTimeout(() => {
          try {
              // @ts-ignore
              scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
              scanner.render((decodedText: string) => { setScannedResult(decodedText); scanner.clear(); setIsScannerActive(false); }, (error: any) => {});
          } catch (e) { console.error("Scanner init error", e); }
       }, 300);
       return () => { clearTimeout(timer); if (scanner) try { scanner.clear(); } catch(e) {} };
    }
    return () => { if (scanner) try { scanner.clear(); } catch(e) {} };
  }, [mode, scannedResult, isScannerActive]);

  // --- Handlers ---
  const handleAddItem = () => setItems([...items, { name: '', qty: 1, price: 0 }]);
  const handleUpdateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...items]; 
    // @ts-ignore
    newItems[index] = { ...newItems[index], [field]: value }; setItems(newItems);
  };
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { onShowToast(t.toast.imgError, 'error'); return; }
      setImageName(file.name); const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target?.result as string); reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setMerchantLogo(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Template Handlers
  const handleSaveTemplate = () => {
    if (!isPremium && templates.length >= 1) return; // UI already handles visual feedback for limit

    if(!newTemplateName.trim()) return;
    const newTemplate: ReceiptTemplate = {
        id: Date.now().toString(),
        name: newTemplateName,
        merchantName,
        merchantAddress,
        merchantLogo,
        footerMessage,
        items,
        enableTax,
        taxRate,
        enableDiscount,
        discountRate,
        receiptStyle,
        showSignature
    };
    saveTemplatesToStorage([...templates, newTemplate]);
    setNewTemplateName('');
    setIsSavingTemplate(false);
    onShowToast(t.toast.saveSuccess, 'success');
  };

  const handleLoadTemplate = (t: ReceiptTemplate) => {
      setMerchantName(t.merchantName);
      setMerchantAddress(t.merchantAddress);
      setMerchantLogo(t.merchantLogo);
      setFooterMessage(t.footerMessage);
      setItems(t.items);
      setEnableTax(t.enableTax);
      setTaxRate(t.taxRate);
      setEnableDiscount(t.enableDiscount);
      setDiscountRate(t.discountRate);
      setReceiptStyle(t.receiptStyle);
      setShowSignature(t.showSignature);
      setShowTemplateModal(false);
  };

  const handleDeleteTemplate = (id: string) => {
      onShowConfirm(
          t.confirm.deleteTitle,
          t.confirm.deleteDesc,
          () => {
              saveTemplatesToStorage(templates.filter(t => t.id !== id));
              onShowConfirm('', '', () => {}); // Close (App.tsx handles close by setting show: false, but this is callback logic)
              // Actually, the App.tsx handles closing when "Yes" is clicked via the passed callback wrapper.
              // We just need to execute the logic.
          }
      );
  };

  const handleAIGenerate = async () => {
     if(!aiPrompt.trim()) return;
     setIsAiGenerating(true);
     try {
        const result = await generateReceiptFromText(aiPrompt);
        setMerchantName(result.merchantName);
        if(result.merchantAddress) setMerchantAddress(result.merchantAddress);
        setItems(result.items);
        if(result.footerMessage) setFooterMessage(result.footerMessage);
        
        setShowAIMagic(false);
        setAiPrompt('');
     } catch (error) {
        onShowToast(t.toast.aiError, 'error');
     } finally {
        setIsAiGenerating(false);
     }
  };

  // --- PRINT HANDLER UPDATED ---
  const handlePrint = async () => {
    if (!connectedDevice) return; 
    
    // Reset Print State
    setIsPrinting(true);
    setPrintStatus('printing');
    setPrintProgress(0);
    setPrintErrorMessage('');
    
    const printOptions: PrintOptions = {
        autoCut: settings.autoCut,
        openCashDrawer: settings.cashDrawer,
        density: settings.printDensity
    };
    
    try {
        const onProgress = (percent: number) => {
             setPrintProgress(percent);
        };

        if (mode === 'receipt' && receiptData) {
            await printReceipt(connectedDevice, receiptData, printOptions, onProgress);
        } else if (mode === 'image' && selectedImage) {
            await printImage(connectedDevice, selectedImage, onProgress);
        } else if (mode === 'qrcode' && generatedQr) {
            await printImage(connectedDevice, generatedQr, onProgress);
        } else if (mode === 'barcode' && generatedBarcode) {
            await printImage(connectedDevice, generatedBarcode, onProgress);
        } else {
            throw new Error(t.toast.noData);
        }
        
        setPrintStatus('success');
        
        setTimeout(() => {
            setIsPrinting(false);
            setPrintStatus('idle');
            setPrintProgress(0);
            setShowPreviewModal(false);
        }, 1500);

    } catch (error: any) {
        console.error(error);
        setPrintStatus('error');
        setPrintErrorMessage(error.message || t.printStatus.error);
    }
  };

  const closePrintOverlay = () => {
      if (printStatus === 'printing') return;
      setIsPrinting(false);
      setPrintStatus('idle');
  };

  const handleCopyToClipboard = () => { 
      if (scannedResult) { 
          navigator.clipboard.writeText(scannedResult); 
          onShowToast(t.toast.copySuccess, 'success');
      } 
  };
  const handleRescan = () => { setScannedResult(null); setIsScannerActive(true); };

  const canPrint = connectedDevice && !isPrinting && (
    (mode === 'receipt' && items.length > 0) || (mode === 'image' && selectedImage !== null) || (mode === 'qrcode' && generatedQr !== null) || (mode === 'barcode' && generatedBarcode !== null) || (mode === 'scan' && scannedResult !== null)
  );

  const Button3D = ({ onClick, disabled, className, children, color = 'brand' }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full py-3.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-100 flex items-center justify-center gap-2 active:top-1 active:shadow-btn-active disabled:opacity-60 disabled:cursor-not-allowed
        ${color === 'brand' 
            ? 'bg-brand-600 text-white shadow-btn-brand hover:bg-brand-500' 
            : 'bg-white text-slate-700 shadow-btn border border-slate-200 hover:bg-slate-50'}
        ${className}`}
    >
      {children}
    </button>
  );

  const inputClass = "w-full p-3 rounded-xl bg-slate-50 border-none shadow-inner-depth text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all placeholder:text-slate-400";

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-full">
        {/* Editor Section */}
        <div className="flex flex-col gap-6 lg:h-full lg:overflow-y-auto pr-2 pb-10">
          
          {/* 3D Tab Navigation */}
          <div className="bg-white/50 p-1.5 rounded-2xl shadow-inner-depth flex overflow-x-auto gap-1 shrink-0 scrollbar-hide">
            {[
              { id: 'receipt', icon: FileText, label: t.tabs.receipt },
              { id: 'image', icon: FileUp, label: t.tabs.image },
              { id: 'qrcode', icon: QrCode, label: t.tabs.qr },
              { id: 'barcode', icon: ScanBarcode, label: t.tabs.barcode },
              { id: 'scan', icon: ScanLine, label: t.tabs.scan },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as PrintMode)}
                className={`flex-none py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap
                  ${mode === tab.id ? 'bg-white text-brand-600 shadow-3d scale-[1.02]' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Card Content */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-3d border border-white/60 flex-1 relative overflow-hidden flex flex-col">
             {/* Decor */}
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl z-0"></div>

             <div className="relative z-10 flex-1 flex flex-col">
                
                {/* Mode: Create Receipt */}
                {mode === 'receipt' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-100 p-2 rounded-xl">
                                <ShoppingBag className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-800 leading-none">{t.editor.title}</h2>
                                <p className="text-[10px] text-slate-400 font-bold">{items.length} {t.editor.items} • {merchantName}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* AI Button - Premium Logic */}
                            <button 
                                onClick={() => isPremium ? setShowAIMagic(true) : onUpgrade?.()} 
                                className={`p-2 rounded-xl shadow-lg transition-transform hover:scale-105 group relative
                                    ${isPremium ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30' : 'bg-slate-100 text-slate-400'}`} 
                                title={t.editor.aiBtn}
                            >
                                {isPremium ? <Wand2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                {!isPremium && <div className="absolute -top-1 -right-1 bg-amber-400 w-3 h-3 rounded-full border border-white"></div>}
                            </button>
                            <button onClick={() => setShowTemplateModal(true)} className="p-2 bg-slate-50 hover:bg-brand-50 text-slate-500 hover:text-brand-600 rounded-xl border border-slate-200 transition-colors shadow-sm" title={t.editor.templatesBtn}>
                                <Layout className="w-5 h-5" />
                            </button>
                            <button onClick={() => setShowMerchantSettings(true)} className="p-2 bg-slate-50 hover:bg-brand-50 text-slate-500 hover:text-brand-600 rounded-xl border border-slate-200 transition-colors shadow-sm" title={t.editor.merchantBtn}>
                                <Store className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* AI Magic Hint (If empty) */}
                    {items.length === 0 && (
                        <div onClick={() => isPremium ? setShowAIMagic(true) : onUpgrade?.()} className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group">
                            {!isPremium && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10"><Lock className="w-6 h-6 text-slate-400" /></div>}
                            <div className="bg-white p-2 rounded-lg text-purple-600 shadow-sm">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-purple-800">{t.editor.aiHintTitle} {isPremium ? '' : '(Pro)'}</h4>
                                <p className="text-[10px] text-purple-600 font-medium">{t.editor.aiHintDesc}</p>
                            </div>
                        </div>
                    )}

                    {/* Compact Item List */}
                    <div className="flex-1 space-y-2 min-h-[200px] pr-1">
                        {items.map((item, idx) => (
                        <div key={idx} className="animate-in zoom-in-95 duration-200 bg-surface p-2.5 rounded-xl shadow-sm border border-slate-100 group hover:border-brand-200 transition-colors">
                            <div className="flex gap-2 items-center">
                                <div className="flex-1 min-w-0">
                                    <input type="text" placeholder={t.editor.phName} value={item.name} onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-300 mb-1" />
                                    <div className="flex gap-2 text-xs">
                                        <div className="flex items-center bg-white rounded-md px-1 border border-slate-100">
                                            <span className="text-[9px] font-bold text-slate-400 mr-1">{t.editor.phQty}</span>
                                            <input type="number" min="1" value={item.qty} onChange={(e) => handleUpdateItem(idx, 'qty', parseInt(e.target.value) || 0)}
                                            className="w-8 text-center font-bold text-slate-600 outline-none" />
                                        </div>
                                        <div className="flex-1 flex items-center bg-white rounded-md px-1 border border-slate-100">
                                            <span className="text-[9px] font-bold text-slate-400 mr-1">{t.editor.phRp}</span>
                                            <input type="number" min="0" value={item.price} onChange={(e) => handleUpdateItem(idx, 'price', parseInt(e.target.value) || 0)}
                                            className="w-full font-bold text-slate-600 outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleRemoveItem(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        ))}
                    </div>
                    
                    <button onClick={handleAddItem} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> {t.editor.addItem}
                    </button>

                    {/* 3D Summary Box (Simplified) */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 rounded-2xl shadow-xl shadow-slate-500/30 relative overflow-hidden shrink-0 mt-2">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                             <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">{t.editor.total}</span>
                                    <span className="text-2xl font-black tracking-tight">{receiptData ? formatRp(receiptData.total) : '0'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowSignature(!showSignature)} 
                                        className={`p-2 rounded-xl transition-colors border border-white/5 ${showSignature ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                                        title={t.editor.toggleSig}
                                    >
                                        <PenLine className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setShowCalcSettings(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-slate-300 hover:text-white border border-white/5">
                                        <Percent className="w-5 h-5" />
                                    </button>
                                </div>
                             </div>

                             {(enableDiscount || enableTax) && (
                                <div className="text-[10px] text-slate-400 bg-black/20 p-2 rounded-lg flex gap-3">
                                    {enableDiscount && <span>Disc: {discountRate}%</span>}
                                    {enableTax && <span>Tax: {taxRate}%</span>}
                                </div>
                             )}
                        </div>
                    </div>
                </div>
                )}

                {/* Mode: Image Upload */}
                {mode === 'image' && (
                  <div className="flex flex-col h-full animate-in fade-in zoom-in-95">
                      <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
                        <div onClick={() => fileInputRef.current?.click()} 
                            className="group w-full h-full min-h-[200px] border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 hover:bg-brand-50 hover:border-brand-300 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-brand-500/5 scale-0 group-hover:scale-100 rounded-full transition-transform duration-500"></div>
                            <div className="bg-white p-4 rounded-2xl shadow-lg mb-4 group-hover:-translate-y-2 transition-transform duration-300 relative z-10">
                                <FileUp className="w-8 h-8 text-brand-500" />
                            </div>
                            <h3 className="font-bold text-slate-800 relative z-10">{t.editor.uploadImg}</h3>
                            <p className="text-sm text-slate-500 relative z-10">{t.editor.uploadDesc}</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                      </div>
                      
                      <div className="space-y-3 mt-6">
                        {imageName && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm">
                                <ImageIcon className="w-4 h-4" /> {imageName}
                            </div>
                        )}
                        
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${enableColor ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-500'}`}>
                                    <Palette className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">{t.editor.colorPrint}</p>
                                    <p className="text-[10px] text-slate-400">{t.editor.colorDesc}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={enableColor} onChange={(e) => setEnableColor(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                            </label>
                        </div>
                      </div>
                  </div>
                )}
                
                {/* Mode: QR & Barcode */}
                {(mode === 'qrcode' || mode === 'barcode') && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">
                                    {mode === 'qrcode' ? t.editor.qrContent : t.editor.barcodeContent}
                                </label>
                                <input 
                                    type="text" 
                                    value={mode === 'qrcode' ? qrContent : barcodeContent}
                                    onChange={(e) => mode === 'qrcode' ? setQrContent(e.target.value) : setBarcodeContent(e.target.value)}
                                    placeholder={mode === 'qrcode' ? "https://website.com" : "1234567890"}
                                    className={inputClass}
                                />
                            </div>

                            {mode === 'qrcode' && (
                                <>
                                    <div onClick={() => setShowQrSettings(!showQrSettings)} className="flex items-center gap-2 text-xs font-bold text-brand-600 cursor-pointer hover:underline p-1">
                                        <Settings2 className="w-3 h-3" /> {t.editor.advSettings}
                                    </div>
                                    
                                    {showQrSettings && (
                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 border border-slate-100">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{t.editor.topLabel}</label>
                                                <input type="text" value={qrLabel} onChange={(e) => setQrLabel(e.target.value)} placeholder="Contoh: SCAN ME" className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={showQrText} onChange={(e) => setShowQrText(e.target.checked)} id="showQrText" />
                                                <label htmlFor="showQrText" className="text-xs font-bold text-slate-600">{t.editor.showText}</label>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {mode === 'barcode' && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">{t.editor.barcodeFmt}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['CODE128', 'EAN13', 'UPC', 'CODE39'].map(fmt => (
                                            <button 
                                                key={fmt} 
                                                onClick={() => setBarcodeFormat(fmt)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${barcodeFormat === fmt ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                {fmt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Invisible canvas for generation */}
                        <canvas ref={barcodeCanvasRef} className="hidden"></canvas>
                    </div>
                )}

                {/* Mode: Scan */}
                {mode === 'scan' && (
                   <div className="h-full flex flex-col items-center justify-center p-4">
                        {!scannedResult ? (
                            <div className="w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden relative shadow-2xl">
                                {isScannerActive ? (
                                    <div id="reader" className="w-full h-full"></div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 bg-slate-900">
                                        <ScanLine className="w-16 h-16 mb-4 opacity-50" />
                                        <h3 className="font-bold text-lg mb-2">{t.editor.scannerInactive}</h3>
                                        <button onClick={() => setIsScannerActive(true)} className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-brand-600/30">
                                            {t.editor.startCamera}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full max-w-sm bg-white p-6 rounded-[2rem] shadow-3d border border-slate-100 text-center animate-in zoom-in-95">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{t.editor.scanSuccess}</h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 my-4 break-all font-mono text-sm text-slate-600">
                                    {scannedResult}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleCopyToClipboard} className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-2">
                                        <Copy className="w-4 h-4" /> {t.editor.copy}
                                    </button>
                                    <button onClick={handleRescan} className="py-2 px-4 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2">
                                        <RotateCcw className="w-4 h-4" /> {t.editor.scanAgain}
                                    </button>
                                </div>
                            </div>
                        )}
                   </div>
                )}
             </div>

             {/* Footer Actions (Mobile Only) */}
             <div className="lg:hidden mt-6 flex gap-3">
                <Button3D onClick={() => setShowPreviewModal(true)} color="white">
                   <Eye className="w-5 h-5" /> {t.editor.preview}
                </Button3D>
                <Button3D onClick={handlePrint} disabled={!canPrint || isPrinting} className="flex-1">
                   {isPrinting ? <span className="animate-spin mr-2">⏳</span> : <Printer className="w-5 h-5" />}
                   {isPrinting ? t.editor.printing : t.editor.printNow}
                </Button3D>
             </div>
          </div>
        </div>

        {/* Preview Section (Desktop) */}
        <div className="hidden lg:flex flex-col h-full bg-slate-100 rounded-[2rem] p-8 relative overflow-hidden shadow-inner-depth justify-center items-center">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/50 p-1 rounded-xl backdrop-blur-sm z-20">
                 {PAPER_SIZES.map(size => (
                     <button 
                        key={size.id} 
                        onClick={() => setSelectedPaper(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPaper.id === size.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                     >
                         {size.label}
                     </button>
                 ))}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 max-h-full w-full">
                <div className="flex-1 overflow-y-auto w-full flex items-center justify-center py-8">
                    <div className="scale-[0.85] origin-center shadow-2xl transition-transform duration-500 hover:scale-[0.9]">
                        <ReceiptPreview 
                            data={receiptData}
                            imageData={selectedImage}
                            mode={mode}
                            loading={isAiGenerating}
                            scanResult={scannedResult}
                            paperSize={selectedPaper}
                            isColor={enableColor}
                            headerFont={settings.headerFont} // Pass Header Font
                            bodyFont={settings.bodyFont}     // Pass Body Font
                            language={langStr}
                        />
                    </div>
                </div>

                <div className="w-full max-w-md">
                    <Button3D onClick={handlePrint} disabled={!canPrint || isPrinting} className="w-full py-4 text-lg">
                        {isPrinting ? <span className="animate-spin mr-2">⏳</span> : <Printer className="w-6 h-6" />}
                        {isPrinting ? t.editor.printing : t.editor.printToDevice}
                    </Button3D>
                    <p className="text-center text-slate-400 text-xs font-bold mt-3 uppercase tracking-widest">
                        {connectedDevice ? `${t.editor.ready}: ${connectedDevice.name}` : t.editor.disconnected}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Preview Modal (Mobile) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowPreviewModal(false)}></div>
           <div className="bg-slate-100 w-full sm:max-w-md h-[90vh] sm:h-auto sm:rounded-[2rem] rounded-t-[2rem] relative z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
               <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
                   <h3 className="font-black text-slate-800">{t.modals.previewTitle}</h3>
                   <button onClick={() => setShowPreviewModal(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100">
                   <div className="shadow-2xl">
                        <ReceiptPreview 
                            data={receiptData}
                            imageData={selectedImage}
                            mode={mode}
                            loading={isAiGenerating}
                            scanResult={scannedResult}
                            paperSize={selectedPaper}
                            isColor={enableColor}
                            headerFont={settings.headerFont}
                            bodyFont={settings.bodyFont}
                            language={langStr}
                        />
                   </div>
               </div>
               <div className="p-4 bg-white border-t border-slate-200">
                   <Button3D onClick={handlePrint} disabled={!canPrint || isPrinting}>
                      {isPrinting ? t.editor.printing : t.editor.printNow}
                   </Button3D>
               </div>
           </div>
        </div>
      )}

      {/* 2. PRINT STATUS OVERLAY (Custom UI) */}
      {(isPrinting || printStatus !== 'idle') && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-in fade-in" onClick={closePrintOverlay}></div>
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 p-8 text-center border border-white/20">
                
                {/* IDLE / PRINTING STATE */}
                {printStatus === 'printing' && (
                    <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                            <div 
                                className="absolute inset-0 border-[6px] border-brand-600 rounded-full border-t-transparent animate-spin"
                                style={{ strokeLinecap: 'round' }}
                            ></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-black text-2xl text-slate-800">{printProgress}%</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">{t.printStatus.printing}</h3>
                        <p className="text-slate-400 font-medium text-sm mb-6 animate-pulse">{t.printStatus.sending}</p>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2 shadow-inner">
                             <div 
                                className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-200 ease-out rounded-full"
                                style={{ width: `${printProgress}%` }}
                             ></div>
                        </div>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {printStatus === 'success' && (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300 py-4">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-green-200 shadow-xl border-4 border-white">
                            <CheckCircle2 className="w-12 h-12 stroke-[3px]" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">{t.printStatus.success}</h3>
                    </div>
                )}

                {/* ERROR STATE */}
                {printStatus === 'error' && (
                    <div className="flex flex-col items-center animate-in shake duration-300">
                        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-red-200 shadow-xl border-4 border-white">
                            <XCircle className="w-12 h-12 stroke-[3px]" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">{t.printStatus.failed}</h3>
                        <p className="text-red-500 font-bold text-xs mb-6 bg-red-50 px-4 py-3 rounded-xl border border-red-100 w-full break-words">
                            {printErrorMessage}
                        </p>
                        <button onClick={closePrintOverlay} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-colors">
                            {langStr === 'id' ? 'Tutup' : 'Close'}
                        </button>
                    </div>
                )}
            </div>
         </div>
      )}

      {/* 3. AI Magic Modal */}
      {showAIMagic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowAIMagic(false)}></div>
              <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
                      <Sparkles className="w-12 h-12 absolute -top-2 -right-2 text-white/20" />
                      <Wand2 className="w-10 h-10 mx-auto mb-2 text-white" />
                      <h3 className="font-black text-xl">{t.modals.aiTitle}</h3>
                      <p className="text-purple-100 text-sm">{t.modals.aiDesc}</p>
                  </div>
                  <div className="p-6">
                      <textarea 
                          className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-4"
                          placeholder={t.modals.aiPlaceholder}
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                      ></textarea>
                      <button 
                          onClick={handleAIGenerate}
                          disabled={isAiGenerating || !aiPrompt.trim()}
                          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                          {isAiGenerating ? <span className="animate-spin">✨</span> : <Sparkles className="w-5 h-5" />}
                          {isAiGenerating ? t.modals.processing : t.modals.processAI}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 4. Merchant & Settings Modal */}
      {showMerchantSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowMerchantSettings(false)}></div>
               <div className="bg-white w-full max-w-md rounded-[2rem] shadow-3d relative z-10 animate-in slide-in-from-bottom-8 overflow-hidden max-h-[90vh] flex flex-col">
                   <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                       <h3 className="font-black text-slate-800 flex items-center gap-2"><Store className="w-5 h-5 text-brand-600" /> {t.modals.shopInfo}</h3>
                       <button onClick={() => setShowMerchantSettings(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
                   </div>
                   <div className="p-6 overflow-y-auto space-y-4">
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t.modals.shopName}</label>
                           <input type="text" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} className={inputClass} />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t.modals.address}</label>
                           <textarea value={merchantAddress} onChange={(e) => setMerchantAddress(e.target.value)} rows={2} className={inputClass} />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t.modals.footerMsg}</label>
                           <textarea value={footerMessage} onChange={(e) => setFooterMessage(e.target.value)} rows={2} className={inputClass} />
                       </div>
                       
                       <div className={`p-4 rounded-xl border ${isPremium ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 opacity-80'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Eraser className="w-4 h-4 text-amber-600" /> {t.modals.removeWatermark}
                                </label>
                                {isPremium ? (
                                    <input type="checkbox" checked={removeFooter} onChange={(e) => setRemoveFooter(e.target.checked)} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                                ) : (
                                    <button onClick={onUpgrade} className="text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> PRO
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-500">Menghapus footer "• Struk Di Cetak Via AltoPrint •" dari struk fisik.</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t.modals.style}</label>
                               <select value={receiptStyle} onChange={(e) => setReceiptStyle(e.target.value as ReceiptStyle)} className={inputClass}>
                                   <option value="modern">Modern</option>
                                   <option value="classic">Classic</option>
                                   <option value="minimal">Minimal</option>
                               </select>
                           </div>
                           <div className="flex items-center gap-2 mt-6">
                               <input type="checkbox" id="sig" checked={showSignature} onChange={(e) => setShowSignature(e.target.checked)} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500" />
                               <label htmlFor="sig" className="text-sm font-bold text-slate-700">{t.modals.sigLine}</label>
                           </div>
                       </div>

                       <div>
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">{t.modals.shopLogo}</label>
                           <div className="flex items-center gap-4">
                               <div onClick={() => logoInputRef.current?.click()} className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors bg-slate-50 overflow-hidden">
                                   {merchantLogo ? <img src={merchantLogo} className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-slate-400" />}
                               </div>
                               <div className="flex-1">
                                   <p className="text-xs text-slate-500 mb-2">{t.modals.logoHint}</p>
                                   {merchantLogo && <button onClick={() => setMerchantLogo(null)} className="text-red-500 text-xs font-bold hover:underline">{t.modals.removeLogo}</button>}
                               </div>
                           </div>
                           <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                       </div>
                   </div>
                   <div className="p-4 border-t border-slate-100 bg-slate-50">
                       <Button3D onClick={() => setShowMerchantSettings(false)}>{t.modals.saveChanges}</Button3D>
                   </div>
               </div>
          </div>
      )}

      {/* 5. Calculator/Tax Settings Modal */}
      {showCalcSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowCalcSettings(false)}></div>
              <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-3d relative z-10 animate-in zoom-in-95 p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-slate-800 text-lg">{t.modals.taxDisc}</h3>
                      <button onClick={() => setShowCalcSettings(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="space-y-6">
                      {/* Tax Toggle */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-slate-700 text-sm">{t.modals.enableTax}</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={enableTax} onChange={(e) => setEnableTax(e.target.checked)} className="sr-only peer" />
                                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                              </label>
                          </div>
                          {enableTax && (
                              <div className="flex items-center gap-2">
                                  <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-20 p-2 rounded-lg border border-slate-200 text-center font-bold text-sm" />
                                  <span className="text-sm font-bold text-slate-500">%</span>
                              </div>
                          )}
                      </div>

                      {/* Discount Toggle */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-slate-700 text-sm">{t.modals.enableDisc}</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={enableDiscount} onChange={(e) => setEnableDiscount(e.target.checked)} className="sr-only peer" />
                                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                              </label>
                          </div>
                          {enableDiscount && (
                              <div className="flex items-center gap-2">
                                  <input type="number" value={discountRate} onChange={(e) => setDiscountRate(Number(e.target.value))} className="w-20 p-2 rounded-lg border border-slate-200 text-center font-bold text-sm" />
                                  <span className="text-sm font-bold text-slate-500">%</span>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 6. Template Modal */}
      {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowTemplateModal(false)}></div>
              <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-3d relative z-10 animate-in slide-in-from-bottom-4 flex flex-col max-h-[85vh] overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-black text-slate-800 flex items-center gap-2"><Layout className="w-5 h-5 text-brand-600" /> {t.modals.savedTemplates}</h3>
                      <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-4 bg-slate-50/50 flex-1">
                      {/* Save New Section */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex justify-between">
                            {t.modals.saveCurrent}
                            <span className={!isPremium && templates.length >= 1 ? 'text-red-500' : 'text-green-600'}>
                                {templates.length} / {isPremium ? '∞' : '1'}
                            </span>
                          </h4>
                          
                          {(!isPremium && templates.length >= 1) ? (
                              <div onClick={onUpgrade} className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors">
                                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                                      <Lock className="w-4 h-4" /> {t.modals.premiumLimit}
                                  </div>
                                  <button className="bg-amber-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">{t.modals.upgradeNow}</button>
                              </div>
                          ) : (
                              <div className="flex gap-2">
                                  <input 
                                      type="text" 
                                      placeholder={t.modals.phTemplate} 
                                      value={newTemplateName}
                                      onChange={(e) => setNewTemplateName(e.target.value)}
                                      className="flex-1 p-2 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500"
                                  />
                                  <button onClick={handleSaveTemplate} disabled={!newTemplateName.trim()} className="bg-brand-600 text-white px-4 rounded-lg font-bold text-sm disabled:opacity-50">
                                      <Save className="w-4 h-4" />
                                  </button>
                              </div>
                          )}
                      </div>

                      {/* List */}
                      <div className="space-y-2">
                          {templates.length === 0 ? (
                              <div className="text-center py-8 text-slate-400">
                                  <Layout className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                  <p className="text-sm font-medium">{t.modals.noTemplates}</p>
                              </div>
                          ) : (
                              templates.map(t => (
                                  <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-brand-300 transition-all shadow-sm">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold">
                                              {t.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-slate-800 text-sm">{t.name}</h4>
                                              <p className="text-[10px] text-slate-400">{t.items.length} Barang • {t.receiptStyle}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => handleLoadTemplate(t)} className="p-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100" title="Load">
                                              <Download className="w-4 h-4" />
                                          </button>
                                          <button onClick={() => handleDeleteTemplate(t.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete">
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </>
  );
};

export default SmartCompose;