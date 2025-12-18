import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PenTool, Settings, Printer as PrinterIcon, WifiOff, Signal, Zap, PlusCircle, ScanLine, Image as ImageIcon, Wrench, ScrollText, TrendingUp, CheckCircle2, AlertCircle, Radio, Cpu, Loader2 } from 'lucide-react';
import { ConnectionStatus, PrinterDevice, AppView, PrintMode } from './types';
import DeviceManager from './components/DeviceManager';
import SmartCompose from './components/SmartCompose';

const TRANSLATIONS: any = {
  id: {
    sidebar: { editor: 'Smart Editor', dashboard: 'Dashboard', settings: 'Pengaturan', connected: 'Terhubung', disconnected: 'Terputus' },
    header: { create: 'Buat Struk', dashboard: 'Dashboard', settings: 'Pengaturan' },
    dashboard: { welcome: 'Halo, Kasir! 👋', stats: { total: 'Total Cetak', savings: 'Hemat Kertas', avg: 'Rata-rata' } }
  },
  en: {
    sidebar: { editor: 'Smart Editor', dashboard: 'Dashboard', settings: 'Settings', connected: 'Connected', disconnected: 'Disconnected' },
    header: { create: 'Create Receipt', dashboard: 'Dashboard', settings: 'Settings' },
    dashboard: { welcome: 'Hello, Cashier! 👋', stats: { total: 'Total Prints', savings: 'Paper Saved', avg: 'Average' } }
  }
};

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 100));
    }, 180); // Total ~18-20 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[9999] flex flex-col items-center justify-center text-slate-200">
       <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center shadow-2xl animate-float mb-8">
          <PrinterIcon className="w-14 h-14 text-white" />
       </div>
       <h1 className="text-4xl font-black tracking-tighter text-white mb-10">AltoPrint</h1>
       <div className="w-full max-w-xs space-y-4">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs font-bold text-slate-400 text-center animate-pulse">Memuat Driver & Sistem... {progress}%</p>
       </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.COMPOSE);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [device, setDevice] = useState<PrinterDevice | null>(null);
  const [composeMode, setComposeMode] = useState<PrintMode>('receipt');
  
  const [toastMessage, setToastMessage] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 20000);
    return () => clearTimeout(timer);
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToastMessage({ msg, type });
      setTimeout(() => setToastMessage(null), 3000);
  };

  const [settings] = useState({
      darkMode: false, language: 'id', headerFont: 'Plus Jakarta Sans', bodyFont: 'JetBrains Mono', haptic: true, autoCut: true, cashDrawer: false, printDensity: 'normal'
  });

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.id;

  if (isLoading) return <SplashScreen />;

  return (
    <div className="h-screen flex flex-col md:flex-row font-sans overflow-hidden bg-[#f1f5f9]">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-full p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-glass border border-white h-full flex flex-col p-6">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-brand-600 p-3 rounded-2xl text-white shadow-xl rotate-3"><Zap className="w-7 h-7" /></div>
              <h1 className="font-extrabold text-xl">AltoPrint</h1>
            </div>
            <nav className="flex-1 space-y-3">
              <button onClick={() => setCurrentView(AppView.COMPOSE)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm ${currentView === AppView.COMPOSE ? 'bg-brand-600 text-white' : 'text-slate-500'}`}><PenTool className="w-5 h-5"/> {t.sidebar.editor}</button>
              <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm ${currentView === AppView.DASHBOARD ? 'bg-brand-600 text-white' : 'text-slate-500'}`}><LayoutDashboard className="w-5 h-5"/> {t.sidebar.dashboard}</button>
              <button onClick={() => setCurrentView(AppView.SETTINGS)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm ${currentView === AppView.SETTINGS ? 'bg-brand-600 text-white' : 'text-slate-500'}`}><Settings className="w-5 h-5"/> {t.sidebar.settings}</button>
            </nav>
            <div className="mt-auto bg-slate-900 rounded-3xl p-5 text-white">
                <div className="flex items-center gap-3">
                    <Signal className={`w-4 h-4 ${connectionStatus === ConnectionStatus.CONNECTED ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="font-bold text-sm">{connectionStatus === ConnectionStatus.CONNECTED ? t.sidebar.connected : t.sidebar.disconnected}</span>
                </div>
            </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-black text-slate-800">
                {currentView === AppView.COMPOSE && t.header.create}
                {currentView === AppView.DASHBOARD && t.header.dashboard}
                {currentView === AppView.SETTINGS && t.header.settings}
              </h2>
            </div>

            {currentView === AppView.DASHBOARD && (
              <div className="space-y-6">
                <div className="bg-slate-800 rounded-[2rem] p-8 text-white shadow-2xl">
                    <h2 className="text-3xl font-black mb-2">{t.dashboard.welcome}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => { setComposeMode('receipt'); setCurrentView(AppView.COMPOSE); }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                        <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><PlusCircle /></div>
                        <span className="font-bold text-sm">Struk Baru</span>
                    </button>
                    <button onClick={() => { setComposeMode('scan'); setCurrentView(AppView.COMPOSE); }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                        <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><ScanLine /></div>
                        <span className="font-bold text-sm">Scan QR</span>
                    </button>
                    <button onClick={() => { setComposeMode('image'); setCurrentView(AppView.COMPOSE); }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                        <div className="bg-pink-100 p-3 rounded-xl text-pink-600"><ImageIcon /></div>
                        <span className="font-bold text-sm">Cetak Foto</span>
                    </button>
                    <button onClick={() => setCurrentView(AppView.SETTINGS)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                        <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><Wrench /></div>
                        <span className="font-bold text-sm">Cek Printer</span>
                    </button>
                </div>
              </div>
            )}

            {currentView === AppView.COMPOSE && (
                <SmartCompose 
                  connectedDevice={device} initialMode={composeMode} settings={settings} onShowToast={triggerToast} onShowConfirm={() => {}} 
                />
            )}

            {currentView === AppView.SETTINGS && (
              <DeviceManager 
                status={connectionStatus} device={device} 
                onConnect={(d) => { setDevice(d); setConnectionStatus(ConnectionStatus.CONNECTED); }} 
                onDisconnect={() => { setDevice(null); setConnectionStatus(ConnectionStatus.DISCONNECTED); }} 
                onShowToast={triggerToast} 
              />
            )}
        </div>
      </main>

      {/* Mobile Floating Bottom Nav */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-glass border border-white/40 p-2 flex justify-around items-center">
           <button onClick={() => setCurrentView(AppView.COMPOSE)} className={`p-4 rounded-2xl ${currentView === AppView.COMPOSE ? 'bg-brand-600 text-white shadow-lg -translate-y-4' : 'text-slate-400'}`}><PenTool className="w-6 h-6" /></button>
           <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`p-4 rounded-2xl ${currentView === AppView.DASHBOARD ? 'bg-brand-600 text-white shadow-lg -translate-y-4' : 'text-slate-400'}`}><LayoutDashboard className="w-6 h-6" /></button>
           <button onClick={() => setCurrentView(AppView.SETTINGS)} className={`p-4 rounded-2xl ${currentView === AppView.SETTINGS ? 'bg-brand-600 text-white shadow-lg -translate-y-4' : 'text-slate-400'}`}><Settings className="w-6 h-6" /></button>
        </div>
      </div>

      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm bg-slate-800 text-white">
              {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
              {toastMessage.msg}
          </div>
      )}
    </div>
  );
};

export default App;