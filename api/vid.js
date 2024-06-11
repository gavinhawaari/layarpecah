const https = require('https');
const { JSDOM } = require('jsdom');

const url = 'https://vidhidevip.com/embed/4tmz2fskh2cb';
const referer = 'https://new7.ngefilm21.yachts/13-bomb-di-jakarta-2023/';

// Fungsi untuk mengambil konten halaman web
function fetchPage(url, referer) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Referer': referer
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });

    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Fungsi untuk mengekstrak data dari konten halaman web
async function extractData() {
  try {
    const html = await fetchPage(url, referer);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const scriptTags = document.querySelectorAll('script[type="text/javascript"]');
    let sourcesUrl = '';
    let imageUrl = '';

    scriptTags.forEach(script => {
      const scriptContent = script.textContent;
      const sourcesMatch = scriptContent.match(/sources: \[\{file:"([^"]+)"\}\]/);
      const imageMatch = scriptContent.match(/image: "([^"]+)"/);

      if (sourcesMatch && imageMatch) {
        sourcesUrl = sourcesMatch[1];
        imageUrl = imageMatch[1];
      }
    });

    return { sources: sourcesUrl, image: imageUrl };
  } catch (error) {
    console.error('Error fetching or parsing the webpage:', error);
  }
}

// Fungsi utama yang diekspor sebagai modul
module.exports = async (req, res) => {
  // Menambahkan header CORS ke dalam respons
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Mengatasi preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mengekstrak data dan mengembalikannya sebagai JSON
  try {
    const data = await extractData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
