const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Middleware untuk mengizinkan CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Konfigurasi proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'https://vidhidepre.com',
  changeOrigin: true, // Ubah origin request menjadi target URL
  secure: false, // Bolehkan proxying ke target HTTPS tanpa verifikasi sertifikat
  headers: {
    'Referer': 'https://new8.ngefilm21.yachts/' // Atur header Referer
  }
});

// Gunakan middleware proxy untuk semua permintaan ke /api/proxy
app.use('/api/server', apiProxy);

module.exports = app;
