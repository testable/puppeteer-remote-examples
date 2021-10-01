const puppeteer = require('puppeteer');
const { URLSearchParams } = require('url');

(async () => {
    try {
        const start = Date.now();
        const params = new URLSearchParams({
            // API key (Org Management => API Keys)
            key: process.env.TESTABLE_KEY,
            // Gets logged with the test indicating which user ran this test, defaults to 'remote'
            user: 'demo',
            // browser name: chrome, edge, firefox, openfin 
            browserName: 'chrome',
            // browser version (e.g. latest, latest-1, 90)
            browserVersion: 'latest',
            // size of the display (WxH)
            screenResolution: '1920x1080',
            logCommands: true
        }).toString();
        const browser = await puppeteer.connect({
            timeout: 0,
            browserWSEndpoint: `ws://ec2-3-16-162-61.us-east-2.compute.amazonaws.com:8080/cdp?${params}`
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        const info = await page.evaluate(function testable_info() {});
        console.log(`Testable info: ${JSON.stringify(info)}`);

        // Indicates the start of a test step - you can see progress live on the test result page
        await page.evaluate(function testable_assertion_start() { }, {
            suite: 'Streaming suite',
            name: 'Loading Google and sleeping a while'
        });

        await page.goto('https://www.google.com');
        await page.waitForTimeout(1000);

        // Indicate that we are finishing the test step - updates live on the test results page
        await page.evaluate(function testable_assertion_finish() { }, {
            state: 'passed',
            screenshot: true
        });

        // Capture something into the test log. Log levels include: trace, debug, info, error, fatal
        await page.evaluate(function testable_log() { }, [ 'info', 'Some information I want to capture' ]);
        
        // mark the test as having failed (testable_pass() {} to mark it as passed)
        await page.evaluate(function testable_fail() { }); 

        // counter metric - see our documentation for more details about metrics
        await page.evaluate(function testable_metric() { }, 'counter', {
            name: '# of Orders',
            val: 5,
            units: 'orders'
        });

        // timing metric
        await page.evaluate(function testable_metric() { }, 'timing', {
            name: 'Order Execution Time',
            val: 534,
            units: 'ms'
        });

        // histogram metric where the "key" indicates the bucket
        await page.evaluate(function testable_metric() { }, 'histogram', {
            name: 'Orders By Type',
            key: 'Online',
            val: 5
        });

        // metered metric where the "key" indicates the bucket
        await page.evaluate(function testable_metric() { }, 'metered', {
            name: 'Server Memory Usage',
            key: 'server123',
            val: 34524232,
            units: 'bytes'
        });

        // an assertion
        await page.evaluate(function testable_assertion() { }, {
            suite: 'Example test suite',
            name: 'Load Google and check title',
            duration: Date.now() - start,
            state: 'failed',
            screenshot: true,
            errorType: 'TEST_ERROR',
            error: 'Demo error',
            errorTrace: 'More details about the demo error'
        });

        // screenshosts are also captured into the test results
        await page.screenshot({ path: 'test.png' });
        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();
