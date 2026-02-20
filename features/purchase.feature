@smoke @e2e
Feature: End-to-End Purchase Flow
  As a customer of SauceDemo
  I want to be able to purchase products
  So that I can complete my shopping experience

  Scenario: Successful purchase of a single product
    Given I login as a standard user
    Then I should see the Products page
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge should show "1" item
    When I go to the shopping cart
    And I proceed to checkout
    And I checkout with valid customer details
    And I continue to the order overview
    And I finish the order
    Then I should see the order confirmation page
