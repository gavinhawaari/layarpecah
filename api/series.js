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

    const slugs = req.query.slugs || '';
    // Memeriksa apakah parameter slugs telah diberikan
    if (!slugs) {
        res.status(400).json({ error: 'Parameter slugs series tidak ditemukan' });
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

            // Mengambil data detail movie
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

            // Mengambil URL dari elemen iframe
            const iframeElement = document.querySelector('iframe');
            const iframeUrl = iframeElement ? iframeElement.getAttribute('src') : 'N/A';

            // Mengambil semua data episode
            const episodeElements = document.querySelectorAll('div.gmr-listseries a.button.button-shadow');
            let episodes = [];

            episodeElements.forEach(element => {
                const title = element.textContent.trim();
                if (title !== 'Pilih Episode') {
                    let slug = element.getAttribute('href').trim();
                    // Menghapus bagian "https" dan domain dari slug menggunakan regex
                    slug = slug.replace(/^https?:\/\/[^/]+/, '');
                    episodes.push({
                        titleepisode: title,
                        slugepisode: slug
                    });
                }
            });

            // Membuat objek detail movie
            const detailMovieObject = {
                simpinis,
                detailMovie,
                episodes,
                iframeUrl
            };

            res.status(200).json(detailMovieObject);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};
