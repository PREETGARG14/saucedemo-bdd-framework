/**
 * Login Step Definitions
 *
 * No selectors here – all interactions go through Page Objects.
 */
const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const users = require('../testdata/users.json');

// ── Given Steps ──

Given('I login as a standard user', async function () {
  const { username, password } = users.standardUser;
  await this.loginPage.login(username, password);
});

Given('I attempt login with invalid credentials', async function () {
  const { username, password } = users.invalidUser;
  await this.loginPage.login(username, password);
});

Given('I attempt login as a locked out user', async function () {
  const { username, password } = users.lockedOutUser;
  await this.loginPage.login(username, password);
});

// ── Then Steps ──

Then('I should see the Products page', async function () {
  const isDisplayed = await this.inventoryPage.isDisplayed();
  expect(isDisplayed).toBeTruthy();
});

Then('I should see an authentication error message', async function () {
  const errorText = await this.loginPage.getErrorMessage();
  expect(errorText).toBe(
    'Epic sadface: Username and password do not match any user in this service'
  );
});

Then('I should see a locked out error message', async function () {
  const errorText = await this.loginPage.getErrorMessage();
  expect(errorText).toBe(
    'Epic sadface: Sorry, this user has been locked out.'
  );
});

Then('I should remain on the login page', async function () {
  const isOnLogin = await this.loginPage.isOnLoginPage();
  expect(isOnLogin).toBeTruthy();
});
