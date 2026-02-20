@smoke @negative
Feature: Login Validation
  As a user of SauceDemo
  I want to see clear error messages when I provide wrong credentials
  So that I understand why I cannot access the application

  Scenario: Invalid login shows error message
    Given I attempt login with invalid credentials
    Then I should see an authentication error message
    And I should remain on the login page

  Scenario: Locked out user cannot login
    Given I attempt login as a locked out user
    Then I should see a locked out error message
    And I should remain on the login page
