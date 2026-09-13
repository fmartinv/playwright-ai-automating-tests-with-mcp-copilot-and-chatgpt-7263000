# BuggyBoard Test Coverage Gaps

## Purpose

This plan records implemented BuggyBoard behavior that is described in the feature and testing specs but is not covered, or is only partially covered, by the current automated tests under `tests/`.

The audit compared:

- `specs/features/01-favicon.md` through `specs/features/13-bug-status.md`
- Existing plans under `specs/testing/`
- Current Playwright tests under `tests/`
- Frontend behavior in `frontend/src/`
- Backend API coverage in `tests/api/api.spec.ts`
- Live UI behavior explored with the local `playwright-cli` skill

Current UI coverage includes create-and-close flows, opening the create modal, search scenarios, delete scenarios, API behavior, and a seed login check. The scenarios below are the remaining priority gaps.

## Test architecture and isolation

All browser tests must:

- Import `test` and `expect` from `tests/fixtures/pages.ts`.
- Obtain page objects through fixture parameters; never construct page objects in test files or helpers.
- Use the Page Object Model and semantic locators.
- Follow Arrange-Act-Assert.
- Create unique bugs through the UI or a supported API fixture and clean them up in the same test/fixture.
- Run UI suites with one worker when sharing the repository's single SQLite database.
- Keep each test atomic and independent.

Page objects may need these additional fixture-backed capabilities before implementation:

- `LoginPage`: invalid credentials, field filling, Enter submission, error message, and route assertions.
- `TitleBar`: logo, title, search, New Bug, and Logout locators/actions.
- `CreateBugModal`: close button, Escape, backdrop, validation alert, and field-value queries.
- `EditBugModal`: close button, Escape, backdrop, form fields, save state, and field-value queries.
- `BoardPage`: table headers, row data, state filters, row count, and sort assertions.

## Priority 1: Authentication and session behavior

### 1. Login page and protected-route rendering

**Suggested file:** `tests/login/login-rendering.spec.ts`

1. Open `/login` without an authenticated session.
2. Verify the BuggyBoard heading, username field, password field, Login button, and logo are visible.
3. Verify the password input uses password masking.
4. Open `/board` without a session.
5. Verify the app redirects to `/login`.

### 2. Login validation and invalid credentials

**Suggested file:** `tests/login/login-validation.spec.ts`

Create independent tests for:

- Invalid username shows `Invalid username or password.`.
- Valid username with invalid password shows the same generic error.
- Blank username shows `Username cannot be blank.`.
- Blank password shows `Password cannot be blank.`.
- Both fields blank show `Please enter your username and password.`.
- The user remains on `/login` and is not authenticated after each failure.

### 3. Login keyboard submission and username normalization

**Suggested file:** `tests/login/login-submit.spec.ts`

- Fill valid credentials and press Enter from the username field; verify navigation to `/board`.
- Fill valid credentials and press Enter from the password field; verify navigation to `/board`.
- Add leading/trailing whitespace to a valid username; verify login succeeds and the stored/displayed username is trimmed.

### 4. Authenticated redirects and refresh persistence

**Suggested file:** `tests/login/session.spec.ts`

- Log in, navigate to `/login`, and verify the app redirects back to `/board`.
- Log in, reload `/board`, and verify the user remains authenticated and the board is displayed.

## Priority 1: Logout and protected access

**Suggested file:** `tests/logout/logout.spec.ts`

1. Log in and verify the Logout button is visible.
2. Click Logout and verify navigation to `/login`.
3. Navigate directly to `/board` after logout and verify redirection to `/login`.
4. Use browser back after logout and verify the authenticated board is not restored.
5. Verify the user is no longer present in local storage after logout.

## Priority 1: Create-bug modal gaps

**Suggested file:** `tests/create-bug/create-modal-edge-cases.spec.ts`

Each test must open a fresh create modal and use a unique title where data is entered.

### Default values and close controls

- Verify Owner defaults to the authenticated user's username.
- Enter values, click Cancel, and verify the modal closes without creating a bug.
- Enter values, click the X/Close button, and verify the modal closes without creating a bug.
- Enter values, press Escape, and verify the modal closes without creating a bug.
- Click the dimmed backdrop and verify the modal remains open with entered values preserved.

### Required-field validation

Create one atomic test for each required field:

- Blank Title blocks save and reports `Title is required.`.
- Blank Severity blocks save and reports the severity requirement.
- Blank Owner blocks save and reports `Owner is required.`.
- Blank Description blocks save and reports `Description is required.`.

