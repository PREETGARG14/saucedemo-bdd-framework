/**
 * InventoryPage – Page Object for the Products / Inventory page.
 *
 * Locator strategy:
 *   Primary  → data-test attributes (e.g. add-to-cart-sauce-labs-backpack)
 *   Fallback → id attributes (e.g. #add-to-cart-sauce-labs-backpack)
 *
 * The "add to cart" locator is dynamically generated from the product name
 * by converting to lowercase and replacing spaces with hyphens.
 */
const logger = require('../support/logger');

class InventoryPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;

        // ── Locators ──
        this.pageTitle = page.locator('[data-test="title"]');
        this.inventoryItems = page.locator('[data-test="inventory-item"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
        this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    }

    /**
     * Check if the inventory page is displayed.
     * @returns {Promise<boolean>}
     */
    async isDisplayed() {
        await this.pageTitle.waitFor({ state: 'visible' });
        const title = await this.pageTitle.textContent();
        logger.info(`Inventory page title: ${title}`);
        return title === 'Products';
    }

    /**
     * Add a product to the cart by its visible name.
     *
     * Primary strategy: uses `data-test="add-to-cart-{product-slug}"` where
     * the slug is the name lowercased with spaces replaced by hyphens.
     *
     * Fallback strategy: locate the inventory item containing the product name,
     * then click its "Add to cart" button.
     *
     * @param {string} productName – e.g. "Sauce Labs Backpack"
     */
    async addProductToCart(productName) {
        logger.info(`Adding product to cart: ${productName}`);

        // Primary locator: data-test attribute derived from product name
        const slug = productName.toLowerCase().replace(/\s+/g, '-');
        const primaryLocator = this.page.locator(`[data-test="add-to-cart-${slug}"]`);

        try {
            await primaryLocator.click({ timeout: 5000 });
            logger.info(`Added "${productName}" via primary locator (data-test)`);
        } catch {
            // Fallback: find the inventory item containing the product name text
            logger.info(`Primary locator failed, trying fallback for "${productName}"`);
            const item = this.page
                .locator('[data-test="inventory-item"]')
                .filter({ hasText: productName });
            await item.locator('button', { hasText: 'Add to cart' }).click();
            logger.info(`Added "${productName}" via fallback locator (text filter)`);
        }
    }

    /**
     * Get the current cart badge count.
     * @returns {Promise<number>} – 0 if badge is not visible.
     */
    async getCartBadgeCount() {
        const isVisible = await this.cartBadge.isVisible();
        if (!isVisible) return 0;
        const text = await this.cartBadge.textContent();
        const count = parseInt(text, 10);
        logger.info(`Cart badge count: ${count}`);
        return count;
    }

    /**
     * Click the shopping cart icon to navigate to the Cart page.
     */
    async goToCart() {
        logger.info('Navigating to cart');
        await this.cartLink.click();
    }
}

module.exports = InventoryPage;
