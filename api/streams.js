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

    // Mengambil nilai parameter slugs dan server dari permintaan
    const slugs = req.query.slugs || '';
    const server = req.query.server || '3';

    // Memeriksa apakah parameter slugs dan server telah diberikan
    if (!slugs) {
        res.status(400).json({ error: 'Parameter slug movies tidak ditemukan' });
        return;
    }

    if (!server) {
        res.status(400).json({ error: 'Parameter server movies/series tidak ditemukan' });
        return;
    }

    https.get(targetUrl + slugs + `/?player=${server}`, (response) => {
        let data = '';

        // Mengumpulkan data yang diterima
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Proses data setelah selesai diterima
        response.on('end', () => {
            const dom = new JSDOM(data);
            const document = dom.window.document;


            // Mengambil URL dari elemen iframe
            const iframeElement = document.querySelector('iframe');
            const urlstream = iframeElement ? iframeElement.getAttribute('src') : 'N/A';

            // Membuat objek detail movie
            const detailMovieObject = {
                urlstream
            };

            res.status(200).json(detailMovieObject);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
