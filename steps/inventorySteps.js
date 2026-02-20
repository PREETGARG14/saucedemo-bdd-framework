/**
 * Inventory Step Definitions
 *
 * Handles adding products to cart and verifying cart badge.
 */
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

When('I add {string} to the cart', async function (productName) {
  await this.inventoryPage.addProductToCart(productName);
});

Then('the cart badge should show {string} item', async function (expectedCount) {
  const actualCount = await this.inventoryPage.getCartBadgeCount();
  expect(actualCount).toBe(parseInt(expectedCount, 10));
});
