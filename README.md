# SauceDemo BDD Automation Framework

> **Playwright + Cucumber.js** BDD automation framework for testing [SauceDemo](https://www.saucedemo.com/).

---

## 📁 Project Structure

```
saucedemo-bdd-framework/
├── features/                # Gherkin .feature files
│   ├── purchase.feature     # Happy path – E2E purchase flow
│   └── login.feature        # Negative – Invalid & locked-out login
├── steps/                   # Step definitions (no selectors here)
│   ├── loginSteps.js
│   ├── inventorySteps.js
│   ├── cartSteps.js
│   └── checkoutSteps.js
├── pages/                   # Page Objects (locators + actions)
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   ├── CartPage.js
│   ├── CheckoutStepOnePage.js
│   ├── CheckoutStepTwoPage.js
│   └── CheckoutCompletePage.js
├── support/                 # Utilities & infrastructure
│   ├── browserManager.js    # Driver factory (browser launcher)
│   ├── hooks.js             # Before/After hooks + screenshot on failure
│   ├── world.js             # Custom Cucumber World
│   ├── waitUtils.js         # Wait & retry utilities
│   ├── logger.js            # Winston logging (console + file)
│   ├── dbUtils.js           # DB connection utility + pseudocode
│   └── reportGenerator.js   # HTML report generation
├── config/
│   └── config.js            # Centralized environment configuration
├── testdata/
│   ├── users.json           # User credential fixtures
│   ├── checkout.json        # Checkout form data fixtures
│   └── products.json        # Product catalog fixtures
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI pipeline
├── .env.example             # Environment template (no real credentials)
├── cucumber.js              # Cucumber profile configuration
└── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Playwright Browsers
```bash
npx playwright install
```

### 3. Configure Environment
```bash
# Copy the template and modify as needed
cp .env.example .env
```

---

## ▶️ How to Run Tests

### Run All Tests
```bash
npm test
```

**Test Execution Demo:**

[Watch Test Execution Video (Google Drive)](https://drive.google.com/file/d/1SCODJap6hwO3rXEw3DJEtX_Blkk38Ldu/view?usp=sharing)

### Run by Tag
```bash
npm run test:smoke        # @smoke scenarios
npm run test:negative     # @negative scenarios
npm run test:e2e          # @e2e scenarios
```

### Run in Headed Mode (visible browser)
```bash
npm run test:headed
```

### Run with a Different Browser
```bash
npm run test:firefox      # Firefox
npm run test:webkit       # WebKit (Safari engine)
```

### Run in Parallel
```bash
npm run test:parallel     # Runs scenarios across 2 workers
```

### Run with Retry (flaky tolerance)
```bash
npm run test:retry        # Retries failed scenarios once
```

### Change Browser/Headless via .env
Edit `.env`:
```
BROWSER=firefox       # chromium | firefox | webkit
HEADLESS=false        # true | false
```

### Generate HTML Report
```bash
npm run report
```

Report generated at: `reports/html-report/index.html`

---

## 🎯 Locator Strategy for Adding "Sauce Labs Backpack"

### 1. Robust Locator Strategy (Primary – Implemented)

```javascript
// data-test attribute – purpose-built for automation
const slug = productName.toLowerCase().replace(/\s+/g, '-');
page.locator(`[data-test="add-to-cart-${slug}"]`);
// Resolves to: [data-test="add-to-cart-sauce-labs-backpack"]
```

**Why this is robust:**
- `data-test` attributes are **dedicated automation hooks** added specifically for testing
- They are **decoupled from styling** – CSS refactors won't break them
- They are **decoupled from structure** – DOM reorganizations won't break them
- The naming convention (`add-to-cart-{product-slug}`) is **predictable and self-documenting**
- This pattern is **dynamically generated** from the product name, making it reusable for any product

### 2. Fallback Locator Strategy (Acceptable)

```javascript
// Text-based filtering within a structural container
const item = page
  .locator('[data-test="inventory-item"]')
  .filter({ hasText: productName });
item.locator('button', { hasText: 'Add to cart' }).click();
```

**Why this is acceptable but less ideal:**
- Relies on **visible text content**, which could change with UI copy updates
- More resilient than pure XPath or index-based approaches
- Uses Playwright's `filter()` to scope within a product container, avoiding ambiguity
- Falls back gracefully if the primary `data-test` attribute changes

### ❌ Avoided Approaches
| Approach | Why Avoided |
|----------|-------------|
| `div:nth-child(1) button` | Index-based – breaks if products reorder |
| `//div[@class="inventory_item"][1]//button` | Brittle XPath – coupled to class names and DOM structure |
| `.btn_primary.btn_inventory` | Class-based – breaks on CSS refactors |

---

## 🗄️ Database Testing with Automation

### DB Connection Utility

Located in `support/dbUtils.js`. Provides:
- **Config-driven connection** – reads host, port, database, credentials from `.env`
- **Query execution** – parameterized queries (prevents SQL injection)
- **`queryOne()` convenience method** – for single-row queries
- **`withTransaction()` helper** – transaction-based rollback for test isolation
- **Error handling** – try/catch with logging around all operations
- **Clean teardown** – `disconnect()` method for proper connection cleanup

### DB Validation Pseudocode

```javascript
// After completing a purchase via UI...

const db = new DatabaseUtils();
await db.connect();

// Step 1: Query the order record
const ORDER_QUERY = `
  SELECT o.order_id, o.status, o.total_amount, oi.product_name
  FROM orders o
  JOIN order_items oi ON o.order_id = oi.order_id
  WHERE o.user_id = $1
  ORDER BY o.created_at DESC LIMIT 1;
`;

// Step 2: Retry for eventual consistency
const orderRecord = await waitUtils.retry(async () => {
  const rows = await db.query(ORDER_QUERY, ['standard_user']);
  if (rows.length === 0) throw new Error('Order not yet in DB');
  return rows[0];
}, 5, 2000); // 5 retries, 2-second delay

// Step 3: Assert DB record matches UI
assert(orderRecord.status === 'completed');
assert(orderRecord.product_name === 'Sauce Labs Backpack');
assert(orderRecord.total_amount === 32.39);

// Step 4: Cleanup for test isolation
// Option A: Transaction rollback (preferred)
await db.withTransaction(async (db) => {
  const rows = await db.query(ORDER_QUERY, ['standard_user']);
  assert(rows[0].status === 'completed');
}); // auto-rollback – DB stays clean

// Option B: Manual cleanup (when transactions aren't possible)
await db.query('DELETE FROM order_items WHERE order_id = $1', [orderRecord.order_id]);
await db.query('DELETE FROM orders WHERE order_id = $1', [orderRecord.order_id]);
await db.disconnect();
```

**Isolation Strategy:**
- Each test uses a unique user or generates a unique test identifier
- Transaction-based rollback (`withTransaction()`) is the preferred approach
- Manual cleanup runs in the `After` hook as a fallback
- Tests never share state – each scenario starts clean

**Eventual Consistency Handling:**
- `waitUtils.retry()` polls the database with configurable retries and delay
- Prevents false negatives from async processing delays

---

## 📝 Engineering Notes

### 1. Why this framework structure?

The structure follows the **Page Object Model (POM)** pattern combined with BDD, enforcing strict separation of concerns:

- **`/features`** – Business-readable Gherkin specs that serve as living documentation. Stakeholders can read and validate these without understanding code.
- **`/steps`** – Thin glue code that delegates to page objects. **No selectors exist here** – steps only orchestrate page method calls and assertions. This makes steps reusable across multiple features.
- **`/pages`** – Single source of truth for all locators and page interactions. When a UI element changes, only one file needs updating, not every test that touches that element.
- **`/support`** – Cross-cutting infrastructure (browser lifecycle, logging, hooks, DB utility) is completely separated from test logic, making it independently maintainable and testable.
- **`/testdata`** – Externalised fixture data (JSON) enables easy updates without touching test code, and supports data-driven testing via `Scenario Outline`.

### 2. How does the wait strategy prevent flakiness?

The framework uses a **layered wait strategy** with zero hard sleeps:

1. **Playwright's auto-waiting (primary):** Every Playwright action (`click`, `fill`, `textContent`) automatically waits for elements to be actionable – visible, enabled, and stable. This eliminates ~90% of timing issues out of the box.
2. **Explicit waits (supplementary):** `waitUtils.js` provides `waitForElement()`, `waitForUrlContains()`, `waitForText()`, and `waitForNetworkIdle()` for scenarios where auto-waiting isn't sufficient (e.g., waiting for a specific URL after navigation, or for dynamic content to appear).
3. **Configurable timeouts:** Global timeouts are set via `config.timeout` (default: 30s) and applied at the browser context level. Individual waits accept custom timeout parameters.
4. **Retry logic:** `waitUtils.retry()` handles eventually consistent operations (like DB polling) with configurable max retries and delay, without blocking.

### 3. How does the locator strategy improve stability?

- **Primary: `data-test` attributes** – These are automation-specific hooks that are immune to CSS refactors, DOM restructuring, and text changes. SauceDemo provides these on every interactive element, and our framework leverages them consistently.
- **Dynamic slug generation** – For product-specific locators, we generate `data-test` values from the product name (e.g., `"Sauce Labs Backpack"` → `add-to-cart-sauce-labs-backpack`), making the framework handle any product without hardcoded selectors.
- **Fallback: Scoped text filtering** – If `data-test` attributes are unavailable, we use Playwright's `filter({ hasText })` within a parent container, which is more resilient than XPath or CSS class selectors.
- **Centralized in Page Objects** – A locator change propagates automatically to every scenario using that page. Steps never contain selectors.

### 4. How would you scale this to 50+ scenarios?

- **Tag-based execution:** `@smoke`, `@regression`, `@e2e`, `@negative` – run subsets via `npm run test:smoke`, keeping CI fast
- **Parallel execution:** `npm run test:parallel` distributes scenarios across worker threads – already configured
- **Shared step definitions:** Reusable steps like `"I login as a standard user"` work across many scenarios without duplication
- **Data-driven tests:** Cucumber `Scenario Outline` with `Examples` tables for parameterized tests (e.g., testing all 6 products from `products.json`)
- **Feature organization:** Group features by domain area (auth, cart, checkout, search, etc.) as the suite grows
- **CI/CD parallelism:** Run browser matrix (chromium, firefox, webkit) as separate CI jobs in parallel
- **Page component pattern:** Break large page objects into smaller component objects (e.g., `HeaderComponent`, `FilterComponent`) as pages grow complex

### 5. How would you execute this in CI/CD?

A complete GitHub Actions CI workflow is included at `.github/workflows/ci.yml`:

```yaml
# Triggers on push/PR to main and develop
# Runs tests across chromium, firefox, webkit matrix
# Uploads screenshots (on failure) and reports as artifacts
```

Key CI/CD practices implemented:
- **Browser matrix strategy** – Tests run against 3 browser engines in parallel
- **`npm ci`** instead of `npm install` for deterministic dependency resolution
- **`npx playwright install --with-deps`** – Installs only the needed browser and its OS dependencies
- **Artifact uploads** – Test reports, failure screenshots, and logs are preserved for 14 days
- **`fail-fast: false`** – All browser jobs complete even if one fails, giving full cross-browser visibility

### 6. Two improvements with more time

1. **Visual regression testing:** Integrate Playwright's `toHaveScreenshot()` for pixel-level comparisons of key pages (login, inventory, cart, checkout confirmation). This catches unintended UI changes like layout shifts, font changes, or color mismatches that functional tests miss.

2. **API-layer seeding:** Instead of using the UI to set up test preconditions (e.g., navigating to login, filling credentials), use API calls in the `Before` hook to seed state (e.g., authenticate via API, set cookies directly). This makes tests faster, more independent, and reduces the surface area for failures in setup steps.

---

## ⭐ Bonus Features Implemented

| Feature | Implementation | Command |
|---------|---------------|---------|
| **Tag-based execution** | `@smoke`, `@e2e`, `@negative` tags on features | `npm run test:smoke` |
| **HTML reporting** | `multiple-cucumber-html-reporter` generates rich reports | `npm run report` |
| **GitHub Actions CI** | Full workflow at `.github/workflows/ci.yml` | Auto-runs on push/PR |
| **Parallel execution** | Cucumber.js `--parallel` flag with 2 workers | `npm run test:parallel` |
| **Retry logic** | Cucumber.js `--retry` flag for flaky resilience | `npm run test:retry` |

---

## 🤖 AI / Copilot Usage Disclosure

- **AI tools used:** GitHub Copilot was used minimally for code autocompletion
- **AI-assisted parts:** Minor boilerplate autocompletion (e.g., JSDoc comments, repetitive locator patterns)
- **Human-driven work:** Framework architecture, design decisions, locator strategy, BDD scenario design, hooks implementation, DB utility design, wait strategy, and all configuration were done manually. All locators were verified by exploring the live SauceDemo site.

---

## 📋 Assumptions

1. SauceDemo is accessible and stable at `https://www.saucedemo.com`
2. Standard user credentials (`standard_user` / `secret_sauce`) remain valid
3. The `data-test` attributes on the site remain consistent
4. Node.js 18+ is available in the execution environment
5. Database testing is demonstration-only since SauceDemo provides no DB access
