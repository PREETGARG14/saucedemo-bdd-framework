/**
 * Browser Manager – Driver Factory for Playwright.
 *
 * Launches the browser specified in config (chromium / firefox / webkit),
 * creates a browser context and page, and provides teardown.
 */
const { chromium, firefox, webkit } = require('playwright');
const config = require('../config/config');
const logger = require('./logger');

class BrowserManager {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    /**
     * Launch browser and create a new page.
     * @returns {Promise<import('playwright').Page>}
     */
    async launch() {
        const browserType = config.browser.toLowerCase();
        const launchOptions = {
            headless: config.headless,
            slowMo: config.slowMo,
        };

        logger.info(`Launching ${browserType} browser (headless: ${config.headless})`);

        switch (browserType) {
            case 'firefox':
                this.browser = await firefox.launch(launchOptions);
                break;
            case 'webkit':
                this.browser = await webkit.launch(launchOptions);
                break;
            case 'chromium':
            default:
                this.browser = await chromium.launch(launchOptions);
                break;
        }

        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            ignoreHTTPSErrors: true,
        });

        // Set default timeout from config
        this.context.setDefaultTimeout(config.timeout);

        this.page = await this.context.newPage();
        logger.info('Browser launched and page created');

        return this.page;
    }

    /**
     * Close browser, context, and all pages.
     */
    async close() {
        if (this.page) {
            await this.page.close().catch(() => { });
        }
        if (this.context) {
            await this.context.close().catch(() => { });
        }
        if (this.browser) {
            await this.browser.close().catch(() => { });
            logger.info('Browser closed');
        }
    }
}

module.exports = BrowserManager;
