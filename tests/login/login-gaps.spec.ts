import { test, expect } from "../fixtures/pages";

test.describe("Login coverage gaps", () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await page.context().clearCookies();
    await loginPage.goto();
  });

  test("renders the login form with a masked password", async ({
    loginPage,
    page,
  }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
    await expect(loginPage.loginButton).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "BuggyBoard" })
    ).toBeVisible();
  });

  test("rejects invalid credentials with a generic error", async ({
    loginPage,
    page,
  }) => {
    await loginPage.fillCredentials("invalid-user", "wrong-password");
    await loginPage.submit();
    await expect(loginPage.errorMessage).toHaveText(
      "Invalid username or password."
    );
    await expect(page).toHaveURL(/\/login$/);
  });

  test("validates blank credentials", async ({ loginPage }) => {
    await loginPage.submit();
    await expect(loginPage.errorMessage).toHaveText(
      "Please enter your username and password."
    );
  });

  test("validates a blank username", async ({ loginPage }) => {
    await loginPage.passwordInput.fill("1970beetle");
    await loginPage.submit();
    await expect(loginPage.errorMessage).toHaveText(
      "Username cannot be blank."
    );
  });

  test("validates a blank password", async ({ loginPage }) => {
    await loginPage.usernameInput.fill("buggy");
    await loginPage.submit();
    await expect(loginPage.errorMessage).toHaveText(
      "Password cannot be blank."
    );
  });

  test("submits from the username field with Enter", async ({ loginPage }) => {
    await loginPage.usernameInput.fill("buggy");
    await loginPage.passwordInput.fill("1970beetle");
    await loginPage.submitWithEnter("username");
    await expect(loginPage.page).toHaveURL(/\/board$/);
  });

  test("trims username whitespace during login", async ({
    loginPage,
    page,
  }) => {
    await loginPage.login("  buggy  ", "1970beetle");
    await expect(page).toHaveURL(/\/board$/);
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  });

  test("redirects unauthenticated users away from the board", async ({
    page,
  }) => {
    await page.goto("/board");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("redirects an authenticated user from login to the board", async ({
    loginPage,
    page,
  }) => {
    await loginPage.login("buggy", "1970beetle");
    await page.goto("/login");
    await expect(page).toHaveURL(/\/board$/);
  });

  test("persists authentication after a board refresh", async ({
    loginPage,
    page,
  }) => {
    await loginPage.loginWithFirstUser();
    await page.reload();
    await expect(page).toHaveURL(/\/board$/);
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  });
});
