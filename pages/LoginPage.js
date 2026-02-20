/**
 * LoginPage – Page Object for the SauceDemo Login page.
 *
 * All locators use the `data-test` attribute as the primary strategy
 * for maximum stability. Fallback IDs are noted in comments.
 */
const logger = require('../support/logger');

class LoginPage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;

        // ── Locators (primary: data-test, fallback: id) ──
        this.usernameInput = page.locator('[data-test="username"]');        // fallback: #user-name
        this.passwordInput = page.locator('[data-test="password"]');        // fallback: #password
        this.loginButton = page.locator('[data-test="login-button"]');    // fallback: #login-button
        this.errorMessage = page.locator('[data-test="error"]');
    }

    /**
     * Navigate to the login page.
     */
    async navigate(baseUrl) {
        logger.info(`Navigating to login page: ${baseUrl}`);
        await this.page.goto(baseUrl);
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Perform login with given credentials.
     */
    async login(username, password) {
        logger.info(`Logging in with username: ${username}`);
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    /**
     * Get the text content of the error message element.
     * @returns {Promise<string>}
     */
    async getErrorMessage() {
        await this.errorMessage.waitFor({ state: 'visible' });
        const text = await this.errorMessage.textContent();
        logger.info(`Error message displayed: ${text}`);
        return text;
    }

    /**
     * Check if the user is still on the login page.
     * @returns {Promise<boolean>}
     */
    async isOnLoginPage() {
        return this.page.url().includes('saucedemo.com') &&
            !this.page.url().includes('inventory');
    }
}

module.exports = LoginPage;
