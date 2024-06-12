// api/server.js

const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/server', async (req, res) => {
    const videoUrl = req.query.url;
    const referer = 'https://new8.ngefilm21.yachts/';

    try {
        const response = await axios.get(videoUrl, {
            headers: {
                'Referer': referer
            },
            responseType: 'stream'
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching the video');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
