
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  SCANNING = 'scanning',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export interface PrinterDevice {
  id: string;
  name: string;
  type: 'ble' | 'usb'; // Strictly physical devices only
  characteristic?: any; // BluetoothRemoteGATTCharacteristic
  deviceInterface?: any; // USBDevice Interface for WebUSB
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export type ReceiptStyle = 'modern' | 'classic' | 'minimal';

export interface ReceiptData {
  merchantName: string;
  merchantAddress?: string;
  merchantLogo?: string; // New: Logo Toko (Base64)
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number; // Diskon dalam nominal uang
  tax: number;      // Pajak dalam nominal uang
  total: number;
  footerMessage?: string;
  barcode?: string;
  style?: ReceiptStyle; // New: Gaya Struk
  showSignature?: boolean; // New: Tampilkan kolom tanda tangan
  removeFooter?: boolean; // PREMIUM: Remove app branding
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  merchantName: string;
  merchantAddress: string;
  merchantLogo: string | null;
  footerMessage: string;
  items: ReceiptItem[];
  enableTax: boolean;
  taxRate: number;
  enableDiscount: boolean;
  discountRate: number;
  receiptStyle: ReceiptStyle;
  showSignature: boolean;
}

export interface PrintOptions {
  autoCut: boolean;
  openCashDrawer: boolean;
  density?: 'light' | 'normal' | 'dark';
}

export type PrintMode = 'receipt' | 'image' | 'qrcode' | 'barcode' | 'scan';

export enum AppView {
  DASHBOARD = 'dashboard',
  COMPOSE = 'compose',
  SETTINGS = 'settings'
}

// --- Paper Size Configurations ---
export type PaperType = 'thermal' | 'standard';

export interface PaperSize {
  id: string;
  label: string;
  widthClass: string; // Tailwind class for preview width
  type: PaperType;
  description: string;
}

export const PAPER_SIZES: PaperSize[] = [
  // Thermal Options
  { id: '58mm', label: '58mm', widthClass: 'w-[240px]', type: 'thermal', description: 'Small Receipt' },
  { id: '80mm', label: '80mm', widthClass: 'w-[320px]', type: 'thermal', description: 'Standard POS' },
  
  // Standard Options (Scaled for preview context)
  { id: 'a6', label: 'A6', widthClass: 'w-[380px]', type: 'standard', description: 'Small Flyer' },
  { id: 'a5', label: 'A5', widthClass: 'w-[450px]', type: 'standard', description: 'Notebook Size' },
  { id: 'a4', label: 'A4', widthClass: 'w-[520px]', type: 'standard', description: 'Standard Document' },
];
