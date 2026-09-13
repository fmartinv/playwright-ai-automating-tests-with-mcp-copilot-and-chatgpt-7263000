import { Page, Locator } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

interface User {
  username: string;
  password: string;
}

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
    await this.page.waitForURL("**/board");
  }

  async fillCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }

  async loginWithFirstUser() {
    const usersPath = join(process.cwd(), "users.json");
    const rawUsers = readFileSync(usersPath, "utf-8");
    const users = JSON.parse(rawUsers) as User[];
    const firstUser = users[0];
    await this.goto();
    await this.login(firstUser.username, firstUser.password);
  }

  async submitWithEnter(field: "username" | "password") {
    await (
      field === "username" ? this.usernameInput : this.passwordInput
    ).press("Enter");
    await this.page.waitForURL("**/board");
  }

  async getErrorMessage() {
    return this.errorMessage;
  }
}
