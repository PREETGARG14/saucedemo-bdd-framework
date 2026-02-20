/**
 * CheckoutStepTwoPage – Page Object for the Checkout Overview page.
 */
const logger = require('../support/logger');

class CheckoutStepTwoPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;

        // ── Locators ──
        this.finishButton = page.locator('[data-test="finish"]');         // fallback: #finish
        this.cancelButton = page.locator('[data-test="cancel"]');
        this.pageTitle = page.locator('[data-test="title"]');
        this.itemTotal = page.locator('[data-test="subtotal-label"]');
        this.tax = page.locator('[data-test="tax-label"]');
        this.total = page.locator('[data-test="total-label"]');
    }

    /**
     * Check if the overview page is displayed.
     * @returns {Promise<boolean>}
     */
    async isDisplayed() {
        await this.pageTitle.waitFor({ state: 'visible' });
        const title = await this.pageTitle.textContent();
        logger.info(`Checkout overview title: ${title}`);
        return title === 'Checkout: Overview';
    }

    /**
     * Click Finish to complete the order.
     */
    async clickFinish() {
        logger.info('Clicking Finish to complete order');
        await this.finishButton.click();
    }
}

module.exports = CheckoutStepTwoPage;
