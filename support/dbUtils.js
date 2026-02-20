/**
 * Database Utility – Config-driven DB connection with query execution.
 *
 * ⚠ SauceDemo does NOT provide database access.
 * This utility demonstrates the integration design pattern that would be
 * used in a real application with DB access.
 *
 * In a real project, replace the mock implementation with an actual
 * database driver (e.g., `pg` for PostgreSQL, `mysql2` for MySQL).
 */
const config = require('../config/config');
const logger = require('./logger');

class DatabaseUtils {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    /**
     * Establish a database connection using config-driven settings.
     *
     * Real implementation example (PostgreSQL):
     *   const { Client } = require('pg');
     *   this.connection = new Client(config.db);
     *   await this.connection.connect();
     */
    async connect() {
        try {
            logger.info(`Connecting to DB at ${config.db.host}:${config.db.port}/${config.db.database}`);

            // ── MOCK: Simulated connection ──────────────────────────────
            // In production, replace with:
            //   const { Client } = require('pg');
            //   this.connection = new Client({
            //     host: config.db.host,
            //     port: config.db.port,
            //     database: config.db.database,
            //     user: config.db.user,
            //     password: config.db.password,
            //   });
            //   await this.connection.connect();
            // ────────────────────────────────────────────────────────────
            this.connection = { connected: true };
            this.isConnected = true;
            logger.info('Database connection established (mock)');
        } catch (error) {
            logger.error(`Database connection failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute a SQL query with optional parameters.
     *
     * @param {string} sql – SQL query string
     * @param {Array} [params=[]] – Parameterized values (prevents SQL injection)
     * @returns {Promise<Array>} – Query result rows
     *
     * Real implementation:
     *   const result = await this.connection.query(sql, params);
     *   return result.rows;
     */
    async query(sql, params = []) {
        if (!this.isConnected) {
            throw new Error('Database is not connected. Call connect() first.');
        }

        try {
            logger.info(`Executing query: ${sql}`);
            logger.info(`  Parameters: ${JSON.stringify(params)}`);

            // ── MOCK: Return simulated results ─────────────────────────
            // In production, replace with:
            //   const result = await this.connection.query(sql, params);
            //   return result.rows;
            // ────────────────────────────────────────────────────────────
            return [];
        } catch (error) {
            logger.error(`Query execution failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute a query and return a single row.
     * Convenience method for queries expected to return one result.
     *
     * @param {string} sql – SQL query string
     * @param {Array} [params=[]] – Parameterized values
     * @returns {Promise<object|null>} – Single row or null
     */
    async queryOne(sql, params = []) {
        const rows = await this.query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Execute a function within a database transaction.
     * Provides automatic rollback on error for test isolation.
     *
     * @param {Function} fn – Async function receiving this db instance
     * @returns {Promise<*>} – Return value of fn
     *
     * Usage:
     *   await db.withTransaction(async (db) => {
     *     await db.query('INSERT INTO orders ...', [...]);
     *     const row = await db.queryOne('SELECT ...', [...]);
     *     expect(row.status).toBe('completed');
     *   }); // auto-rollback after test, keeping DB clean
     */
    async withTransaction(fn) {
        if (!this.isConnected) {
            throw new Error('Database is not connected. Call connect() first.');
        }

        try {
            logger.info('BEGIN TRANSACTION');
            // In production: await this.connection.query('BEGIN');

            const result = await fn(this);

            // Rollback instead of commit – test isolation strategy
            logger.info('ROLLBACK TRANSACTION (test isolation)');
            // In production: await this.connection.query('ROLLBACK');

            return result;
        } catch (error) {
            logger.error(`Transaction failed, rolling back: ${error.message}`);
            // In production: await this.connection.query('ROLLBACK');
            throw error;
        }
    }

    /**
     * Close the database connection gracefully.
     */
    async disconnect() {
        try {
            if (this.isConnected && this.connection) {
                // In production: await this.connection.end();
                this.isConnected = false;
                this.connection = null;
                logger.info('Database connection closed');
            }
        } catch (error) {
            logger.error(`Error closing DB connection: ${error.message}`);
            throw error;
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// DB VALIDATION DEMONSTRATION (PSEUDOCODE)
// ═══════════════════════════════════════════════════════════════
//
// The following pseudocode illustrates how a UI test would
// validate a corresponding database record after a purchase flow.
//
// ── Step 1: Execute purchase via UI ──
//   await loginPage.login('standard_user', 'secret_sauce');
//   await inventoryPage.addProductToCart('Sauce Labs Backpack');
//   await inventoryPage.goToCart();
//   await cartPage.clickCheckout();
//   await checkoutStepOnePage.fillCheckoutInfo('John', 'Doe', '12345');
//   await checkoutStepOnePage.clickContinue();
//   await checkoutStepTwoPage.clickFinish();
//   const confirmationText = await checkoutCompletePage.getConfirmationMessage();
//   assert(confirmationText === 'Thank you for your order!');
//
// ── Step 2: Validate DB record (with retry for eventual consistency) ──
//   const db = new DatabaseUtils();
//   await db.connect();
//
//   // Sample SQL: Verify the order was persisted
//   const ORDER_QUERY = `
//     SELECT o.order_id, o.status, o.total_amount, oi.product_name
//     FROM orders o
//     JOIN order_items oi ON o.order_id = oi.order_id
//     WHERE o.user_id = $1
//     ORDER BY o.created_at DESC
//     LIMIT 1;
//   `;
//
//   // Retry logic for eventual consistency
//   const orderRecord = await waitUtils.retry(async () => {
//     const rows = await db.query(ORDER_QUERY, ['standard_user']);
//     if (rows.length === 0) throw new Error('Order not yet in DB');
//     return rows[0];
//   }, 5, 2000); // 5 retries, 2 sec delay
//
//   // Assertions
//   assert(orderRecord.status === 'completed');
//   assert(orderRecord.product_name === 'Sauce Labs Backpack');
//   assert(orderRecord.total_amount === 32.39);
//
// ── Step 3: Cleanup using transaction-based rollback ──
//   // Option A: Transaction rollback (preferred for isolation)
//   await db.withTransaction(async (db) => {
//     const rows = await db.query(ORDER_QUERY, ['standard_user']);
//     assert(rows[0].status === 'completed');
//   }); // auto-rollback – no cleanup needed
//
//   // Option B: Manual cleanup (when transactions aren't possible)
//   await db.query('DELETE FROM order_items WHERE order_id = $1', [orderRecord.order_id]);
//   await db.query('DELETE FROM orders WHERE order_id = $1', [orderRecord.order_id]);
//   await db.disconnect();
//
// ── Isolation Strategy ──
//   • Each test uses a unique user or generates a unique test identifier
//   • DB cleanup occurs in the After hook to ensure isolation
//   • Transaction-based rollback (withTransaction) is preferred
//   • Tests never share state—each scenario starts with a clean slate
//
// ── Eventual Consistency Handling ──
//   • Use retry logic (waitUtils.retry) to poll the DB
//   • Configurable max retries and delay between attempts
//   • Prevents false negatives caused by async processing delays
// ═══════════════════════════════════════════════════════════════

module.exports = DatabaseUtils;
