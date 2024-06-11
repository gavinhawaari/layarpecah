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

    // Mengambil nilai parameter slugs dari permintaan
    const slugs = req.query.slugs || '';

    // Memeriksa apakah parameter slugs telah diberikan
    if (!slugs) {
        res.status(400).json({ error: 'Parameter slug movies tidak ditemukan' });
        return;
    }
    
    // Memisahkan slug menjadi array
    const slugArray = slugs.split(',');

    // Menyiapkan array untuk menyimpan hasil dari setiap slug
    const promises = slugArray.map(slug => {
        return new Promise((resolve, reject) => {
            const urls = [
                `https://new6.ngefilm21.yachts/${slug}/?player=2`,
                `https://new6.ngefilm21.yachts/${slug}/?player=3`,
                `https://new6.ngefilm21.yachts/${slug}/?player=4`
            ];

            const promises = urls.map(url => {
                return new Promise((resolve, reject) => {
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

                            // Mengambil URL dari elemen iframe
                            const iframeElement = document.querySelector('iframe');
                            const urlstream = iframeElement ? iframeElement.getAttribute('src') : 'N/A';

                            // Membuat objek detail movie
                            const detailMovieObject = {
                                urlstream
                            };

                            resolve(detailMovieObject);
                        });

                    }).on('error', (err) => {
                        reject(err);
                    });
                });
            });

            Promise.all(promises)
                .then(results => {
                    const responseObject = results.reduce((acc, curr, index) => {
                        return { ...acc, [`server${index + 2}`]: curr };
                    }, {});
                    resolve({ [slug]: responseObject });
                })
                .catch(error => {
                    reject(error);
                });
        });
    });

    Promise.all(promises)
        .then(results => {
            const responseObject = results.reduce((acc, curr) => Object.assign(acc, curr), {});
            res.status(200).json(responseObject);
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
};
