import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PenTool, Settings, Printer as PrinterIcon, WifiOff, Signal, Zap, FileText, Clock, BarChart3, Moon, Sun, Scissors, Layers, Database, Globe, Smartphone, ChevronRight, HelpCircle, Shield, RotateCcw, Trash2, PlusCircle, ScanLine, Image, Wrench, TrendingUp, Battery, Thermometer, CheckCircle2, XCircle, ScrollText, Usb, Cable, Info, FileWarning, Send, X, Type, Crown, Check, Star, Sparkles, AlertCircle, Loader2, Cpu, HardDrive, Radio } from 'lucide-react';
import { ConnectionStatus, PrinterDevice, AppView, PrintMode } from './types';
import DeviceManager from './components/DeviceManager';
import SmartCompose from './components/SmartCompose';

// --- TRANSLATIONS DICTIONARY ---
const TRANSLATIONS = {
  id: {
    sidebar: {
      editor: 'Smart Editor',
      dashboard: 'Dashboard',
      settings: 'Pengaturan',
      status: 'Status Koneksi',
      connected: 'Terhubung',
      disconnected: 'Terputus',
      noDevice: 'Tidak ada perangkat',
      upgrade: 'Upgrade Pro'
    },
    header: {
      create: 'Buat Struk',
      createDesc: 'Desain dan cetak struk profesional dalam hitungan detik.',
      dashboard: 'Dashboard',
      dashboardDesc: 'Ringkasan aktivitas dan statistik pencetakan.',
      settings: 'Pengaturan',
      settingsDesc: 'Kelola koneksi bluetooth dan konfigurasi aplikasi.'
    },
    premium: {
        title: 'Upgrade ke AltoPrint Pro',
        subtitle: 'Buka semua fitur canggih untuk bisnis Anda.',
        price: 'Rp 250.000',
        period: '/ 30 hari',
        feature1: 'Hapus Watermark "Printed via AltoPrint"',
        feature2: 'Magic AI Import (Unlimited)',
        feature3: 'Simpan Template Tanpa Batas',
        feature4: 'Prioritas Support',
        cta: 'Langganan Sekarang',
        success: 'Berlangganan Berhasil! Anda sekarang Premium.',
        active: 'Status Premium Aktif',
        expires: 'Berakhir pada: '
    },
    dashboard: {
      welcome: 'Halo, Kasir! 👋',
      welcomeDesc: 'Printer siap digunakan. Baterai printer aman dan koneksi stabil.',
      dateLabel: 'Tanggal',
      quickActions: {
        receipt: 'Buat Struk',
        receiptDesc: 'Transaksi Baru',
        scan: 'Scan QR',
        scanDesc: 'Pindai & Salin',
        image: 'Cetak Gambar',
        imageDesc: 'Galeri / Kamera',
        test: 'Test Print',
        testDesc: 'Cek Hasil Cetak'
      },
      stats: {
        total: 'Total Cetak',
        savings: 'Penghematan',
        avg: 'Rata-rata'
      },
      chartTitle: 'Statistik Mingguan',
      recentActivity: 'Aktivitas Terkini',
      deviceHealth: 'Status Perangkat',
      tipsTitle: 'Tips Hemat Kertas',
      tipsDesc: 'Gunakan fitur "Auto Cut" dengan bijak dan atur margin struk seminimal mungkin di pengaturan.',
      manageDevice: 'Kelola Perangkat'
    },
    settings: {
      connection: 'Koneksi',
      printerPrefs: 'Preferensi Printer',
      autoCut: 'Auto Cut Paper',
      autoCutDesc: 'Potong kertas otomatis setelah cetak selesai',
      cashDrawer: 'Cash Drawer',
      cashDrawerDesc: 'Buka laci uang otomatis (Kick-out)',
      density: 'Ketebalan Cetak (Density)',
      densityDesc: 'Mengatur seberapa gelap hasil cetakan',
      appearance: 'Tampilan Struk',
      headerFont: 'Font Judul (Header)',
      bodyFont: 'Font Isi (Body)',
      interface: 'Antarmuka Aplikasi',
      darkMode: 'Dark Mode',
      darkModeDesc: 'Tampilan gelap untuk kenyamanan mata',
      haptic: 'Haptic Feedback',
      hapticDesc: 'Getaran saat menekan tombol',
      language: 'Bahasa / Language',
      languageDesc: 'Pilih bahasa aplikasi',
      data: 'Data & Penyimpanan',
      clearCache: 'Bersihkan Cache & Riwayat',
      clearCacheDesc: 'Menghapus data sementara aplikasi',
      resetConfig: 'Reset Konfigurasi',
      resetConfigDesc: 'Kembalikan pengaturan ke awal',
      info: 'Informasi & Dukungan',
      community: 'Gabung Komunitas Telegram',
      about: 'Tentang Aplikasi',
      privacy: 'Kebijakan Privasi',
      disclaimer: 'Disclaimer'
    },
    confirm: {
        clearTitle: 'Hapus Cache?',
        clearDesc: 'Ini akan menghapus semua riwayat dan template yang tersimpan.',
        resetTitle: 'Reset Pengaturan?',
        resetDesc: 'Semua konfigurasi akan kembali ke default.',
        yes: 'Ya, Lanjutkan',
        no: 'Batal'
    }
  },
  en: {
    sidebar: {
      editor: 'Smart Editor',
      dashboard: 'Dashboard',
      settings: 'Settings',
      status: 'Connection Status',
      connected: 'Connected',
      disconnected: 'Disconnected',
      noDevice: 'No device',
      upgrade: 'Upgrade Pro'
    },
    header: {
      create: 'Create Receipt',
      createDesc: 'Design and print professional receipts in seconds.',
      dashboard: 'Dashboard',
      dashboardDesc: 'Activity summary and printing statistics.',
      settings: 'Settings',
      settingsDesc: 'Manage bluetooth connections and app configuration.'
    },
    premium: {
        title: 'Upgrade to AltoPrint Pro',
        subtitle: 'Unlock powerful features for your business.',
        price: 'Rp 250,000',
        period: '/ 30 days',
        feature1: 'Remove "Printed via AltoPrint" Watermark',
        feature2: 'Magic AI Import (Unlimited)',
        feature3: 'Unlimited Saved Templates',
        feature4: 'Priority Support',
        cta: 'Subscribe Now',
        success: 'Subscription Successful! You are now Premium.',
        active: 'Premium Active',
        expires: 'Expires on: '
    },
    dashboard: {
      welcome: 'Hello, Cashier! 👋',
      welcomeDesc: 'Printer is ready. Battery is safe and connection is stable.',
      dateLabel: 'Date',
      quickActions: {
        receipt: 'New Receipt',
        receiptDesc: 'New Transaction',
        scan: 'Scan QR',
        scanDesc: 'Scan & Copy',
        image: 'Print Image',
        imageDesc: 'Gallery / Camera',
        test: 'Test Print',
        testDesc: 'Check Output'
      },
      stats: {
        total: 'Total Prints',
        savings: 'Savings',
        avg: 'Average'
      },
      chartTitle: 'Weekly Statistics',
      recentActivity: 'Recent Activity',
      deviceHealth: 'Device Status',
      tipsTitle: 'Paper Saving Tips',
      tipsDesc: 'Use "Auto Cut" wisely and set receipt margins to minimum in settings.',
      manageDevice: 'Manage Device'
    },
    settings: {
      connection: 'Connection',
      printerPrefs: 'Printer Preferences',
      autoCut: 'Auto Cut Paper',
      autoCutDesc: 'Automatically cut paper after printing',
      cashDrawer: 'Cash Drawer',
      cashDrawerDesc: 'Open cash drawer automatically (Kick-out)',
      density: 'Print Density',
      densityDesc: 'Adjust how dark the print output is',
      appearance: 'Receipt Appearance',
      headerFont: 'Header Font',
      bodyFont: 'Body Font',
      interface: 'App Interface',
      darkMode: 'Dark Mode',
      darkModeDesc: 'Dark theme for eye comfort',
      haptic: 'Haptic Feedback',
      hapticDesc: 'Vibration when pressing buttons',
      language: 'Bahasa / Language',
      languageDesc: 'Select application language',
      data: 'Data & Storage',
      clearCache: 'Clear Cache & History',
      clearCacheDesc: 'Remove temporary app data',
      resetConfig: 'Reset Configuration',
      resetConfigDesc: 'Restore default settings',
      info: 'Info & Support',
      community: 'Join Telegram Community',
      about: 'About App',
      privacy: 'Privacy Policy',
      disclaimer: 'Disclaimer'
    },
    confirm: {
        clearTitle: 'Clear Cache?',
        clearDesc: 'This will remove all saved history and templates.',
        resetTitle: 'Reset Settings?',
        resetDesc: 'All configurations will be restored to default.',
        yes: 'Yes, Proceed',
        no: 'Cancel'
    }
  }
};

