const puppeteer = require('puppeteer');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const TimeoutMs = 15000;

async function withTimeout(op) {
    const start = Date.now();
    let result;
    while (!result && Date.now() - start < TimeoutMs) {
        try {
            result = await op();
        } catch (err) { }
        if (!result)
            await sleep(500);
    }
    return result;
}

async function findPage(title, browser) {
    return await withTimeout(async function () {
        const pages = await browser.pages();
        for (const page of pages) {
            const pageTitle = await page.title();
            if (pageTitle === title)
                return page;
        }
    });
}

(async () => { 
    try {
        const params = new URLSearchParams({
            // API key (Org Management => API Keys)
            key: process.env.TESTABLE_KEY,
            // Gets logged with the test indicating which user ran this test, defaults to 'remote'
            user: 'demo',
            // a URL to the app config json file for your OpenFin application
            openfinConfigUrl: 'https://raw.githubusercontent.com/testable/openfin-wdio-testable-example/master/app_sample.json',
            region: 'aws-us-east-1'
        }).toString();
        const browser = await puppeteer.connect({
            timeout: 0,
            browserWSEndpoint: `wss://cdp.testable.io?${params}`
        });
        await withTimeout(async function () {
            return await page.evaluate(function () {
                return fin && fin.desktop && fin.desktop.System && fin.desktop.System.getVersion;
            });
        });
        const page = await findPage('Hello OpenFin', browser);
        await page.screenshot({ path: 'Main.png' });
        const notificationButton = await page.$("#desktop-notification");
        notificationButton.click();
        const cpuButton = await page.$("#cpu-info");
        cpuButton.click();
        const cpuPage = await findPage('Hello OpenFin CPU Info', browser);
        await cpuPage.screenshot({ path: 'CPU.png' });
        await page.evaluate(function () {
            fin.desktop.System.exit();
        });
        await page.waitForTimeout(1000);
    } catch(err) {
        console.log(err);
    }
})();
