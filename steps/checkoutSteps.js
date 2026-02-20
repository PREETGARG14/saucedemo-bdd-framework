/**
 * Checkout Step Definitions
 */
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const checkoutData = require('../testdata/checkout.json');

When('I checkout with valid customer details', async function () {
  const { firstName, lastName, postalCode } = checkoutData.validCheckout;
  await this.checkoutStepOnePage.fillCheckoutInfo(firstName, lastName, postalCode);
});

When('I continue to the order overview', async function () {
  await this.checkoutStepOnePage.clickContinue();
});

When('I finish the order', async function () {
  await this.checkoutStepTwoPage.clickFinish();
});

Then('I should see the order confirmation page', async function () {
  const isDisplayed = await this.checkoutCompletePage.isDisplayed();
  expect(isDisplayed).toBeTruthy();

  const message = await this.checkoutCompletePage.getConfirmationMessage();
  expect(message).toContain('Thank you for your order');
});
