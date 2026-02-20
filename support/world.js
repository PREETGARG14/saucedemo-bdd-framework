/**
 * Custom Cucumber World – Shares browser state across step definitions.
 *
 * The World object is the `this` context in step definitions.
 * It holds references to the page, browser manager, and page objects.
 */
const { setWorldConstructor } = require('@cucumber/cucumber');
const BrowserManager = require('./browserManager');

class CustomWorld {
    constructor() {
        this.browserManager = new BrowserManager();
        this.page = null;

        // Page objects (initialised in hooks after browser launch)
        this.loginPage = null;
        this.inventoryPage = null;
        this.cartPage = null;
        this.checkoutStepOnePage = null;
        this.checkoutStepTwoPage = null;
        this.checkoutCompletePage = null;
    }
}

setWorldConstructor(CustomWorld);

module.exports = CustomWorld;
