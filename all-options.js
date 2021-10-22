const puppeteer = require('puppeteer');
const { URLSearchParams } = require('url');

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

(async () => {
    try {
        const params = new URLSearchParams({
            // API key (Org Management => API Keys)
            key: process.env.TESTABLE_KEY,
            // Gets logged with the test indicating which user ran this test, defaults to 'remote'
            user: 'demo',
            // Browser name: chrome, edge, firefox, openfin 
            browserName: 'chrome',
            // Browser version (e.g. latest, latest-1, 90)
            browserVersion: 'latest-1',
            // Size of the display (WxH). Defaults from the device details if not specified.
            screenResolution: '1920x1080',
            // The region in which to run your test (use our remote configurator to see the full list of options)
            region: 'aws-us-east-1',
            // Test case name is a high level grouping for related tests (e.g. project name)
            testCaseName: 'Project Top Secret',
            // A label for what this script is testing
            scenarioName: 'Basic regression test',
            // A label for the particular browser/device/screen size combo
            name: 'Chrome on a Desktop (1920 x 1080)',
            // Whether or not to record a video of the session
            recordVideo: true,
            // Whether or not to capture network request performance metrics, enabled by default
            capturePerformance: true,
            // Whether or not to capture request/response bodies for network requests, disabled by default
            // and only relevant if capturePerformance is true
            captureBody: false,
            // Whether or not to capture any messages the page writes to the browser console, enabled by default
            captureConsoleLog: true,
            // Whether or not to log all commands sent at the CDP protocol level, disabled by default
            logCommands: true,
            // Whether or not to log all events generated by the CDP protocol, disabled by default
            logEvents: false,
            // Choose from list of preconfigured devices Testable provides (see Remote Test Configurator screen for full list)
            // ignored if device option is set like below but provided here for completeness
            deviceName: 'iPhone 12 Pro Max (428 x 926)',
            // Custom device to emulate
            device: JSON.stringify({
                "name":"My Custom Mobile Device",
                "displaySize":"400x1000x24",
                "userAgent":"Custom Agent",
                "type":"device",
                "width":400,
                "height":1000,
                "scaleFactor":3,
                "isMobile":true,
                "isTouch":true,
                "isLandscape":false
            }),
            // A special tag for grouping together related test runs, 
            // typically running the same script against different browser versions and devices
            reportId: 'Report 123',
            // Tags to associate with this test run; tags can be used to search for tests later
            tags: 'Server-1.2.0,Env-QA',
            // How long to keep the session alive after disconnecting (e.g. 2m, 300s, 1h).
            // If unspecified the session ends immediately after disconnecting. Make sure to not close 
            // the browser if you plan to reconnect.
            keepAlive: '1m'
        });
        let browser = await puppeteer.connect({
            timeout: 0,
            browserWSEndpoint: `wss://cdp.testable.io?${params.toString()}`
        });
        let page = (await browser.pages())[0];
        await page.setViewport({ width: 400, height: 1000 });

        await page.goto('https://google.com');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'google.png' });

        // get the sessionId so we can reconnect to the same session
        const sessionId = (await page.evaluate(function testable_info() {})).sessionId;
        console.log(`Session ID: ${sessionId}`);

        // disconnect and then reconnect using the session ID
        browser.disconnect();
        await sleep(1000);

        params.set('sessionId', sessionId);
        browser = await puppeteer.connect({
            timeout: 0,
            browserWSEndpoint: `wss://cdp.testable.io?${params.toString()}`
        });

        page = (await browser.pages())[0];
        await page.goto('https://amazon.com');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'amazon.png' });

        // close the browser, will not be able to reconnect after this
        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();