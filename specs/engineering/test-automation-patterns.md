# Test Automation Patterns

This document establishes **core patterns** for writing maintainable, reliable Playwright tests for BuggyBoard. All new and refactored tests must follow these conventions.

## Page Object Model (POM)

We use the **Page Object Model** pattern to encapsulate page structure and behavior, making tests readable, maintainable, and robust.

**Guiding principle:** Tests should express _what_ users do (business logic), not _how_ the browser does it. Page objects handle the _how_.

### Why Page Objects?

- **Decouples tests from UI** – When the UI changes, update the page object, not dozens of tests
- **Improves readability** – Tests read like user stories, not raw browser calls
- **Reduces duplication** – Shared element locators and interactions live in one place
- **Easier debugging** – Failed assertions point to page objects, not scattered test code
- **Faster refactoring** – Rename a method once instead of updating all tests

### Architecture

```
tests/
  fixtures/            ← Fixture definitions for page objects
    pages.ts
  pages/               ← Page object classes
    LoginPage.ts
    BoardPage.ts
    CreateBugModal.ts
    EditBugModal.ts
    TitleBar.ts
  create-bug/
    open-create-bug-modal.spec.ts
    create-bug-success.spec.ts
  delete-bug/
    should-delete.spec.ts
  search-bug/
    search-atomic.spec.ts
```

### File Structure: One Page Object Per File

**Rule:** Each page object class occupies its own file under `tests/pages/`.

File naming: `<PageName>.ts` (e.g., `LoginPage.ts`, `CreateBugModal.ts`)

```typescript
// tests/pages/LoginPage.ts
import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.textContent() || "";
  }
}
```

### Page Object Class Anatomy

1. **Constructor** – Accepts the Playwright `Page` object and initializes all locators
2. **Locators** – Store element references as class properties (do not hardcode in methods)
3. **Navigation** – Methods to navigate to the page (`goto()`)
4. **User actions** – Methods that simulate user interactions (`login()`, `fillForm()`, `submit()`)
5. **Queries** – Methods that read/verify page state (`getErrorMessage()`, `isButtonDisabled()`)

### Locator Best Practices

Use **semantic locators** in order of preference:

1. **Role-based** – `page.getByRole('button', { name: 'Submit' })`
2. **Label** – `page.getByLabel('Username')`
3. **Placeholder** – `page.getByPlaceholder('Enter email')`
4. **Text** – `page.getByText('Welcome')`
5. **Test ID** – `page.getByTestId('submit-button')`
6. **CSS/XPath** – Last resort only

**Why?** Role-based and label-based locators are most resilient to layout changes and accessible.

### Test Pattern: Arrange-Act-Assert

```typescript
import { test, expect } from "../fixtures/pages";

test("user can log in with valid credentials", async ({ loginPage, page }) => {
  // Arrange
  await loginPage.goto();

  // Act
  await loginPage.login("alice", "password123");

  // Assert
  await expect(page).toHaveURL("/board");
});
```

Each test is **atomic** – it focuses on one behavior and does not depend on state from other tests.

### Common Page Object Methods

| Pattern            | Purpose             | Example                          |
| ------------------ | ------------------- | -------------------------------- |
| `async goto()`     | Navigate to page    | `await page.goto('/login')`      |
| `async <action>()` | Perform user action | `await page.login(user, pass)`   |
| `get<Value>()`     | Query/read state    | `await page.getErrorMessage()`   |
| `is<State>()`      | Check condition     | `await page.isButtonDisabled()`  |
| `has<Element>()`   | Check visibility    | `await page.hasSuccessMessage()` |

### Combining Page Objects (Composite Pages)

When a workflow spans multiple pages, use multiple page objects in the test:

```typescript
import { test, expect } from "../fixtures/pages";

test("user creates a bug and views it on the board", async ({
  boardPage,
  createBugModal,
}) => {
  // Arrange
  // Act
  await boardPage.goto();
  await boardPage.clickCreateButton();
  await createBugModal.fillBugForm({
    title: "Login button broken",
    severity: "high",
  });
  await createBugModal.clickSubmit();

  // Assert
  await expect(boardPage.getBugRow("Login button broken")).toBeVisible();
});
```

