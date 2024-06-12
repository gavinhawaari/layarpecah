const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware untuk mengizinkan CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Endpoint untuk melakukan proxy terhadap URL yang diberikan
app.get('/api/server', async (req, res) => {
  const iframeUrl = req.query.iframe;
  
  try {
    // Melakukan GET request ke URL iframe yang diberikan
    const response = await axios.get(iframeUrl);
    
    // Mengembalikan response dari URL tersebut ke client
    res.send(response.data);
  } catch (error) {
    // Mengembalikan error jika terjadi masalah dalam melakukan request
    res.status(500).send('Error fetching iframe URL');
  }
});

// Server listening di port 3000
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
