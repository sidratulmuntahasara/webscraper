const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/olostep', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const DataSchema = new mongoose.Schema({
    url: String,
    content: String
});

const ScrapedData = mongoose.model('ScrapedData', DataSchema);

module.exports = ScrapedData;

const ScrapedData = require('./db');

app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    const content = await scrapeData(url);

    const dataEntry = new ScrapedData({ url, content });
    await dataEntry.save();

    res.json(dataEntry);
});
