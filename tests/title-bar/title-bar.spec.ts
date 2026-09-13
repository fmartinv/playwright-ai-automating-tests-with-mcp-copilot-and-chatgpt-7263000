import { test, expect } from "../fixtures/pages";

test("authenticated board displays the complete title bar", async ({
  loginPage,
  titleBar,
}) => {
  await loginPage.loginWithFirstUser();
  await expect(titleBar.logo).toBeVisible();
  await expect(titleBar.heading).toHaveText("BuggyBoard");
  await expect(titleBar.searchInput).toBeVisible();
  await expect(titleBar.newBugButton).toBeVisible();
  await expect(titleBar.logoutButton).toBeVisible();
});
