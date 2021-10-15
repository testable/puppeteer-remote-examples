const puppeteer = require('puppeteer');
const { URLSearchParams } = require('url');

(async () => {
    try {
        const params = new URLSearchParams({
            // API key (Org Management => API Keys)
            key: process.env.TESTABLE_KEY,
            // Gets logged with the test indicating which user ran this test, defaults to 'remote'
            user: 'demo',
            // browser name: chrome, edge, firefox, openfin 
            browserName: 'chrome',
            // browser version (e.g. latest, latest-2, 90)
            browserVersion: 'latest',
            // size of the display (WxH)
            screenResolution: '1920x1080'
        }).toString();
        const browser = await puppeteer.connect({
            timeout: 0,
            browserWSEndpoint: `wss://cdp.testable.io?${params}`
        });
        //const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        await page.goto('https://google.com/');
        await page.waitForTimeout(1000);

        await page.screenshot({ path: 'test.png' });
        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();
