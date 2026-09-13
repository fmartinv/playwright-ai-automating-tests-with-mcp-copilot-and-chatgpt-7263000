# Delete Bug Test Plan

## Objective

Validate the delete flow described in `specs/features/12-delete-bug.md`:

- An authenticated user can open a bug and see the `Delete` action.
- Clicking `Delete` opens a confirmation modal.
- Confirming removes the bug, closes the dialogs, and updates the board.
- Canceling keeps the bug and returns the user to the edit modal.

Tests must be independent, use the Page Object Model, follow Arrange-Act-Assert, and run with the repository's Playwright setup.

## Test setup and isolation

Use the fixtures in `tests/fixtures/pages.ts`:

- `loginPage` – authenticate with `loginWithFirstUser()`.
- `boardPage` – interact with the board and open a bug row.
- `createBugModal` – create the test bug.
- `editBugModal` – interact with the edit and delete-confirmation dialogs.

Each test must create its own fresh bug during `beforeEach` before any delete action:

1. Log in through `loginPage.loginWithFirstUser()`.
2. Generate a unique title, for example `delete-bug-${Date.now()}`.
3. Open the create modal from `boardPage.clickNewBugButton()`.
4. Fill valid data through `createBugModal.fillBugForm()`.
5. Save with `createBugModal.submit()`.
6. Assert the new bug row is visible on the board before continuing.

After each test, remove the bug if it still exists so a canceled deletion does not contaminate later tests. Use the existing `deleteBugIfExists` helper or an equivalent page-object-driven cleanup.

## Scenarios

### 1. Create and confirm deletion

**Test file:** `tests/delete-bug/should-create-then-delete.spec.ts`

**Test name:** `should_create_then_delete_bug`

**Arrange**

1. Authenticate with the test account.
2. Create a fresh bug with a unique title during test setup.
3. Assert that the created bug is visible in the Bugs table.

**Act**

1. Click the created bug row with `boardPage.clickBugByTitle(title)`.
2. Assert that `editBugModal.dialog` is visible and contains the `Delete` button.
3. Click `editBugModal.openDeleteConfirmation()`.
4. Assert that `editBugModal.confirmationDialog` is visible.
5. Confirm with `editBugModal.confirmDeletion()`.

**Assert**

- The confirmation dialog is closed.
- The edit dialog is closed.
- The created bug title no longer appears in the Bugs table.

### 2. Cancel deletion and retain the bug

**Test file:** `tests/delete-bug/should-not-delete-when-cancelled.spec.ts`

**Test name:** `should_not_delete_when_cancelled`

**Arrange**

1. Authenticate with the test account.
2. Create a fresh bug with a unique title during test setup.
3. Assert that the created bug is visible in the Bugs table.
4. Open the created bug row and assert that the edit dialog is visible.

**Act**

1. Open the delete confirmation with `editBugModal.openDeleteConfirmation()`.
2. Assert that the confirmation dialog is visible.
3. Cancel with `editBugModal.cancelDeleteConfirmation()`.

**Assert**

- The confirmation dialog is closed.
- The edit dialog remains visible.
- The created bug title is still present in the Bugs table.
- The test cleanup can remove the bug afterward.

### 3. Delete from the bug details/edit view

**Test file:** `tests/delete-bug/should-delete-from-details-view.spec.ts`

**Test name:** `should_delete_from_details_view`

**Arrange**

1. Authenticate with the test account.
2. Create a fresh bug with a unique title during test setup.
3. Assert that the created bug is visible in the Bugs table.
4. Open the created bug from the board row and assert that the edit dialog is visible.

**Act**

1. Use the edit modal's `Delete` action.
2. Confirm the delete confirmation.

**Assert**

- The edit dialog is closed.
- The confirmation dialog is closed.
- The created bug title is no longer visible on the board.

## Implementation notes

- Import `test` and `expect` from `tests/fixtures/pages.ts`, not directly from `@playwright/test`.
- Keep locators in `tests/pages/BoardPage.ts`, `tests/pages/CreateBugModal.ts`, and `tests/pages/EditBugModal.ts`; do not use raw page call chains in test bodies.
- Use a unique bug title per test to avoid collisions with existing database data.
- The database is SQLite-backed, so board visibility is the user-facing persistence assertion; API/database verification may be added only if the test harness exposes a supported helper.
- Run the scenarios independently and verify that each starts by creating its own bug. When running all three together, use one Playwright worker because they share the app's single SQLite database.
