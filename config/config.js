/**
 * Centralized Configuration Module
 * Reads environment variables with sensible defaults.
 */
require('dotenv').config();

const config = {
    // Application
    baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',

    // Browser settings
    browser: process.env.BROWSER || 'chromium', // chromium | firefox | webkit
    headless: process.env.HEADLESS !== 'false',  // default: true
    slowMo: parseInt(process.env.SLOW_MO, 10) || 0,
    timeout: parseInt(process.env.TIMEOUT, 10) || 30000,

    // Screenshots
    screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',

    // Database (demonstration only – SauceDemo has no real DB)
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        database: process.env.DB_NAME || 'saucedemo_db',
        user: process.env.DB_USER || 'test_user',
        password: process.env.DB_PASSWORD || 'test_password',
    },
};

module.exports = config;
