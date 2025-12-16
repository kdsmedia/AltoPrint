import React from 'react';
import { ReceiptData, PrintMode, PaperSize } from '../types';
import { ImageIcon, QrCode, ScanBarcode, ScanLine, Scissors } from 'lucide-react';

interface ReceiptPreviewProps {
  data: ReceiptData | null;
  imageData: string | null;
  mode: PrintMode;
  loading: boolean;
  scanResult?: string;
  paperSize?: PaperSize;
  isColor?: boolean;
  headerFont?: string;
  bodyFont?: string;
  language?: string;
}

const RP_TRANSLATIONS = {
    id: {
        scanResult: 'HASIL SCAN',
        readyScan: 'Siap Memindai',
        enterQr: 'Masukkan Teks untuk QR',
        enterCode: 'Masukkan Kode Barcode',
        noImage: 'Tidak Ada Gambar',
        startEdit: 'Mulai Mengedit',
        item: 'Item',
        qty: 'Jml',
        price: 'Harga',
        subtotal: 'Subtotal',
        disc: 'Diskon',
        tax: 'Pajak',
        total: 'TOTAL',
        sig: 'Tanda Tangan',
        footer: '• Struk Di Cetak Via AltoPrint •'
    },
    en: {
        scanResult: 'SCAN RESULT',
        readyScan: 'Ready to Scan',
        enterQr: 'Enter Text for QR',
        enterCode: 'Enter Barcode Text',
        noImage: 'No Image',
        startEdit: 'Start Editing',
        item: 'Item',
        qty: 'Qty',
        price: 'Price',
        subtotal: 'Subtotal',
        disc: 'Discount',
        tax: 'Tax',
        total: 'TOTAL',
        sig: 'Signature',
        footer: '• Printed Via AltoPrint •'
    }
};

const formatCurrency = (value: number, lang: string) => {
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: lang === 'id' ? 'IDR' : 'USD' }).format(value);
};