### Modal and Overlay Pages

Modals and overlays inherit the same pattern but represent a contained UI context:

```typescript
// tests/pages/CreateBugModal.ts
export class CreateBugModal {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly submitButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel("Title");
    this.submitButton = page.getByRole("button", { name: "Create" });
    this.closeButton = page.getByRole("button", { name: "Cancel" });
  }

  async fillBugForm(data: { title: string; severity: string }) {
    await this.titleInput.fill(data.title);
    await page.getByLabel("Severity").selectOption(data.severity);
  }

  async clickSubmit() {
    await this.submitButton.click();
    await this.page.waitForSelector('[role="dialog"]', { state: "hidden" });
  }
}
```

## Page Object Fixtures

**Rule:** All tests must obtain page object instances through fixtures, not by constructing them directly.

### Dedicated `fixtures` section

All custom Playwright fixtures must be stored in the dedicated `tests/fixtures/` directory:

```
tests/
  fixtures/
    pages.ts       # shared custom test object and page-object fixtures
  pages/
    LoginPage.ts
    BoardPage.ts
    CreateBugModal.ts
    EditBugModal.ts
    TitleBar.ts
```

The fixture module in `tests/fixtures/pages.ts` is the project's custom test object. It must be built with Playwright's `test.extend()` pattern:

1. Import `test as base` from `@playwright/test`.
2. Declare a TypeScript fixture type for every page object.
3. Create each page object inside its fixture callback using the built-in `page` fixture.
4. Call `await use(pageObject)` to provide it to the test.
5. Put fixture-specific cleanup after `await use(...)` when cleanup is required.
6. Export the extended `test` and re-export `expect` from the fixture module.

Page-object constructors belong in `tests/fixtures/`, never in test files. Fixtures are test-scoped by default, isolated between tests, lazy, composable, and automatically torn down by Playwright around the `await use(...)` boundary.

### Mandatory fixture policy

- Create one fixture for every page object class under `tests/pages/`.
- Register every page-object fixture in the shared `tests/fixtures/pages.ts` fixture file.
- Tests must import `test` from the shared fixture module and request page objects through test callback parameters.
- Tests must call page-object methods and locators supplied by fixtures; they must never call page-object constructors such as `new LoginPage(page)` or `new BoardPage(page)`.
- When a test needs multiple page objects, request all of them as fixtures rather than constructing them inside the test.
- Add a page-object fixture before writing or updating tests that use a new page object.
- Direct browser interactions belong in fixtures and page-object classes, not duplicated in test bodies.

Fixtures provide automatic teardown, proper lifecycle management, and consistent page object initialization across all tests. This prevents memory leaks, ensures isolation, and makes test code cleaner.

### Why Fixtures Over Direct Construction?

- **Automatic teardown** – Playwright manages page object lifecycle without manual cleanup
- **Isolation** – Each test gets a fresh instance; no state leakage between tests
- **Composition** – Fixtures can depend on other fixtures, enabling complex test setups
- **Reusability** – Define once, use across many test files
- **Easy mocking** – Replace fixtures in specific tests without changing test code

### Fixture File Structure

Create the shared fixture module under the dedicated `tests/fixtures/` section:

```typescript
// tests/fixtures/pages.ts
import { test as base, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { BoardPage } from "../pages/BoardPage";
import { CreateBugModal } from "../pages/CreateBugModal";
import { EditBugModal } from "../pages/EditBugModal";

// Declare fixture types for TypeScript support
type PagesFixtures = {
  loginPage: LoginPage;
  boardPage: BoardPage;
  createBugModal: CreateBugModal;
  editBugModal: EditBugModal;
};

// Create and export custom test function with fixtures
export const test = base.extend<PagesFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
    // Cleanup happens automatically
  },

  boardPage: async ({ page }, use) => {
    const boardPage = new BoardPage(page);
    await use(boardPage);
  },

  createBugModal: async ({ page }, use) => {
    const modal = new CreateBugModal(page);
    await use(modal);
  },

  editBugModal: async ({ page }, use) => {
    const modal = new EditBugModal(page);
    await use(modal);
  },
});

export { expect } from "@playwright/test";
```

### Using Page Object Fixtures in Tests

