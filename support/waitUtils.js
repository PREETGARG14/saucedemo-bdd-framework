/**
 * Wait Utilities – Explicit wait helpers built on top of Playwright's auto-waiting.
 *
 * Playwright already has powerful auto-waiting built into its locator methods
 * (click, fill, etc.). These utilities provide additional convenience wrappers
 * for scenarios where explicit waits are beneficial.
 */
const logger = require('./logger');

const waitUtils = {
    /**
     * Wait for a specific element to become visible on the page.
     * @param {import('playwright').Page} page
     * @param {string} selector
     * @param {number} [timeout=10000]
     */
    async waitForElement(page, selector, timeout = 10000) {
        logger.info(`Waiting for element: ${selector}`);
        await page.locator(selector).waitFor({ state: 'visible', timeout });
    },

    /**
     * Wait for the page URL to contain a specific string.
     * @param {import('playwright').Page} page
     * @param {string} urlPart
     * @param {number} [timeout=10000]
     */
    async waitForUrlContains(page, urlPart, timeout = 10000) {
        logger.info(`Waiting for URL to contain: ${urlPart}`);
        await page.waitForURL(`**/${urlPart}**`, { timeout });
    },

    /**
     * Wait for the page to reach the networkidle state.
     * @param {import('playwright').Page} page
     * @param {number} [timeout=10000]
     */
    async waitForNetworkIdle(page, timeout = 10000) {
        logger.info('Waiting for network idle');
        await page.waitForLoadState('networkidle', { timeout });
    },

    /**
     * Wait for a text to appear on the page.
     * @param {import('playwright').Page} page
     * @param {string} text
     * @param {number} [timeout=10000]
     */
    async waitForText(page, text, timeout = 10000) {
        logger.info(`Waiting for text: "${text}"`);
        await page.getByText(text).waitFor({ state: 'visible', timeout });
    },

    /**
     * Retry an async function until it succeeds or reaches max retries.
     * Useful for eventual consistency checks (e.g., DB polling).
     * @param {Function} fn – Async function to retry
     * @param {number} [maxRetries=3]
     * @param {number} [delayMs=1000]
     */
    async retry(fn, maxRetries = 3, delayMs = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                logger.info(`Retry attempt ${attempt}/${maxRetries} failed: ${error.message}`);
                if (attempt === maxRetries) throw error;
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    },
};

module.exports = waitUtils;
