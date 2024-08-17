const express = require('express');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus Metrics Setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// MongoDB Setup
mongoose.connect('mongodb://localhost:27017/olostep', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('MongoDB connection error:', error.message));

const DataSchema = new mongoose.Schema({
    url: String,
    content: String,
    analysis: String
});

const ScrapedData = mongoose.model('ScrapedData', DataSchema);

// Scraping Function
async function scrapeData(url) {
    try {
        console.log("Starting browser..."); // Log
        const browser = await puppeteer.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        console.log("Opening new page..."); // Log
        const page = await browser.newPage();

        console.log("Navigating to URL:", url); // Log
        await page.goto(url, { waitUntil: 'networkidle2' });

        console.log("Extracting page content..."); // Log
        const data = await page.evaluate(() => document.body.innerText);

        console.log("Closing browser..."); // Log
        await browser.close();
        
        return data;
    } catch (error) {
        console.error("Error in scrapeData function:", error.message);
        throw error; // Re-throw to handle in route
    }
}

// TensorFlow.js Analysis Placeholder
function analyzeData(content) {
    // Simple analysis logic (replace with actual TensorFlow model)
    return "Category: Example";
}

// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to Olostep Scraper AI</h1>
        <form action="/scrape" method="post">
            <input type="text" name="url" placeholder="Enter URL" required />
            <button type="submit">Scrape</button>
        </form>
    `);
});

app.post('/scrape', async (req, res) => {
    const url = req.body.url;
    
    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        console.log("Received URL:", url); // Log
        const content = await scrapeData(url);
        console.log("Scraped Content:", content); // Log

        const analysis = analyzeData(content);

        const dataEntry = new ScrapedData({ url, content, analysis });
        await dataEntry.save();

        res.send(`
            <h2>Scraped Data</h2>
            <p><strong>URL:</strong> ${dataEntry.url}</p>
            <p><strong>Content:</strong> ${dataEntry.content}</p>
            <p><strong>Analysis:</strong> ${dataEntry.analysis}</p>
            <a href="/">Go Back</a>
        `);
    } catch (error) {
        console.error("Error in /scrape route:", error.message);
        res.status(500).send('Failed to scrape data');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
