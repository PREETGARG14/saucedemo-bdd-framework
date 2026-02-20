/**
 * Cart Step Definitions
 */
const { When } = require('@cucumber/cucumber');

When('I go to the shopping cart', async function () {
  await this.inventoryPage.goToCart();
});

When('I proceed to checkout', async function () {
  await this.cartPage.clickCheckout();
});
