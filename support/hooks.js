/**
 * Cucumber Hooks – Before / After lifecycle management.
 *
 * Responsibilities:
 *   • Launch browser before each scenario
 *   • Initialise all page objects
 *   • Take screenshot on failure
 *   • Track scenario duration for performance monitoring
 *   • Tear down browser after each scenario
 */
const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const config = require('../config/config');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

// Page objects
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const CartPage = require('../pages/CartPage');
const CheckoutStepOnePage = require('../pages/CheckoutStepOnePage');
const CheckoutStepTwoPage = require('../pages/CheckoutStepTwoPage');
const CheckoutCompletePage = require('../pages/CheckoutCompletePage');

// ── Ensure output directories exist ──
BeforeAll(async function () {
    const dirs = ['reports', 'screenshots', 'logs'];
    for (const dir of dirs) {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    logger.info('═══ Test suite started ═══');
    logger.info(`Browser: ${config.browser} | Headless: ${config.headless} | Base URL: ${config.baseUrl}`);
});

// ── Before each scenario ──
Before(async function (scenario) {
    const tags = scenario.pickle.tags.map(t => t.name).join(', ') || 'none';
    logger.info(`──── Scenario: ${scenario.pickle.name} ────`);
    logger.info(`     Tags: ${tags}`);

    // Track scenario start time
    this.scenarioStartTime = Date.now();

    // Launch browser & create page
    this.page = await this.browserManager.launch();

    // Navigate to base URL
    await this.page.goto(config.baseUrl);
    await this.page.waitForLoadState('domcontentloaded');

    // Initialise page objects
    this.loginPage = new LoginPage(this.page);
    this.inventoryPage = new InventoryPage(this.page);
    this.cartPage = new CartPage(this.page);
    this.checkoutStepOnePage = new CheckoutStepOnePage(this.page);
    this.checkoutStepTwoPage = new CheckoutStepTwoPage(this.page);
    this.checkoutCompletePage = new CheckoutCompletePage(this.page);
});

// ── After each scenario ──
After(async function (scenario) {
    // Calculate scenario duration
    const duration = Date.now() - (this.scenarioStartTime || Date.now());
    const durationSec = (duration / 1000).toFixed(2);

    // Screenshot on failure
    if (scenario.result.status === Status.FAILED && config.screenshotOnFailure) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const scenarioName = scenario.pickle.name.replace(/\s+/g, '_');
        const screenshotPath = path.join(
            process.cwd(),
            'screenshots',
            `FAIL_${scenarioName}_${timestamp}.png`
        );

        try {
            const screenshot = await this.page.screenshot({ fullPage: true });
            fs.writeFileSync(screenshotPath, screenshot);
            logger.info(`Screenshot saved: ${screenshotPath}`);

            // Attach screenshot to Cucumber report
            this.attach(screenshot, 'image/png');
        } catch (err) {
            logger.error(`Failed to take screenshot: ${err.message}`);
        }
    }

    // Close browser
    await this.browserManager.close();

    const statusLabel = scenario.result.status === Status.PASSED ? '✓ PASSED' : '✗ FAILED';
    logger.info(`──── ${statusLabel}: ${scenario.pickle.name} (${durationSec}s) ────\n`);
});

// ── After all scenarios ──
AfterAll(async function () {
    logger.info('═══ Test suite completed ═══');
});
