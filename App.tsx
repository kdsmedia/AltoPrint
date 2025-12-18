import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PenTool, Settings, Printer as PrinterIcon, WifiOff, Signal, Zap, FileText, Clock, BarChart3, Moon, Sun, Scissors, Layers, Database, Globe, Smartphone, ChevronRight, HelpCircle, Shield, RotateCcw, Trash2, PlusCircle, ScanLine, Image, Wrench, TrendingUp, Battery, Thermometer, CheckCircle2, XCircle, ScrollText, Send, X, Type, Crown, Check, Star, Sparkles, AlertCircle, Loader2, Cpu, HardDrive, Radio } from 'lucide-react';
import { ConnectionStatus, PrinterDevice, AppView, PrintMode } from './types';
import DeviceManager from './components/DeviceManager';
import SmartCompose from './components/SmartCompose';

// --- TRANSLATIONS DICTIONARY ---
const TRANSLATIONS = {
  id: {
    sidebar: { editor: 'Smart Editor', dashboard: 'Dashboard', settings: 'Pengaturan', status: 'Status Koneksi', connected: 'Terhubung', disconnected: 'Terputus', noDevice: 'Tidak ada perangkat', upgrade: 'Upgrade Pro' },
    header: { create: 'Buat Struk', createDesc: 'Desain dan cetak struk profesional.', dashboard: 'Dashboard', dashboardDesc: 'Statistik pencetakan.', settings: 'Pengaturan', settingsDesc: 'Koneksi bluetooth & konfigurasi.' },
    premium: { title: 'Upgrade ke AltoPrint Pro', subtitle: 'Buka semua fitur canggih.', price: 'Rp 250.000', period: '/ 30 hari', feature1: 'Hapus Watermark', feature2: 'Magic AI Import', feature3: 'Template Tanpa Batas', feature4: 'Prioritas Support', cta: 'Langganan Sekarang', success: 'Berhasil!', active: 'Premium Aktif', expires: 'Berakhir: ' },
    dashboard: { welcome: 'Halo, Kasir! 👋', welcomeDesc: 'Printer siap digunakan.', dateLabel: 'Tanggal', quickActions: { receipt: 'Buat Struk', receiptDesc: 'Transaksi Baru', scan: 'Scan QR', scanDesc: 'Pindai & Salin', image: 'Cetak Gambar', imageDesc: 'Galeri / Kamera', test: 'Test Print', testDesc: 'Cek Hasil' }, stats: { total: 'Total Cetak', savings: 'Hemat Kertas', avg: 'Rata-rata' }, chartTitle: 'Statistik Mingguan', recentActivity: 'Aktivitas Terkini', deviceHealth: 'Status Perangkat', tipsTitle: 'Tips Hemat', tipsDesc: 'Atur margin struk seminimal mungkin.', manageDevice: 'Kelola Perangkat' },
    settings: { connection: 'Koneksi', printerPrefs: 'Preferensi Printer', autoCut: 'Auto Cut', autoCutDesc: 'Potong kertas otomatis', cashDrawer: 'Cash Drawer', cashDrawerDesc: 'Buka laci otomatis', density: 'Ketebalan', densityDesc: 'Kegelapan cetakan', appearance: 'Tampilan', headerFont: 'Font Judul', bodyFont: 'Font Isi', interface: 'Antarmuka', darkMode: 'Dark Mode', darkModeDesc: 'Tampilan gelap', haptic: 'Haptic Feedback', hapticDesc: 'Getaran tombol', language: 'Bahasa', languageDesc: 'Pilih bahasa', data: 'Data', clearCache: 'Bersihkan Cache', clearCacheDesc: 'Hapus riwayat', resetConfig: 'Reset Pengaturan', resetConfigDesc: 'Kembali ke default', info: 'Info', community: 'Komunitas Telegram', about: 'Tentang', privacy: 'Privasi', disclaimer: 'Disclaimer' },
    confirm: { clearTitle: 'Hapus Cache?', clearDesc: 'Ini akan menghapus semua riwayat.', resetTitle: 'Reset?', resetDesc: 'Kembali ke pengaturan awal.', yes: 'Lanjutkan', no: 'Batal' }
  },
  en: {
    sidebar: { editor: 'Smart Editor', dashboard: 'Dashboard', settings: 'Settings', status: 'Connection', connected: 'Connected', disconnected: 'Disconnected', noDevice: 'No device', upgrade: 'Upgrade Pro' },
    header: { create: 'Create Receipt', createDesc: 'Professional receipt design.', dashboard: 'Dashboard', dashboardDesc: 'Printing statistics.', settings: 'Settings', settingsDesc: 'Bluetooth & config.' },
    premium: { title: 'Upgrade to Pro', subtitle: 'Unlock all features.', price: 'Rp 250,000', period: '/ 30 days', feature1: 'Remove Watermark', feature2: 'AI Import', feature3: 'Unlimited Templates', feature4: 'Priority Support', cta: 'Subscribe Now', success: 'Success!', active: 'Premium Active', expires: 'Expires: ' },
    dashboard: { welcome: 'Hello, Cashier! 👋', welcomeDesc: 'Printer ready.', dateLabel: 'Date', quickActions: { receipt: 'Receipt', receiptDesc: 'New Transaction', scan: 'Scan QR', scanDesc: 'Scan & Copy', image: 'Image', imageDesc: 'Gallery', test: 'Test Print', testDesc: 'Check Output' }, stats: { total: 'Total Prints', savings: 'Paper Saved', avg: 'Average' }, chartTitle: 'Weekly Stats', recentActivity: 'Activity', deviceHealth: 'Device Status', tipsTitle: 'Tips', tipsDesc: 'Use minimum margins.', manageDevice: 'Manage' },
    settings: { connection: 'Connection', printerPrefs: 'Printer Prefs', autoCut: 'Auto Cut', autoCutDesc: 'Auto cut paper', cashDrawer: 'Cash Drawer', cashDrawerDesc: 'Auto open drawer', density: 'Density', densityDesc: 'Adjust darkness', appearance: 'Appearance', headerFont: 'Header Font', bodyFont: 'Body Font', interface: 'Interface', darkMode: 'Dark Mode', darkModeDesc: 'Dark theme', haptic: 'Haptic', hapticDesc: 'Vibration', language: 'Language', languageDesc: 'Select language', data: 'Data', clearCache: 'Clear Cache', clearCacheDesc: 'Remove history', resetConfig: 'Reset', resetConfigDesc: 'Default settings', info: 'Info', community: 'Community', about: 'About', privacy: 'Privacy', disclaimer: 'Disclaimer' },
    confirm: { clearTitle: 'Clear Cache?', clearDesc: 'Remove all history.', resetTitle: 'Reset?', resetDesc: 'Restore defaults.', yes: 'Proceed', no: 'Cancel' }
  }
};

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Memulai Sistem...');
  const [btStatus, setBtStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  useEffect(() => {
    const duration = 20000;
    const intervalTime = 50; 
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percentage = Math.min(100, (currentStep / steps) * 100);
      setProgress(percentage);

      if (currentStep === Math.floor(steps * 0.2)) {
         const nav = navigator as any;
         if (nav.bluetooth && typeof nav.bluetooth.getAvailability === 'function') {
            nav.bluetooth.getAvailability().then((available: boolean) => {
              setBtStatus(available ? 'active' : 'inactive');
            }).catch(() => setBtStatus('inactive'));
         } else {
            setBtStatus('inactive');
         }
      }

      if (percentage < 25) setLoadingText('Verifikasi Kernel...');
      else if (percentage < 45) setLoadingText('Inisialisasi Bluetooth...');
      else if (percentage < 70) setLoadingText('Memuat Driver POS...');
      else if (percentage < 95) setLoadingText('Menyiapkan UI Engine...');
      else setLoadingText('Siap!');

      if (currentStep >= steps) clearInterval(timer);
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[9999] flex flex-col items-center justify-center text-slate-200 select-none overflow-hidden">
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-900/30 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/30 rounded-full blur-[150px]"></div>
       </div>
       <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8">
          <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center shadow-2xl animate-float mb-12">
             <PrinterIcon className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-8 text-center">AltoPrint</h1>
          <div className="w-full grid grid-cols-3 gap-3 mb-8">
             <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                <Radio className={`w-4 h-4 ${btStatus === 'active' ? 'text-green-400' : 'text-slate-50'}`} />
                <span className="text-[8px] font-black uppercase text-slate-400">BT</span>
                <span className="text-[9px] font-bold">{btStatus === 'active' ? 'ON' : 'OFF'}</span>
             </div>
             <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-[8px] font-black uppercase text-slate-400">RAM</span>
                <span className="text-[9px] font-bold">OK</span>
             </div>
             <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[8px] font-black uppercase text-slate-400">CPU</span>
                <span className="text-[9px] font-bold">OK</span>
             </div>
          </div>
          <div className="w-full space-y-4">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase">Inisialisasi</span>
                <span className="text-xl font-black text-white">{Math.round(progress)}%</span>
             </div>
             <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
             </div>
             <p className="text-xs font-bold text-slate-400 text-center animate-pulse">{loadingText}</p>
          </div>
       </div>
    </div>
  );
};

const SidebarItem = ({ view, icon: Icon, label, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold text-sm
      ${isActive 
        ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30' 
        : 'bg-white/50 text-slate-500 hover:bg-white hover:text-brand-600'}`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const BottomNavItem = ({ isActive, icon: Icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all duration-300 shadow-lg
      ${isActive 
        ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-500/40 -translate-y-4 scale-110' 
        : 'bg-white text-slate-400'}`}
  >
    <Icon className="w-6 h-6" />
  </button>
);

const QuickAction = ({ icon: Icon, label, desc, color, onClick }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  return (
    <button onClick={onClick} className={`p-4 rounded-2xl border border-transparent transition-all text-left hover:shadow-md active:scale-95 ${colors[color]}`}>
      <div className="bg-white p-2 w-fit rounded-xl shadow-sm mb-3"><Icon className="w-5 h-5" /></div>
      <h4 className="font-black text-sm mb-0.5">{label}</h4>
      <p className="text-[10px] font-bold opacity-70">{desc}</p>
    </button>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-[1.5rem] p-4 border border-white/60 shadow-sm">
    <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${color}-100 text-${color}-600`}><Icon className="w-5 h-5" /></div>
    <h4 className="text-2xl font-black text-slate-800">{value}</h4>
    <p className="text-xs font-bold text-slate-400">{label}</p>
  </div>
);

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.COMPOSE);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [device, setDevice] = useState<PrinterDevice | null>(null);
  const [composeMode, setComposeMode] = useState<PrintMode>('receipt');
  
  const [toastMessage, setToastMessage] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [confirmModal, setConfirmModal] = useState<{show: boolean, title: string, desc: string, onConfirm: () => void}>({ show: false, title: '', desc: '', onConfirm: () => {} });

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToastMessage({ msg, type });
      setTimeout(() => setToastMessage(null), 3000);
  };

  const [isPremium, setIsPremium] = useState(false);
  const [settings, setSettings] = useState({
      darkMode: false, autoCut: true, cashDrawer: false, haptic: true, paperWidth: '80mm', printDensity: 'normal', language: 'id', headerFont: 'Plus Jakarta Sans', bodyFont: 'JetBrains Mono'
  });

  const lang = (settings.language === 'en' ? 'en' : 'id');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 20000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <div className={`h-screen flex flex-col md:flex-row font-sans overflow-hidden transition-colors ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-[#f1f5f9] text-slate-900'}`}>
      
      {/* Mobile Top Header */}
      <div className="md:hidden p-4 bg-white border-b flex justify-between items-center z-30">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-2 rounded-xl text-white"><PrinterIcon className="w-5 h-5" /></div>
          <span className="font-extrabold text-lg">AltoPrint</span>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-full p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-glass border border-white h-full flex flex-col p-6">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-brand-600 p-3 rounded-2xl text-white shadow-xl rotate-3"><Zap className="w-7 h-7" /></div>
              <h1 className="font-extrabold text-xl">AltoPrint</h1>
            </div>
            <nav className="flex-1 space-y-3">
              <SidebarItem isActive={currentView === AppView.COMPOSE} view={AppView.COMPOSE} icon={PenTool} label={t.sidebar.editor} onClick={() => setCurrentView(AppView.COMPOSE)} />
              <SidebarItem isActive={currentView === AppView.DASHBOARD} view={AppView.DASHBOARD} icon={LayoutDashboard} label={t.sidebar.dashboard} onClick={() => setCurrentView(AppView.DASHBOARD)} />
              <SidebarItem isActive={currentView === AppView.SETTINGS} view={AppView.SETTINGS} icon={Settings} label={t.sidebar.settings} onClick={() => setCurrentView(AppView.SETTINGS)} />
            </nav>
            <div className="mt-auto bg-slate-900 rounded-3xl p-5 text-white">
                <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">{t.sidebar.status}</p>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${connectionStatus === ConnectionStatus.CONNECTED ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {connectionStatus === ConnectionStatus.CONNECTED ? <Signal className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    </div>
                    <span className="font-bold text-sm">{connectionStatus === ConnectionStatus.CONNECTED ? t.sidebar.connected : t.sidebar.disconnected}</span>
                </div>
            </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800">
                {currentView === AppView.COMPOSE && t.header.create}
                {currentView === AppView.DASHBOARD && t.header.dashboard}
                {currentView === AppView.SETTINGS && t.header.settings}
              </h2>
              <p className="text-slate-500 font-medium">
                {currentView === AppView.COMPOSE && t.header.createDesc}
                {currentView === AppView.DASHBOARD && t.header.dashboardDesc}
                {currentView === AppView.SETTINGS && t.header.settingsDesc}
              </p>
            </div>

            {currentView === AppView.DASHBOARD && (
              <div className="space-y-6">
                <div className="bg-slate-800 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <h2 className="text-3xl font-black mb-2">{t.dashboard.welcome}</h2>
                    <p className="text-slate-400">{t.dashboard.welcomeDesc}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickAction icon={PlusCircle} label={t.dashboard.quickActions.receipt} desc={t.dashboard.quickActions.receiptDesc} color="blue" onClick={() => { setComposeMode('receipt'); setCurrentView(AppView.COMPOSE); }} />
                    <QuickAction icon={ScanLine} label={t.dashboard.quickActions.scan} desc={t.dashboard.quickActions.scanDesc} color="purple" onClick={() => { setComposeMode('scan'); setCurrentView(AppView.COMPOSE); }} />
                    <QuickAction icon={Image} label={t.dashboard.quickActions.image} desc={t.dashboard.quickActions.imageDesc} color="pink" onClick={() => { setComposeMode('image'); setCurrentView(AppView.COMPOSE); }} />
                    <QuickAction icon={Wrench} label={t.dashboard.quickActions.test} desc={t.dashboard.quickActions.testDesc} color="orange" onClick={() => setCurrentView(AppView.SETTINGS)} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-3 gap-4">
                        <StatCard label={t.dashboard.stats.total} value="1,204" icon={PrinterIcon} color="blue" />
                        <StatCard label={t.dashboard.stats.savings} value="45m" icon={ScrollText} color="green" />
                        <StatCard label={t.dashboard.stats.avg} value="12/day" icon={TrendingUp} color="indigo" />
                    </div>
                </div>
              </div>
            )}

            {currentView === AppView.COMPOSE && (
                <SmartCompose 
                  connectedDevice={device} initialMode={composeMode} settings={settings} isPremium={isPremium} 
                  onShowToast={triggerToast} onShowConfirm={(t, d, c) => setConfirmModal({show: true, title: t, desc: d, onConfirm: c})} 
                />
            )}

            {currentView === AppView.SETTINGS && (
              <DeviceManager 
                status={connectionStatus} device={device} 
                onConnect={(d) => { setDevice(d); setConnectionStatus(ConnectionStatus.CONNECTED); }} 
                onDisconnect={() => { setDevice(null); setConnectionStatus(ConnectionStatus.DISCONNECTED); }} 
                language={settings.language} onShowToast={triggerToast} 
              />
            )}
        </div>
      </main>

      {/* Mobile Floating Bottom Nav */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-glass border border-white/40 p-2 flex justify-around items-center">
           <BottomNavItem isActive={currentView === AppView.COMPOSE} icon={PenTool} onClick={() => setCurrentView(AppView.COMPOSE)} />
           <BottomNavItem isActive={currentView === AppView.DASHBOARD} icon={LayoutDashboard} onClick={() => setCurrentView(AppView.DASHBOARD)} />
           <BottomNavItem isActive={currentView === AppView.SETTINGS} icon={Settings} onClick={() => setCurrentView(AppView.SETTINGS)} />
        </div>
      </div>

      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-2">
              <div className={`px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm ${toastMessage.type === 'success' ? 'bg-slate-800 text-white' : 'bg-red-500 text-white'}`}>
                  {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-white" />}
                  {toastMessage.msg}
              </div>
          </div>
      )}
    </div>
  );
};

export default App;