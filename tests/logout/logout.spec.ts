import { test, expect } from "../fixtures/pages";

test.describe("Logout coverage gaps", () => {
  test("logs out and protects the board route", async ({
    loginPage,
    titleBar,
    page,
  }) => {
    await loginPage.loginWithFirstUser();
    await titleBar.logout();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/board");
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.evaluate(() => localStorage.getItem("buggyboard_user"))
    ).resolves.toBeNull();
  });
});
