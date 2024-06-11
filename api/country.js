const https = require('https');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const targetUrl = require('./targeturl');

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

    const negara = req.query.negara || '';
    // Memeriksa apakah parameter negara telah diberikan
    if (!negara) {
        res.status(400).json({ error: 'Parameter negara  tidak ditemukan' });
        return;
    }

    const pages = req.query.pages !== undefined ? req.query.pages : 1;
    
    let url = `${targetUrl}country/${negara}/`;
    if (pages !== 1) {
        url += `page/${pages}/`;
    }

    https.get(url, (response) => {
        let data = '';

        // Mengumpulkan data yang diterima
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Proses data setelah selesai diterima
        response.on('end', () => {
            const dom = new JSDOM(data);
            const document = dom.window.document;

            const articles = document.querySelectorAll('article');
            let results = [];

            articles.forEach(article => {
                const poster = article.querySelector('img') ? article.querySelector('img').getAttribute('src') : 'N/A';
                const title = article.querySelector('h2') ? article.querySelector('h2').textContent.trim() : 'N/A';
                let slug = article.querySelector('h2 a') ? article.querySelector('h2 a').getAttribute('href') : 'N/A';
                
                // Menghapus bagian "https" dan domain dari slug menggunakan regex
                slug = slug.replace(/^https?:\/\/[^/]+/, '');

                // menghapus bagian symbol slash awal
                slug = slug.replace('/', '');
                
                // Menetapkan nilai type berdasarkan nilai slug
                const type = slug.includes('/tv/') ? 'tv' : 'movie';
   
                results.push({
                    poster,
                    title,
                    slug,
                    type
                });
            });

            res.status(200).json(results);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};