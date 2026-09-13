import { Page, Locator } from "@playwright/test";

export class TitleBar {
  readonly page: Page;
  readonly logo: Locator;
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly newBugButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole("img", { name: "BuggyBoard" });
    this.heading = page.getByRole("heading", { name: "BuggyBoard" });
    this.searchInput = page.getByRole("search", {
      name: "Search bugs by title",
    });
    this.newBugButton = page.getByRole("button", { name: "New Bug" });
    this.logoutButton = page.getByRole("button", { name: "Logout" });
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL("**/login");
  }
}
