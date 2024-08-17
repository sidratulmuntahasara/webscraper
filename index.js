const express = require('express');
const scrapeData = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Olostep Scraper AI!');
});

app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    const data = await scrapeData(url);
    res.json({ data });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
