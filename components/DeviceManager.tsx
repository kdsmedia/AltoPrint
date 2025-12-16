import React, { useState } from 'react';
import { Bluetooth, RefreshCw, Printer, AlertCircle, FileInput, Signal, Search, Usb, Cable } from 'lucide-react';
import { ConnectionStatus, PrinterDevice } from '../types';
import { testPrint } from '../services/printerService';

interface DeviceManagerProps {
  status: ConnectionStatus;
  device: PrinterDevice | null;
  onConnect: (device: PrinterDevice) => void;
  onDisconnect: () => void;
  language?: string;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

type ConnectionType = 'bluetooth' | 'usb';

const DM_TRANSLATIONS = {
  id: {
    title: 'Koneksi',
    subtitle: 'Atur metode koneksi printer',
    usbCable: 'USB Cable',
    bleError: 'Layanan Printer Bluetooth tidak ditemukan atau tidak didukung.',
    bleBrowserError: 'Browser ini tidak mendukung Web Bluetooth. Gunakan Chrome di Android/Desktop.',
    usbBrowserError: 'Browser ini tidak mendukung Web USB.',
    testSent: 'Test print dikirim ke',
    failPrint: 'Gagal mencetak:',
    connected: 'Connected',
    disconnect: 'Putus',
    testPrint: 'Cetak Contoh Struk',
    sending: 'Mengirim Data...',
    searching: 'Mencari...',
    noDevice: 'Tidak ada perangkat',
    scanBle: 'Cari Bluetooth',
    scanUsb: 'Cari USB',
    refresh: 'Refresh',
    found: 'Perangkat Ditemukan',
    hintBle: 'Pastikan Bluetooth aktif, printer menyala dan tidak terhubung ke HP lain.',
    hintUsb: 'Hubungkan kabel USB (Gunakan OTG jika di HP Android).'
  },
  en: {
    title: 'Connection',
    subtitle: 'Manage printer connection method',
    usbCable: 'USB Cable',
    bleError: 'Bluetooth Printer Service not found or not supported.',
    bleBrowserError: 'This browser does not support Web Bluetooth. Use Chrome on Android/Desktop.',
    usbBrowserError: 'This browser does not support Web USB.',
    testSent: 'Test print sent to',
    failPrint: 'Failed to print:',
    connected: 'Connected',
    disconnect: 'Disconnect',
    testPrint: 'Print Sample Receipt',
    sending: 'Sending Data...',
    searching: 'Searching...',
    noDevice: 'No devices found',
    scanBle: 'Scan Bluetooth',
    scanUsb: 'Scan USB',
    refresh: 'Refresh',
    found: 'Devices Found',
    hintBle: 'Ensure Bluetooth is on, printer is on, and not paired to another phone.',
    hintUsb: 'Connect USB cable (Use OTG on Android).'
  }
};

const DeviceManager: React.FC<DeviceManagerProps> = ({ status, device, onConnect, onDisconnect, language = 'id', onShowToast }) => {
  const [error, setError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<PrinterDevice[]>([]);
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>('bluetooth');

  const t = DM_TRANSLATIONS[language === 'en' ? 'en' : 'id'];

  // --- Bluetooth Logic ---
  const scanBluetooth = async () => {
    setError(null); setAvailableDevices([]);
    const nav = navigator as any;
    if (nav.bluetooth) {
      try {
        const bleDevice = await nav.bluetooth.requestDevice({
          filters: [
            { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Standard Thermal
            { services: ['00001101-0000-1000-8000-00805f9b34fb'] }, // Serial Port Profile (SPP)
            { services: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'] }, // Star Micronics / Custom
            { services: ['49535343-fe7d-4ae5-8fa9-9fafd205e455'] }  // Generic/Unknown
          ], 
          optionalServices: [
            'generic_access', 
            '000018f0-0000-1000-8000-00805f9b34fb', 
            '00001101-0000-1000-8000-00805f9b34fb',
            'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
            '49535343-fe7d-4ae5-8fa9-9fafd205e455',
            0xff00 // Manufacturer Specific
          ],
          acceptAllDevices: false
        });

        if (bleDevice) {
             const server = await bleDevice.gatt.connect();
             let characteristic = null;
             
             // Try to find a writable characteristic in common services
             const serviceUUIDs = [
                '000018f0-0000-1000-8000-00805f9b34fb',
                '00001101-0000-1000-8000-00805f9b34fb',
                'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
                '49535343-fe7d-4ae5-8fa9-9fafd205e455',
                0xff00
             ];

             const charUUIDs = [
                '00002af1-0000-1000-8000-00805f9b34fb', // Standard Write
                '00001101-0000-1000-8000-00805f9b34fb', // SPP Write
                'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f', // Star Write
                '49535343-8841-43f4-a8d4-ecbe34729bb3', // Generic Write
                0xff02
             ];

             // Brute force search for a working characteristic
             for (const sUUID of serviceUUIDs) {
                 try {
                     const service = await server.getPrimaryService(sUUID);
                     for (const cUUID of charUUIDs) {
                        try {
                            characteristic = await service.getCharacteristic(cUUID);
                            if (characteristic) break;
                        } catch (e) { continue; }
                     }
                     if (!characteristic) {
                         const chars = await service.getCharacteristics();
                         characteristic = chars.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);
                     }
                     if (characteristic) break;
                 } catch (e) { continue; }
             }
             
             if(!characteristic) {
                 setError(t.bleError);
                 return;
             }

             onConnect({ id: bleDevice.id, name: bleDevice.name || 'Unknown Device', type: 'ble', characteristic });
        }
      } catch (err: any) {
        if (err.name !== 'NotFoundError' && !err.message.includes('cancelled')) {
             setError("Bluetooth Error: " + err.message);
        }
      }
    } else { 
        setError(t.bleBrowserError);
    }
  };

  // --- USB Logic ---
  const scanUsb = async () => {
    setError(null); setAvailableDevices([]);
    const nav = navigator as any;
    if (nav.usb) {
        try {
            const usbDevice = await nav.usb.requestDevice({ filters: [] });
            if (usbDevice) {
                await usbDevice.open();
                if (usbDevice.configuration === null) {
                    await usbDevice.selectConfiguration(1);
                }
                await usbDevice.claimInterface(0);
                
                onConnect({ 
                    id: `usb-${usbDevice.vendorId}-${usbDevice.productId}`, 
                    name: usbDevice.productName || `USB Device (${usbDevice.vendorId})`, 
                    type: 'usb', 
                    deviceInterface: usbDevice 
                });
            }
        } catch (err: any) {
            if (err.name !== 'NotFoundError') {
                console.error(err);
                setError("USB Error: " + err.message);
            }
        }
    } else {
        setError(t.usbBrowserError);
    }
  };

  const handleScan = () => {
      if (connectionType === 'bluetooth') {
          scanBluetooth();
      } else {
          scanUsb();
      }
  };

  const handleTestPrint = async () => {
    if (!device) return; 
    setIsTestPrinting(true);
    try {
        await testPrint(device);
        onShowToast(`${t.testSent} ${device.name}!`, 'success');
    } catch (e: any) {
        setError(`${t.failPrint} ${e.message}`);
    } finally {
        setIsTestPrinting(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-3d border border-white/50 p-6 md:p-8 animate-in fade-in duration-300 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
           <h3 className="text-2xl font-black text-slate-800">{t.title}</h3>
           <p className="text-slate-500 font-medium text-sm">{t.subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500
          ${status === ConnectionStatus.CONNECTED ? 'bg-green-500 text-white shadow-green-500/30' : 
            status === ConnectionStatus.SCANNING ? 'bg-blue-500 text-white shadow-blue-500/30 animate-bounce' : 'bg-slate-200 text-slate-400'}`}>
           {connectionType === 'bluetooth' ? <Bluetooth className="w-6 h-6" /> : <Usb className="w-6 h-6" />}
        </div>
      </div>

      {/* Connection Method Tabs */}
      {!device && (
          <div className="bg-slate-100 p-1.5 rounded-xl flex mb-6 relative z-10">
              <button 
                  onClick={() => { setConnectionType('bluetooth'); setAvailableDevices([]); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300
                  ${connectionType === 'bluetooth' ? 'bg-white text-brand-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Bluetooth className="w-4 h-4" /> Bluetooth
              </button>
              <button 
                  onClick={() => { setConnectionType('usb'); setAvailableDevices([]); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300
                  ${connectionType === 'usb' ? 'bg-white text-orange-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Cable className="w-4 h-4" /> {t.usbCable}
              </button>
          </div>
      )}

      <div className="space-y-6 relative z-10">
        
        {/* State 1: Connected Card */}
        {status === ConnectionStatus.CONNECTED && device && (
          <div className={`rounded-[2rem] p-6 text-white shadow-xl transform hover:scale-[1.01] transition-transform duration-300
             ${device.type === 'usb' ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/20' : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20'}`}>
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  {device.type === 'usb' ? <Cable className="w-8 h-8 text-white" /> : <Printer className="w-8 h-8 text-white" />}
                </div>
                <div>
                  <h4 className="font-black text-xl">{device.name}</h4>
                  <p className="text-white/80 font-medium opacity-80 flex items-center gap-2 text-xs uppercase tracking-wide">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    {device.type === 'ble' ? 'Bluetooth' : 'USB'} {t.connected}
                  </p>
                </div>
              </div>
              <button onClick={onDisconnect} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md transition-all">
                {t.disconnect}
              </button>
            </div>

            <button
              onClick={handleTestPrint}
              disabled={isTestPrinting}
              className={`w-full bg-white h-12 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2
                 ${device.type === 'usb' ? 'text-orange-600' : 'text-green-600'}`}
            >
               {isTestPrinting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileInput className="w-4 h-4" />}
               {isTestPrinting ? t.sending : t.testPrint}
            </button>
          </div>
        )}

        {/* State 2: Disconnected / List */}
        {status !== ConnectionStatus.CONNECTED && (
          <div className="space-y-6">
            
            {availableDevices.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner-depth">
                 <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-3d relative">
                    <Search className={`w-8 h-8 ${connectionType === 'usb' ? 'text-orange-500' : 'text-brand-500'} ${status === ConnectionStatus.SCANNING ? 'animate-pulse' : ''}`} />
                    {status === ConnectionStatus.SCANNING && <span className={`absolute inset-0 rounded-full border-2 opacity-20 animate-ping ${connectionType === 'usb' ? 'border-orange-500' : 'border-brand-500'}`}></span>}
                 </div>
                 <h4 className="font-bold text-slate-800 text-lg mb-1">
                    {status === ConnectionStatus.SCANNING ? t.searching : t.noDevice}
                 </h4>
                 <p className="text-slate-400 text-sm mb-6 px-10">
                    {connectionType === 'bluetooth' ? t.hintBle : t.hintUsb}
                 </p>
                 
                 <button 
                  onClick={handleScan}
                  disabled={status === ConnectionStatus.SCANNING}
                  className={`text-white px-8 py-3 rounded-xl font-bold shadow-lg active:translate-y-1 transition-all
                     ${connectionType === 'usb' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/30'}`}
                >
                  {status === ConnectionStatus.SCANNING ? t.searching : (connectionType === 'bluetooth' ? t.scanBle : t.scanUsb)}
                </button>
              </div>
            )}

            {availableDevices.length > 0 && (
               <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-end px-2">
                     <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">{t.found}</span>
                     <button onClick={handleScan} className={`${connectionType === 'usb' ? 'text-orange-600' : 'text-brand-600'} text-xs font-bold hover:underline`}>{t.refresh}</button>
                  </div>
                  {availableDevices.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => { onConnect(dev); setAvailableDevices([]); }}
                      className="group w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-colors ${dev.type === 'usb' || connectionType === 'usb' ? 'bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'}`}>
                          {dev.type === 'usb' || connectionType === 'usb' ? <Cable className="w-6 h-6" /> : <Printer className="w-6 h-6" />}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">{dev.name}</p>
                          <p className="text-xs text-slate-400 font-bold">ID: {dev.id}</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                         <Signal className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
               </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="absolute bottom-6 left-6 right-6 bg-red-100 text-red-700 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-200 animate-in slide-in-from-bottom-2 z-20 shadow-lg">
          <AlertCircle className="w-5 h-5 shrink-0" /> 
          <span className="flex-1">{error}</span>
        </div>
      )}
    </div>
  );
};

export default DeviceManager;