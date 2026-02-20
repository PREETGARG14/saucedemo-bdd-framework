/**
 * CheckoutCompletePage – Page Object for the order confirmation page.
 */
const logger = require('../support/logger');

class CheckoutCompletePage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;

        // ── Locators ──
        this.completeHeader = page.locator('[data-test="complete-header"]');
        this.completeText = page.locator('[data-test="complete-text"]');
        this.backHomeButton = page.locator('[data-test="back-to-products"]');
        this.pageTitle = page.locator('[data-test="title"]');
        this.ponyExpressImg = page.locator('[data-test="pony-express"]');
    }

    /**
     * Check if the completion page is displayed.
     * @returns {Promise<boolean>}
     */
    async isDisplayed() {
        await this.completeHeader.waitFor({ state: 'visible' });
        return true;
    }

    /**
     * Get the confirmation header text.
     * @returns {Promise<string>}
     */
    async getConfirmationMessage() {
        const text = await this.completeHeader.textContent();
        logger.info(`Order confirmation message: ${text}`);
        return text;
    }

    /**
     * Click Back Home button.
     */
    async clickBackHome() {
        logger.info('Clicking Back Home');
        await this.backHomeButton.click();
    }
}

module.exports = CheckoutCompletePage;
