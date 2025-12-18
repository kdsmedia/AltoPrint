import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (!container) {
    throw new Error("Elemen root tidak ditemukan. Pastikan index.html memiliki <div id='root'></div>");
}

const root = createRoot(container);

try {
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} catch (error) {
    console.error("Gagal merender aplikasi:", error);
    container.innerHTML = `
        <div style="background: #0f172a; color: white; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; text-align: center;">
            <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 16px;">Gagal Memuat Aplikasi</h1>
            <p style="color: #94a3b8; margin-bottom: 24px;">Terjadi kesalahan teknis saat inisialisasi.</p>
            <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">Coba Lagi</button>
        </div>
    `;
}