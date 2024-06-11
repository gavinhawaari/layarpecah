const https = require('https');
const { JSDOM } = require('jsdom');

const url = 'https://vidhidevip.com/embed/4tmz2fskh2cb';
const referer = 'https://new7.ngefilm21.yachts/13-bomb-di-jakarta-2023/';

// Fungsi untuk mengambil konten halaman web
function fetchPage(url, referer) {
  return new Promise((resolve, reject) => {
    // Opsi untuk mengatur header referer
    const options = {
      headers: {
        'Referer': referer
      }
    };

    // Melakukan permintaan GET ke URL yang diberikan
    https.get(url, options, (res) => {
      let data = '';

      // Menggabungkan data yang diterima
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Jika semua data sudah diterima, resolusi dengan data tersebut
      res.on('end', () => {
        resolve(data);
      });

    }).on('error', (err) => {
      // Menolak promise jika terjadi kesalahan
      reject(err);
    });
  });
}

// Fungsi untuk mengekstrak data dari konten halaman web
async function extractData() {
  try {
    // Mengambil konten HTML dari halaman web
    const html = await fetchPage(url, referer);
    // Membuat DOM virtual dari konten HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Mencari semua elemen <script> dengan tipe "text/javascript"
    const scriptTags = document.querySelectorAll('script[type="text/javascript"]');
    let sourcesUrl = '';
    let imageUrl = '';

    // Mengecek setiap elemen <script> untuk menemukan pola yang diinginkan
    scriptTags.forEach(script => {
      const scriptContent = script.textContent;
      // Mencari pola sources dengan regex
      const sourcesMatch = scriptContent.match(/sources: \[\{file:"([^"]+)"\}\]/);
      // Mencari pola image dengan regex
      const imageMatch = scriptContent.match(/image: "([^"]+)"/);

      // Jika pola ditemukan, simpan URL-nya
      if (sourcesMatch && imageMatch) {
        sourcesUrl = sourcesMatch[1];
        imageUrl = imageMatch[1];
      }
    });

    // Mengembalikan objek dengan URL sources dan image
    return { sources: sourcesUrl, image: imageUrl };
  } catch (error) {
    // Mencetak kesalahan jika terjadi
    console.error('Error fetching or parsing the webpage:', error);
  }
}

// Menjalankan fungsi dan mencetak hasilnya dalam format JSON
extractData().then(data => {
  console.log(JSON.stringify(data, null, 2));
});
