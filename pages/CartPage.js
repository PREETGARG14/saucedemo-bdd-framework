/**
 * CartPage – Page Object for the Shopping Cart page.
 */
const logger = require('../support/logger');

class CartPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;

        // ── Locators ──
        this.cartItems = page.locator('[data-test="inventory-item"]');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.continueShopBtn = page.locator('[data-test="continue-shopping"]');
        this.pageTitle = page.locator('[data-test="title"]');
    }

    /**
     * Check if the cart page is displayed.
     * @returns {Promise<boolean>}
     */
    async isDisplayed() {
        await this.pageTitle.waitFor({ state: 'visible' });
        const title = await this.pageTitle.textContent();
        logger.info(`Cart page title: ${title}`);
        return title === 'Your Cart';
    }

    /**
     * Get the list of item names in the cart.
     * @returns {Promise<string[]>}
     */
    async getCartItemNames() {
        const items = await this.cartItems.locator('[data-test="inventory-item-name"]').allTextContents();
        logger.info(`Cart items: ${items.join(', ')}`);
        return items;
    }

    /**
     * Click the Checkout button.
     */
    async clickCheckout() {
        logger.info('Clicking Checkout button');
        await this.checkoutButton.click();
    }
}

module.exports = CartPage;
