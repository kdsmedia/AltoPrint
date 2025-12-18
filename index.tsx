import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("AltoPrint: Memulai pemasangan (mounting)...");

const container = document.getElementById('root');

if (!container) {
  console.error("AltoPrint: Error Kritis - Elemen Root tidak ditemukan.");
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.padding = '20px';
  errorDiv.style.background = 'white';
  errorDiv.innerHTML = '<h1>Error Kritis</h1><p>Elemen Root tidak ditemukan di DOM.</p>';
  document.body.appendChild(errorDiv);
} else {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("AltoPrint: Render berhasil dijalankan.");
  } catch (error) {
    console.error("AltoPrint: Error saat render awal", error);
    container.innerHTML = `<div style="color: white; padding: 20px; font-family: sans-serif; background: #0f172a; height: 100vh;">
      <h1 style="color: #ef4444;">Gagal Memuat Aplikasi</h1>
      <p>Terjadi kesalahan saat inisialisasi:</p>
      <pre style="background: #1e293b; padding: 15px; border-radius: 8px; overflow: auto; border: 1px solid #334155; color: #94a3b8;">${error instanceof Error ? error.stack : String(error)}</pre>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Muat Ulang Halaman</button>
    </div>`;
  }
}