const CutLine = () => (
  <div className="flex items-center gap-2 py-3 select-none text-slate-300 opacity-60 w-full my-1">
    <div className="h-px border-t-2 border-dashed border-current flex-1"></div>
    <Scissors className="w-4 h-4 transform rotate-180" />
    <div className="h-px border-t-2 border-dashed border-current flex-1"></div>
  </div>
);

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ 
  data, 
  imageData, 
  mode, 
  loading, 
  scanResult, 
  paperSize, 
  isColor = false,
  headerFont = 'Plus Jakarta Sans',
  bodyFont = 'JetBrains Mono',
  language = 'id'
}) => {
  // Dynamic Styles based on Paper Type
  const widthClass = paperSize?.widthClass || 'w-[320px]'; // Default to 80mm size if undefined
  const isThermal = paperSize?.type !== 'standard'; // Default to thermal style
  
  const lang = (language === 'en' ? 'en' : 'id');
  const t = RP_TRANSLATIONS[lang];
  
  const paperContainerClass = `relative bg-white ${widthClass} p-6 text-slate-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border-t border-white/50 
    ${isThermal ? 'tear-paper rotate-1 lg:rotate-0' : 'min-h-[500px] rounded-sm shadow-2xl'} 
    transition-all duration-500 hover:rotate-0`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 border-8 border-brand-100 border-t-brand-500 rounded-full animate-spin mb-6"></div>
        <p className="text-slate-400 font-bold tracking-wider animate-pulse">RENDERING...</p>
      </div>
    );
  }

  // --- Scan Result Mode ---
  if (mode === 'scan') {
    if (!scanResult) return <EmptyState icon={ScanLine} text={t.readyScan} />;
    return (
      <div className={paperContainerClass} style={{ fontFamily: bodyFont }}>
           <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-slate-100 to-transparent opacity-50"></div>
           {isThermal && <CutLine />}
           <div className="text-center mb-6 mt-2" style={{ fontFamily: headerFont }}>
             <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">{t.scanResult}</h2>
             <p className="text-xs font-mono text-slate-400 mt-1">{new Date().toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
           </div>
           
           <div className="py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center break-words text-sm font-bold text-slate-700">
             {scanResult}
           </div>

           <div className="mt-8 text-center mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.footer}</p>
           </div>
           {isThermal && <CutLine />}
      </div>
    );
  }

  // --- Image / QR / Barcode Mode ---
  if (mode === 'image' || mode === 'qrcode' || mode === 'barcode') {
    if (!imageData) {
       const Icon = mode === 'qrcode' ? QrCode : mode === 'barcode' ? ScanBarcode : ImageIcon;
       const txt = mode === 'qrcode' ? t.enterQr : mode === 'barcode' ? t.enterCode : t.noImage;
       return <EmptyState icon={Icon} text={txt} />;
    }

    // Tentukan class gambar berdasarkan mode warna
    const imgClasses = mode === 'image' && isColor 
        ? 'mix-blend-multiply brightness-105' // Color Mode: Blend with paper, enhance slightly
        : (mode === 'image' ? 'filter grayscale contrast-125 sepia-[0.2]' : 'mix-blend-multiply'); // BW Mode: Thermal look

    return (
      <div className={`${paperContainerClass} flex flex-col items-center`}>
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white to-transparent z-10 opacity-50 pointer-events-none"></div>
          {isThermal && <CutLine />}
          
          <div className="flex-1 w-full flex items-center justify-center py-6 relative z-0">
            <img 
                src={imageData} 
                alt="Print Preview" 
                className={`w-full h-auto object-contain max-h-[400px] drop-shadow-md ${imgClasses}`} 
            />
          </div>
          
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ fontFamily: bodyFont }}>{t.footer}</p>
          {isThermal && <CutLine />}
      </div>
    );
  }

  // --- Receipt Mode ---
  if (!data) return <EmptyState icon={ImageIcon} text={t.startEdit} />;

  const style = data.style || 'classic';

  return (
      <div className={`${paperContainerClass}`}>
        {/* Subtle Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}></div>

        {isThermal && <CutLine />}

        {/* Header - Uses Header Font */}
        <div className={`text-center mb-6 mt-2 relative z-10 ${style === 'modern' ? 'border-b-2 border-black pb-4' : ''}`} style={{ fontFamily: headerFont }}>
          {data.merchantLogo && (
              <div className="mb-3 flex justify-center">
                  <img src={data.merchantLogo} alt="Logo" className="h-12 w-auto object-contain mix-blend-multiply grayscale contrast-125" />
              </div>
          )}
          <h2 className={`text-2xl font-black uppercase mb-1 tracking-tight text-slate-900`}>{data.merchantName}</h2>
          {data.merchantAddress && <p className="text-slate-500 text-xs font-medium mb-1 px-4 leading-relaxed">{data.merchantAddress}</p>}
          <p className="text-slate-400 text-[10px] mt-2" style={{ fontFamily: bodyFont }}>{data.date}</p>
        </div>

        {/* Body - Uses Body Font */}
        <div style={{ fontFamily: bodyFont }}>
          {/* Items */}
          <div className="space-y-3 mb-6 text-xs relative z-10">
            <div className={`flex font-bold text-slate-400 uppercase text-[10px] ${style === 'classic' ? 'border-b-2 border-slate-100 pb-2 mb-2' : 'bg-slate-50 p-2 rounded mb-2'}`}>
              <span className="flex-1">{t.item}</span>
              <span className="w-8 text-center">{t.qty}</span>
              <span className="w-20 text-right">{t.price}</span>
            </div>
            {data.items.map((item, idx) => (
              <div key={idx} className={`flex justify-between items-start ${style === 'modern' ? 'py-1 border-b border-dashed border-slate-200' : ''}`}>
                <span className="flex-1 font-bold text-slate-800 pr-2">{item.name}</span>
                <span className="w-8 text-center text-slate-500">{item.qty}</span>
                <span className="w-24 text-right text-slate-700">{formatCurrency(item.price, lang)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className={`${style === 'modern' ? 'bg-slate-900 text-white p-4 rounded-xl' : 'bg-slate-50 p-4 rounded-lg border border-slate-100'} space-y-2 relative z-10`}>
            <div className={`flex justify-between text-xs ${style === 'modern' ? 'text-slate-300' : 'text-slate-500'}`}>
              <span>{t.subtotal}</span>
              <span>{formatCurrency(data.subtotal, lang)}</span>
            </div>
            
            {data.discount > 0 && (
              <div className={`flex justify-between text-xs ${style === 'modern' ? 'text-slate-300' : 'text-slate-500'}`}>
                <span>{t.disc}</span>
                <span className="text-red-400">- {formatCurrency(data.discount, lang)}</span>
              </div>
            )}

            {data.tax > 0 && (
              <div className={`flex justify-between text-xs ${style === 'modern' ? 'text-slate-300' : 'text-slate-500'}`}>
                <span>{t.tax}</span>
                <span>{formatCurrency(data.tax, lang)}</span>
              </div>
            )}
            
            <div className={`flex justify-between font-black text-xl mt-3 pt-3 border-t-2 border-dashed ${style === 'modern' ? 'border-white/20 text-white' : 'border-slate-200 text-slate-900'}`}>
              <span>{t.total}</span>
              <span>{formatCurrency(data.total, lang)}</span>
            </div>
          </div>

          {/* Signature Area (Optional) */}
          {data.showSignature && (
              <div className="mt-8 mb-4 flex justify-end">
                  <div className="text-center w-32">
                      <div className="h-16"></div>
                      <div className="border-t border-slate-400 pt-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{t.sig}</p>
                      </div>
                  </div>
              </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center mb-2 relative z-10">
            {data.footerMessage && <p className="mb-6 text-xs italic text-slate-500">"{data.footerMessage}"</p>}
            {data.barcode && (
              <div className="opacity-80 mix-blend-multiply">
                <div className="h-10 bg-slate-900 mx-auto w-4/5 mb-1 rounded-sm"></div>
                <p className="text-[10px] tracking-[0.3em]">{data.barcode}</p>
              </div>
            )}
            <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.footer}</p>
          </div>
        </div>

        {isThermal && <CutLine />}
      </div>
  );
};

// Helper for empty states
const EmptyState = ({ icon: Icon, text }: any) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-300">
        <Icon className="w-16 h-16 mb-4 opacity-50" />
        <p className="font-bold text-sm uppercase tracking-widest">{text}</p>
    </div>
);

export default ReceiptPreview;