For every validation test, verify the modal remains open and no bug with the test title appears on the board.

## Priority 1: Edit-bug modal gaps

**Suggested file:** `tests/edit-bug/edit-modal-behavior.spec.ts`

Use a fresh bug in setup and remove it in teardown.

- Verify ID is read-only and Title, Severity, State, Owner, and Description are populated.
- Change title, severity, owner, and description, save, and verify all changes appear on the board/details view.
- Open the modal without changes and verify Save is disabled.
- Clear each required field individually and verify Save is disabled or validation prevents saving.
- Modify fields, click Cancel, and verify original values remain.
- Modify fields, click X/Close, and verify original values remain.
- Modify fields, press Escape, and verify original values remain.
- Click the backdrop and verify the modal remains open with modified values preserved.
- Verify Severity offers HIGH, MID, and LOW and uses the expected severity styling.

## Priority 1: Board sorting

**Suggested file:** `tests/sort-board/sort-board-columns.spec.ts`

Create deterministic bugs with distinct titles, owners, IDs, and HIGH/MID/LOW severities.

- Verify the default order is HIGH, MID, LOW and only Severity has descending `aria-sort`.
- Click Title once and verify ascending title order and only Title has `aria-sort`.
- Click Title again and verify descending title order.
- Click Owner and then Severity; verify only the latest column remains sorted.
- Click Severity to verify LOW, MID, HIGH ascending.
- Verify ID, Severity, Title, and Owner headers all activate sorting.
- Verify sort indicators use the expected ascending/descending direction.

## Priority 2: Board structure and severity presentation

**Suggested file:** `tests/board/board-rendering.spec.ts`

- Verify the Bugs table has columns ordered ID, Severity, Title, Owner.
- Verify each row displays ID, uppercase severity, title, and owner.
- Verify an empty database shows the table with no data rows and the expected empty message.
- Verify HIGH, MID, and LOW badges use distinct design-system styling.
- Verify the title-bar logo and `BuggyBoard` heading are visible on the board.

## Priority 2: Search behavior not yet isolated

**Suggested file:** `tests/search-bug/search-normalization.spec.ts`

The existing search tests cover basic matches and no-results behavior, but do not isolate these acceptance criteria:

- Search is case insensitive (`login` matches `Login`).
- Whitespace is collapsed on both query and title sides.
- Punctuation normalization makes `login` match a title such as `Issue with log-in`.
- Clicking the X clear control empties the field and restores all bugs.
- Sorting remains unchanged while search filters results.
- Search and Open/Closed state filters apply together.
- Search does not match description, owner, or severity.

Use deterministic test data and assert both visible and hidden rows.

## Priority 2: Bug-status filtering

**Suggested file:** `tests/bug-status/bug-status.spec.ts`

- Verify new bugs are Open by default and appear under the Open filter.
- Create or update a bug to Closed and verify its State field persists.
- Verify Open is selected by default and closed bugs are hidden.
- Select Closed and verify only closed bugs are shown.
- Verify sorting applies only within the selected state.
- Verify search and state filtering combine with AND semantics.
- Verify the no-results message when the selected state has no matching bugs.

## Priority 3: Branding and favicon

### Title bar

**Suggested file:** `tests/title-bar/title-bar.spec.ts`

- Verify the header spans the board page.
- Verify the logo uses `/logo_50x50.png`, has accessible text, and is visible.
- Verify `BuggyBoard` appears next to the logo.
- Verify New Bug, search, and Logout controls are present in the authenticated header.

### Favicon

**Suggested file:** `tests/favicon/favicon.spec.ts`

- Open the application without authentication.
- Verify the document contains a favicon link referencing `/favicon.ico`.
- Verify the favicon link has the expected icon relationship/type where exposed by the DOM.

## Existing coverage that should not be duplicated

The following areas already have automated coverage and should be extended only for missing edge cases:

- Create a bug, edit it to Closed, and verify the closed board view.
- Opening the create-bug modal and its core fields.
- Delete confirmation, confirmed deletion, details-view deletion, and cancel retention.
- Search basic matches, subsets, and no-results behavior.
- REST API health, login responses, CRUD validation, update state, and delete responses.
- Seed login smoke test.

## Recommended implementation order

1. Login validation, protected routes, logout, and session persistence.
2. Create and edit modal edge cases.
3. Sorting and bug-status filtering.
4. Board rendering, severity styling, search normalization, title bar, and favicon.

Each group should be implemented with page-object fixtures, run independently, and reviewed before starting the next group.
