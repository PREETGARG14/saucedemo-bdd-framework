/**
 * CheckoutStepOnePage – Page Object for the "Your Information" checkout step.
 */
const logger = require('../support/logger');

class CheckoutStepOnePage {
    /**
     * @param {import('playwright').Page} page
     */
    constructor(page) {
        this.page = page;

        // ── Locators ──
        this.firstNameInput = page.locator('[data-test="firstName"]');      // fallback: #first-name
        this.lastNameInput = page.locator('[data-test="lastName"]');       // fallback: #last-name
        this.postalCodeInput = page.locator('[data-test="postalCode"]');     // fallback: #postal-code
        this.continueButton = page.locator('[data-test="continue"]');       // fallback: #continue
        this.cancelButton = page.locator('[data-test="cancel"]');
        this.errorMessage = page.locator('[data-test="error"]');
    }

    /**
     * Fill in checkout information and proceed.
     */
    async fillCheckoutInfo(firstName, lastName, postalCode) {
        logger.info(`Filling checkout info: ${firstName} ${lastName}, ${postalCode}`);
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.postalCodeInput.fill(postalCode);
    }

    /**
     * Click Continue to proceed to the Overview page.
     */
    async clickContinue() {
        logger.info('Clicking Continue on checkout step one');
        await this.continueButton.click();
    }
}

module.exports = CheckoutStepOnePage;
