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

    

    https.get(targetUrl + slugs, (response) => {
        let data = '';

        // Mengumpulkan data yang diterima
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Proses data setelah selesai diterima
        response.on('end', () => {
            const dom = new JSDOM(data);
            const document = dom.window.document;

            // Mengambil data simpinis
            const simpinisElement = document.querySelector('p span');
            const simpinis = simpinisElement ? simpinisElement.textContent.trim() : 'N/A';

            // Mengambil semua data detail movie
            const detailMovieElements = document.querySelectorAll('div.gmr-moviedata');
            let detailMovie = [];

            detailMovieElements.forEach(element => {
                const lines = element.textContent.trim().split('\n');
                let detailObject = {};
                lines.forEach(line => {
                    const parts = line.split(':');
                    const key = parts[0].trim();
                    const value = parts[1].trim();
                    detailObject[key] = value;
                });
                detailMovie.push(detailObject);
            });

            // Mengambil URL dari elemen iframe youtube
            const iframeElement = document.querySelector('a.gmr-trailer-popup');
            const trailer = iframeElement ? iframeElement.getAttribute('href') : 'N/A';

            // Mengambil Poster
            const posterElement = document.querySelector('figure img');
            const poster = posterElement ? posterElement.getAttribute('src') : 'N/A';

            // Mengambil title
            const titleElement = document.querySelector('h1.entry-title');
            const title = titleElement ? titleElement.textContent.trim() : 'N/A';


            // Membuat objek detail movie
            const detailMovieObject = {
                title,
                poster,
                simpinis,
                detailMovie,
                trailer
            };

            res.status(200).json(detailMovieObject);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
