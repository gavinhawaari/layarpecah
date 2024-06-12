const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/api/server', async (req, res) => {
    const videoUrl = req.query.url;

    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // Set user agent and other headers
        await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; RMX3231 Build/RP1A.201005.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.148 Mobile Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Referer': 'https://artist.dutamovie21.cloud/eps/open-bo-lagi-semakin-panas-semakin-ganas-s01-ep01/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
        });

        await page.goto(videoUrl, { waitUntil: 'networkidle2' });

        // Get the content of the page
        const content = await page.content();

        res.setHeader('Content-Type', 'text/html');
        res.send(content);

        await browser.close();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching the video!!');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