Import the custom `test` function from your fixtures file instead of `@playwright/test`:

```typescript
// tests/login/login-success.spec.ts
import { test, expect } from "../fixtures/pages";

test("user can log in with valid credentials", async ({ loginPage, page }) => {
  // Arrange
  await loginPage.goto();

  // Act
  await loginPage.login("alice", "password123");

  // Assert
  await expect(page).toHaveURL("/board");
});
```

Notice:

- Import `test` from `../fixtures/pages`, not from `@playwright/test`
- Destructure fixtures from test parameters: `{ loginPage, page }`
- No manual instantiation: page objects are provided as fixture parameters ✅
- Tests are cleaner and focus purely on behavior

### Fixture usage checklist

Before adding or modifying a Playwright test, verify:

- The test imports `test` from `tests/fixtures/pages.ts` using the correct relative path.
- Every page object used by the test is listed as a test callback parameter.
- No page-object class is imported into the test solely to call `new`.
- No page-object constructor is called from a test, hook, or test helper.
- New page objects have a corresponding fixture in `tests/fixtures/pages.ts`.
- Setup and teardown that belong to a page object are implemented inside its fixture or page-object class.

### Fixture Parameters and Dependencies

Fixtures can depend on other fixtures. For example, a fixture that logs in before running a test:

```typescript
// tests/fixtures/pages.ts (extended)
import { test as base } from "@playwright/test";

export const test = base.extend<PagesFixtures>({
  // ... other fixtures ...

  boardPageLoggedIn: async ({ page, loginPage }, use) => {
    // This fixture depends on loginPage
    // It automatically logs in before the test runs
    await loginPage.goto();
    await loginPage.login("alice", "password123");

    const boardPage = new BoardPage(page);
    await use(boardPage);
  },
});
```

Then use it in tests:

```typescript
test("user can create a bug from the board", async ({ boardPageLoggedIn }) => {
  // Already logged in, ready to interact with board
  await boardPageLoggedIn.clickCreateButton();
  // ...
});
```

### Scoping Fixtures

Control when fixtures are created and destroyed using the `scope` option:

```typescript
export const test = base.extend<PagesFixtures>({
  // scope: 'test' (default) – Fresh instance per test
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // scope: 'worker' – Shared across tests in same worker (faster)
  sharedResource: async ({}, use) => {
    const resource = await setupExpensiveResource();
    await use(resource);
    await resource.cleanup();
  },
});
```

Use `scope: 'test'` (default) for page objects to ensure test isolation.

### Common Fixture Patterns

#### Pre-authenticated Fixture

```typescript
boardPageAuthenticatedAs: async ({ page }, use, testInfo) => {
  const username = testInfo.title.includes('admin') ? 'admin' : 'user';
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, 'password123');

  const boardPage = new BoardPage(page);
  await use(boardPage);
},
```

#### Modal/Dialog Fixture

```typescript
createModalOpen: async ({ page, boardPage }, use) => {
  const modal = new CreateBugModal(page);
  await boardPage.goto();
  await boardPage.clickCreateButton();
  await modal.waitForVisible();
  await use(modal);
},
```

### Anti-Pattern: Constructing Page Objects in Tests

| ❌ Don't Do This                                   | ✅ Do This Instead                                       |
| -------------------------------------------------- | -------------------------------------------------------- |
| `const loginPage = new LoginPage(page);`           | Import from `../fixtures/pages` and request as parameter |
| `const boardPage = new BoardPage(page);`           | Request `{ boardPage }` from the fixture                |
| `const modal = new CreateBugModal(page);`          | Request `{ createBugModal }` from the fixture            |
| Instantiate in every test                          | Define once in fixture, reuse everywhere                 |
| Manual cleanup in test                             | Fixtures handle automatic teardown                       |
| Mixed import sources (`@playwright/test` + custom) | Always import `test` from `../fixtures/pages`            |

### References

- [Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Fixture Dependencies](https://playwright.dev/docs/test-fixtures#fixture-dependencies)
- [Fixture Scope](https://playwright.dev/docs/test-fixtures#scope)
- [Playwright Page Object Model](https://playwright.dev/docs/pom)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)

---

**Last updated:** May 2026  
**Maintained by:** Engineering team
