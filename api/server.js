// File: /api/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Middleware untuk mengizinkan CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Middleware untuk menangani permintaan dengan query string iframe
app.get('/api/server', (req, res, next) => {
  const iframeUrl = req.query.iframe;

  // Pastikan query string iframe tidak kosong
  if (!iframeUrl) {
    return res.status(400).send('Parameter iframe harus disertakan');
  }

  // Konfigurasi proxy middleware
  const apiProxy = createProxyMiddleware({
    target: iframeUrl,
    changeOrigin: true, // Ubah origin request menjadi target URL
    secure: false, // Bolehkan proxying ke target HTTPS tanpa verifikasi sertifikat
    headers: {
      'Referer': 'https://new8.ngefilm21.yachts/' // Atur header Referer
    },
    pathRewrite: {
      '^/': '', // Hapus bagian / dari path
    },
    onProxyReq: (proxyReq, req, res) => {
      // Setel header Referer ke target URL
      proxyReq.setHeader('Referer', iframeUrl);
    },
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.status(500).send('Proxy Error');
    }
  });

  // Gunakan middleware proxy untuk permintaan dengan query string /?iframe=
  apiProxy(req, res, next);
});

module.exports = app;
