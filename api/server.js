const express = require('express');
const axios = require('axios');
const app = express();

// Middleware untuk mengizinkan CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Endpoint untuk melakukan proxy terhadap URL yang diberikan
app.get('/api/server', async (req, res) => {
  const iframeUrl = req.query.iframe;

  try {
    // Konfigurasi untuk Axios
    const axiosConfig = {
      headers: {
        'Referer': 'https://new8.ngefilm21.yachts/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; RMX3231 Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.148 Mobile Safari/537.36'
      }
    };

    // Melakukan GET request ke URL iframe yang diberikan dengan header Referer
    const response = await axios.get(iframeUrl, axiosConfig);

    // Mengembalikan response dari URL tersebut ke client
    res.send(response.data);
  } catch (error) {
    // Mengembalikan error jika terjadi masalah dalam melakukan request
    res.status(500).send('Error fetching iframe URL');
  }
});

module.exports = app;
