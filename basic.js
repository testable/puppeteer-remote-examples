const puppeteer = require('puppeteer');
const { URLSearchParams } = require('url');

(async () => {
    try {
        const params = new URLSearchParams({
            // API key (Org Management => API Keys)
            key: process.env.TESTABLE_KEY,
            // Gets logged with the test indicating which user ran this test, defaults to 'remote'
            user: 'demo',
            // Browser name: chrome, edge, firefox, openfin 
            browserName: 'chrome',
            // Browser version (e.g. latest, latest-2, 90)
            browserVersion: 'latest',
            // Size of the display (WxH). Defaults from the device details if not specified.
            screenResolution: '1920x1080',
            // The region in which to run your test (use our remote configurator to see the full list of options)
            region: 'aws-us-east-1'
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
