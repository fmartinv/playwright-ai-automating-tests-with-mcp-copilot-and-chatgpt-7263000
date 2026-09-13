import { test, expect } from "./fixtures/pages";

test.describe("Seed tests", () => {
  test(
    "login with first user from users.json",
    { tag: "@seed" },
    async ({ loginPage, titleBar }) => {
      // Act
      await loginPage.loginWithFirstUser();

      // Assert
      await expect(titleBar.logoutButton).toBeVisible();
    }
  );
});
