const puppeteer = require('puppeteer');

async function scrapeData(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const data = await page.evaluate(() => {
        return document.body.innerText;
    });

    await browser.close();
    return data;
}

module.exports = scrapeData;