import type { Locator, Page } from "@playwright/test";

export class DocumentPage {
  readonly page: Page;
  readonly faviconLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.faviconLink = page.locator('link[rel="icon"]');
  }
}