// --- SPLASH SCREEN COMPONENT ---
const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Memulai Sistem AltoPrint...');
  const [btStatus, setBtStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  useEffect(() => {
    // 20 Seconds = 20000ms
    const duration = 20000;
    const intervalTime = 50; 
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percentage = Math.min(100, (currentStep / steps) * 100);
      setProgress(percentage);

      // AUTOMATIC BLUETOOTH "ACTIVATION" & STATUS CHECK
      if (currentStep === Math.floor(steps * 0.2)) {
         setLoadingText('Mendeteksi Hardware Bluetooth...');
         const nav = navigator as any;
         if (nav.bluetooth && typeof nav.bluetooth.getAvailability === 'function') {
            nav.bluetooth.getAvailability().then((available: boolean) => {
              if (available) {
                setBtStatus('active');
              } else {
                setBtStatus('inactive');
              }
            }).catch(() => setBtStatus('inactive'));
         } else {
            setBtStatus('inactive');
         }
      }

      // Dynamic sequence
      if (percentage < 10) setLoadingText('Verifikasi Integritas Kernel...');
      else if (percentage < 25) setLoadingText('Menginisialisasi Modul Bluetooth...');
      else if (percentage < 40) {
          if (btStatus === 'active') setLoadingText('Antarmuka Bluetooth Aktif (RFCOMM ready)...');
          else if (btStatus === 'inactive') setLoadingText('Peringatan: Bluetooth Tidak Ditemukan!');
          else setLoadingText('Menghubungkan ke Stack Bluetooth...');
      }
      else if (percentage < 55) setLoadingText('Sinkronisasi Database Template...');
      else if (percentage < 70) setLoadingText('Memuat Driver Printer ESC/POS v2.1...');
      else if (percentage < 85) setLoadingText('Menyiapkan UI Engine (PWA Core)...');
      else if (percentage < 95) setLoadingText('Hampir selesai, memvalidasi konfigurasi...');
      else setLoadingText('Aplikasi Siap Digunakan.');

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [btStatus]);

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[9999] flex flex-col items-center justify-center text-slate-200 select-none overflow-hidden">
       {/* Ambient Background Effects */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/30 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/30 rounded-full blur-[150px] animate-pulse"></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
       </div>

       <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8">
          {/* 3D Animated Logo Container */}
          <div className="relative mb-16">
             <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
             <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.3)] animate-float border border-white/10">
                <PrinterIcon className="w-14 h-14 text-white drop-shadow-lg" />
             </div>
             {/* Orbital Sync Animation */}
             <div className="absolute -inset-4 border-2 border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"></div>
             </div>
          </div>

          <div className="text-center mb-10">
              <h1 className="text-4xl font-black tracking-tighter text-white mb-2">AltoPrint</h1>
              <div className="flex items-center justify-center gap-2">
                 <div className="h-px w-8 bg-blue-500/50"></div>
                 <p className="text-[10px] font-bold tracking-[0.3em] text-blue-400 uppercase">Pro System v2.1</p>
                 <div className="h-px w-8 bg-blue-500/50"></div>
              </div>
          </div>

          {/* Hardware Status Indicators */}
          <div className="w-full grid grid-cols-3 gap-3 mb-8">
             <div className={`p-2.5 rounded-2xl bg-white/5 border flex flex-col items-center gap-1 transition-colors ${btStatus === 'active' ? 'border-green-500/30' : 'border-white/5'}`}>
                <Radio className={`w-4 h-4 ${btStatus === 'active' ? 'text-green-400' : 'text-slate-50'}`} />
                <span className="text-[8px] font-black uppercase text-slate-400">BT Stack</span>
                <span className={`text-[9px] font-bold ${btStatus === 'active' ? 'text-green-400' : 'text-slate-500'}`}>{btStatus === 'active' ? 'ONLINE' : btStatus === 'inactive' ? 'OFF' : '...'}</span>
             </div>
             <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-[8px] font-black uppercase text-slate-400">Memory</span>
                <span className="text-[9px] font-bold text-blue-400">98% OK</span>
             </div>
             <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[8px] font-black uppercase text-slate-400">Engine</span>
                <span className="text-[9px] font-bold text-amber-400">WARM</span>
             </div>
          </div>

          {/* Progress Section */}
          <div className="w-full space-y-4">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inisialisasi</span>
                <span className="text-xl font-black text-white">{Math.round(progress)}%</span>
             </div>
             
             <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden relative border border-white/5">
                <div 
                   className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full transition-all duration-150 ease-linear shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                   style={{ width: `${progress}%` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
             </div>

             <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                <p className="text-xs font-bold text-slate-400 text-center transition-all duration-300 min-h-[1.5em]">{loadingText}</p>
             </div>
          </div>
       </div>
       
       <div className="absolute bottom-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">
             <span>Secure Build</span>
             <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
             <span>UMKM Ecosystem</span>
          </div>
          <div className="text-[8px] text-slate-700 font-mono">Build ID: 0x88f219-ALTO-PRO-2025</div>
       </div>

       <style>{`
          @keyframes shimmer {
             100% { transform: translateX(100%); }
          }
       `}</style>
    </div>
  );
};

const App: React.FC = () => {
  // --- SPLASH SCREEN STATE ---
  const [isLoading, setIsLoading] = useState(true);

  // --- APP STATE ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.COMPOSE);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [device, setDevice] = useState<PrinterDevice | null>(null);
  const [composeMode, setComposeMode] = useState<PrintMode>('receipt');
  
  // --- UI STATES ---
  const [toastMessage, setToastMessage] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
      show: boolean;
      title: string;
      desc: string;
      onConfirm: () => void;
  }>({ show: false, title: '', desc: '', onConfirm: () => {} });

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToastMessage({ msg, type });
      setTimeout(() => setToastMessage(null), 3000);
  };

  const triggerConfirm = (title: string, desc: string, onConfirm: () => void) => {
      setConfirmModal({ show: true, title, desc, onConfirm });
  };

  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<'about' | 'privacy' | 'disclaimer' | null>(null);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('altoprint_settings');
    const defaultSettings = {
        darkMode: false,
        autoCut: true,
        cashDrawer: false,
        haptic: true,
        paperWidth: '80mm',
        printDensity: 'normal',
        language: 'id',
        headerFont: 'Plus Jakarta Sans',
        bodyFont: 'JetBrains Mono'
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      const premiumData = localStorage.getItem('altoprint_premium');
      if (premiumData) {
          const { expiry } = JSON.parse(premiumData);
          if (Date.now() < expiry) {
              setIsPremium(true);
              setPremiumExpiry(expiry);
          } else {
              setIsPremium(false);
              setPremiumExpiry(null);
              localStorage.removeItem('altoprint_premium');
          }
      }
  }, []);

  const handleSubscribe = () => {
      triggerHaptic();
      const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
      localStorage.setItem('altoprint_premium', JSON.stringify({ expiry }));
      setIsPremium(true);
      setPremiumExpiry(expiry);
      setShowPremiumModal(false);
      triggerToast(lang === 'id' ? TRANSLATIONS.id.premium.success : TRANSLATIONS.en.premium.success, 'success');
  };

  const lang = (settings.language === 'en' ? 'en' : 'id');
  const t = TRANSLATIONS[lang];

  const triggerHaptic = () => {
    if (settings.haptic && navigator.vibrate) {
        navigator.vibrate(10);
    }
  };

  useEffect(() => {
      localStorage.setItem('altoprint_settings', JSON.stringify(settings));
      if (settings.darkMode) {
          document.body.classList.add('bg-slate-900');
          document.body.classList.remove('bg-[#f1f5f9]');
      } else {
          document.body.classList.remove('bg-slate-900');
          document.body.classList.add('bg-[#f1f5f9]');
      }
  }, [settings]);

  const toggleSetting = (key: keyof typeof settings) => {
    triggerHaptic();
    // @ts-ignore
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = (key: keyof typeof settings, value: string) => {
    triggerHaptic();
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClearCache = () => {
      triggerHaptic();
      triggerConfirm(
          t.confirm.clearTitle,
          t.confirm.clearDesc,
          () => {
              localStorage.clear();
              window.location.reload();
          }
      );
  };

  const handleResetConfig = () => {
      triggerHaptic();
      triggerConfirm(
          t.confirm.resetTitle,
          t.confirm.resetDesc,
          () => {
               setSettings({
                    darkMode: false,
                    autoCut: true,
                    cashDrawer: false,
                    haptic: true,
                    paperWidth: '80mm',
                    printDensity: 'normal',
                    language: 'id',
                    headerFont: 'Plus Jakarta Sans',
                    bodyFont: 'JetBrains Mono'
               });
               triggerToast(lang === 'id' ? "Pengaturan direset." : "Settings reset.", 'success');
               setConfirmModal(prev => ({...prev, show: false}));
          }
      );
  };

  const handleConnect = (newDevice: PrinterDevice) => {
    triggerHaptic();
    setConnectionStatus(ConnectionStatus.CONNECTING);
    setTimeout(() => {
      setDevice(newDevice);
      setConnectionStatus(ConnectionStatus.CONNECTED);
    }, 1000);
  };

  const handleDisconnect = () => {
    triggerHaptic();
    setDevice(null);
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
  };

  const handleQuickAction = (mode: PrintMode) => {
    triggerHaptic();
    setComposeMode(mode);
    setCurrentView(AppView.COMPOSE);
  };

  const SidebarItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => { triggerHaptic(); setCurrentView(view); }}
      className={`w-full group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold text-sm overflow-hidden
        ${currentView === view 
          ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-brand-500/30 shadow-lg translate-x-2' 
          : 'bg-white/50 text-slate-500 hover:bg-white hover:text-brand-600 hover:shadow-md'}`}
    >
      <Icon className={`w-5 h-5 z-10 ${currentView === view ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
      <span className="z-10">{label}</span>
    </button>
  );

  const BottomNavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => { triggerHaptic(); setCurrentView(view); }}
        className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300
          ${isActive ? '-translate-y-4' : ''}`}
      >
        <div className={`p-3 rounded-2xl transition-all duration-300 shadow-lg
          ${isActive 
            ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-500/40 rotate-3 scale-110' 
            : 'bg-white text-slate-400 shadow-slate-200/50'}`}>
           <Icon className="w-6 h-6" />
        </div>
      </button>
    );
  };

  const SettingsToggle = ({ label, desc, active, onClick, icon: Icon, color = 'brand' }: any) => (
    <div onClick={onClick} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer active:scale-[0.98] transition-all hover:bg-white hover:shadow-sm group">
      <div className="flex items-center gap-4">
         <div className={`p-2 rounded-xl transition-colors ${active ? `bg-${color}-100 text-${color}-600` : 'bg-slate-200 text-slate-500'}`}>
            <Icon className="w-5 h-5" />
         </div>
         <div>
            <p className="font-bold text-slate-700 text-sm group-hover:text-brand-600 transition-colors">{label}</p>
            <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
         </div>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex ${active ? `bg-${color}-500 justify-end` : 'bg-slate-300 justify-start'}`}>
          <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
      </div>
    </div>
  );

  const InfoLink = ({ icon: Icon, label, onClick, color = 'slate' }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl bg-${color}-100 text-${color}-600`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm group-hover:text-brand-600 transition-colors">{label}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors" />
    </button>
  );

  const QuickAction = ({ icon: Icon, label, desc, color, onClick }: any) => {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100',
        pink: 'bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-100',
        orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100',
    };
    return (
        <button onClick={onClick} className={`p-4 rounded-2xl border transition-all text-left group active:scale-95 ${colorClasses[color]}`}>
            <div className="bg-white p-2 w-fit rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-5 h-5" />
            </div>
            <h4 className="font-black text-slate-800 text-sm mb-0.5">{label}</h4>
            <p className="text-[10px] font-bold opacity-70">{desc}</p>
        </button>
    )
  }

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
      <div className="bg-white rounded-[1.5rem] p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
          <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${color}-100 text-${color}-600`}>
              <Icon className="w-5 h-5" />
          </div>
          <h4 className="text-2xl font-black text-slate-800">{value}</h4>
          <p className="text-xs font-bold text-slate-400">{label}</p>
      </div>
  )

  const ActivityItem = ({ type, title, time, status }: any) => (
      <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs
             ${type === 'receipt' ? 'bg-blue-100 text-blue-600' : type === 'image' ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'}`}>
            {type === 'receipt' ? <FileText className="w-4 h-4"/> : type === 'image' ? <Image className="w-4 h-4"/> : <ScanLine className="w-4 h-4"/>}
         </div>
         <div className="flex-1">
            <p className="font-bold text-slate-800 text-sm">{title}</p>
            <p className="text-xs text-slate-400">{time}</p>
         </div>
         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1
             ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
             {status === 'success' ? 'Sukses' : 'Gagal'}
         </span>
      </div>
  )

  const StatusRow = ({ label, value, icon: Icon, color, bg, width }: any) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <Icon className={`w-3 h-3 ${color}`} /> {label}
            </div>
            <span className={`text-xs font-bold ${color}`}>{value}</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${bg}`} style={{ width }}></div>
        </div>
    </div>
  )

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className={`h-screen h-[100dvh] flex flex-col md:flex-row font-sans overflow-hidden transition-colors duration-300 ${settings.darkMode ? 'text-slate-100' : 'text-slate-900 bg-transparent'}`}>
      
      {/* Mobile Header */}
      <div className={`md:hidden backdrop-blur-md border-b p-4 flex justify-between items-center z-30 shrink-0 sticky top-0 shadow-sm
          ${settings.darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/70 border-white/20'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-2 rounded-xl shadow-lg shadow-brand-500/30">
            <PrinterIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className={`font-extrabold text-lg leading-none block ${settings.darkMode ? 'text-white' : 'text-slate-800'}`}>AltoPrint</span>
            <span className="text-[10px] font-bold text-brand-600 tracking-wider uppercase">Mobile</span>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border shadow-inner-depth
            ${connectionStatus === ConnectionStatus.CONNECTED 
              ? 'bg-green-100/50 text-green-700 border-green-200' 
              : settings.darkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100/50 text-slate-500 border-slate-200'}`}>
           <div className={`w-2 h-2 rounded-full ${connectionStatus === ConnectionStatus.CONNECTED ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-slate-400'}`}></div>
           {connectionStatus === ConnectionStatus.CONNECTED ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-full z-20 p-6">
        <div className={`backdrop-blur-xl rounded-[2.5rem] shadow-glass border h-full flex flex-col overflow-hidden relative
            ${settings.darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-white/50'}`}>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-brand-400/20 rounded-full blur-3xl"></div>
            
            <div className="p-8 flex items-center gap-4 mb-4 relative z-10">
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-3 rounded-2xl shadow-xl shadow-brand-500/30 transform rotate-3">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className={`font-extrabold text-xl tracking-tight ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>AltoPrint</h1>
                <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md ${settings.darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>Pro Controller</span>
              </div>
            </div>

            <nav className="flex-1 px-6 space-y-3 relative z-10">
              <SidebarItem view={AppView.COMPOSE} icon={PenTool} label={t.sidebar.editor} />
              <SidebarItem view={AppView.DASHBOARD} icon={LayoutDashboard} label={t.sidebar.dashboard} />
              <SidebarItem view={AppView.SETTINGS} icon={Settings} label={t.sidebar.settings} />
            </nav>

            <div className="px-6 mb-4 relative z-10">
                {!isPremium ? (
                     <button 
                        onClick={() => setShowPremiumModal(true)}
                        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white p-4 rounded-3xl shadow-lg shadow-orange-500/20 transform hover:scale-[1.02] transition-transform text-left relative overflow-hidden group"
                     >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-lg"></div>
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <Crown className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-sm uppercase tracking-wider">{t.sidebar.upgrade}</span>
                        </div>
                        <p className="text-[10px] font-medium text-white/90 relative z-10">Unlock whitelabel & AI features.</p>
                     </button>
                ) : (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-3xl shadow-lg shadow-emerald-500/20 text-center">
                        <div className="flex justify-center mb-2">
                            <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" />
                        </div>
                        <p className="font-black text-sm uppercase tracking-widest">{t.premium.active}</p>
                        <p className="text-[10px] opacity-80 mt-1">{t.premium.expires} {new Date(premiumExpiry || 0).toLocaleDateString()}</p>
                    </div>
                )}
            </div>

            <div className="p-6 relative z-10">
              <div className="bg-slate-900 rounded-3xl p-5 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20 transform transition-transform hover:scale-[1.02] duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <PrinterIcon className="w-20 h-20 transform rotate-12" />
                </div>
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.sidebar.status}</p>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${connectionStatus === ConnectionStatus.CONNECTED ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {connectionStatus === ConnectionStatus.CONNECTED ? <Signal className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="font-bold text-lg leading-tight">
                        {connectionStatus === ConnectionStatus.CONNECTED ? t.sidebar.connected : t.sidebar.disconnected}
                        </p>
                        <p className="text-[10px] text-slate-500">{device ? device.name.substring(0,15) : t.sidebar.noDevice}</p>
                    </div>
                </div>
              </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 scroll-smooth w-full">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 min-h-full flex flex-col">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4 shrink-0 mb-4 px-2">
              <div>
                <h2 className={`text-2xl md:text-4xl font-black tracking-tight ${settings.darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {currentView === AppView.COMPOSE && t.header.create}
                  {currentView === AppView.DASHBOARD && t.header.dashboard}
                  {currentView === AppView.SETTINGS && t.header.settings}
                </h2>
                <p className={`font-medium text-sm mt-1 ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {currentView === AppView.COMPOSE && t.header.createDesc}
                  {currentView === AppView.DASHBOARD && t.header.dashboardDesc}
                  {currentView === AppView.SETTINGS && t.header.settingsDesc}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                  {!isPremium && (
                      <button onClick={() => setShowPremiumModal(true)} className="md:hidden bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-amber-500/30 animate-pulse">
                          UPGRADE
                      </button>
                  )}
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 flex-1 flex flex-col relative">
               
               {currentView === AppView.DASHBOARD && (
                  <div className="space-y-6">
                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                          <div className="relative z-10">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h2 className="text-3xl font-black mb-2">{t.dashboard.welcome}</h2>
                                      <p className="text-slate-400 font-medium max-w-md">{t.dashboard.welcomeDesc}</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <QuickAction 
                              icon={PlusCircle} label={t.dashboard.quickActions.receipt} desc={t.dashboard.quickActions.receiptDesc} color="blue" 
                              onClick={() => handleQuickAction('receipt')} 
                          />
                          <QuickAction 
                              icon={ScanLine} label={t.dashboard.quickActions.scan} desc={t.dashboard.quickActions.scanDesc} color="purple" 
                              onClick={() => handleQuickAction('scan')} 
                          />
                          <QuickAction 
                              icon={Image} label={t.dashboard.quickActions.image} desc={t.dashboard.quickActions.imageDesc} color="pink" 
                              onClick={() => handleQuickAction('image')} 
                          />
                          <QuickAction 
                              icon={Wrench} label={t.dashboard.quickActions.test} desc={t.dashboard.quickActions.testDesc} color="orange" 
                              onClick={() => { setCurrentView(AppView.SETTINGS); }} 
                          />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-6">
                              <div className="grid grid-cols-3 gap-4">
                                  <StatCard label={t.dashboard.stats.total} value="1,204" icon={PrinterIcon} color="blue" />
                                  <StatCard label={t.dashboard.stats.savings} value="45m" icon={ScrollText} color="green" />
                                  <StatCard label={t.dashboard.stats.avg} value="~12/day" icon={BarChart3} color="indigo" />
                              </div>
                          </div>
                      </div>
                  </div>
               )}

               {currentView === AppView.COMPOSE && (
                  <div className="h-full flex-1 min-h-0">
                     <SmartCompose 
                        connectedDevice={device} 
                        initialMode={composeMode} 
                        settings={settings} 
                        key={composeMode}
                        isPremium={isPremium}
                        onUpgrade={() => setShowPremiumModal(true)}
                        onShowToast={triggerToast}
                        onShowConfirm={triggerConfirm}
                    />
                  </div>
               )}

               {currentView === AppView.SETTINGS && (
                  <div className="space-y-8 pb-20">
                    <DeviceManager 
                        status={connectionStatus} 
                        device={device} 
                        onConnect={handleConnect} 
                        onDisconnect={handleDisconnect}
                        language={settings.language}
                        onShowToast={triggerToast}
                    />
                  </div>
               )}
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-glass border border-white/40 p-2 flex justify-around items-center">
           <BottomNavItem view={AppView.COMPOSE} icon={PenTool} label={t.sidebar.editor} />
           <BottomNavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label={t.sidebar.dashboard} />
           <BottomNavItem view={AppView.SETTINGS} icon={Settings} label={t.sidebar.settings} />
        </div>
      </div>

      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in">
              <div className={`px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm
                  ${toastMessage.type === 'success' ? 'bg-slate-800 text-white' : 'bg-red-500 text-white'}`}>
                  {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-white" />}
                  {toastMessage.msg}
              </div>
          </div>
      )}

    </div>
  );
};

export default App;