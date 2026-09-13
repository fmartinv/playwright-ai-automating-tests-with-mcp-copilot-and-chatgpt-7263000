import { Page, Locator } from "@playwright/test";

export class BoardPage {
  readonly page: Page;
  readonly newBugButton: Locator;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly bugsTable: Locator;
  readonly openFilterButton: Locator;
  readonly closedFilterButton: Locator;
  readonly idHeader: Locator;
  readonly severityHeader: Locator;
  readonly titleHeader: Locator;
  readonly ownerHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newBugButton = page.getByRole("button", { name: "New Bug" });
    this.searchInput = page.getByRole("search", {
      name: "Search bugs by title",
    });
    this.clearSearchButton = page.getByRole("button", { name: "Clear search" });
    this.bugsTable = page.locator('table[aria-label="Bugs"]');
    this.openFilterButton = page.getByRole("button", {
      name: "Open",
      exact: true,
    });
    this.closedFilterButton = page.getByRole("button", {
      name: "Closed",
      exact: true,
    });
    this.idHeader = page.getByRole("columnheader").filter({ hasText: "ID" });
    this.severityHeader = page
      .getByRole("columnheader")
      .filter({ hasText: "Severity" });
    this.titleHeader = page
      .getByRole("columnheader")
      .filter({ hasText: "Title" });
    this.ownerHeader = page
      .getByRole("columnheader")
      .filter({ hasText: "Owner" });
  }

  async goto() {
    await this.page.goto("/board");
  }

  async reload() {
    await this.page.reload();
  }

  async clickNewBugButton() {
    await this.newBugButton.click();
  }

  async searchByTitle(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
  }

  async clearSearch() {
    await this.clearSearchButton.click();
  }

  async showClosedBugs() {
    await this.closedFilterButton.click();
  }

  async showOpenBugs() {
    await this.openFilterButton.click();
  }

  async getRows() {
    return this.bugsTable.locator("tbody tr");
  }

  async getVisibleRowTitles() {
    return this.bugsTable
      .locator("tbody tr")
      .evaluateAll((rows) =>
        rows.map((row) => row.cells[2]?.textContent?.trim() ?? "")
      );
  }

  async getColumnHeaderLabels() {
    return this.bugsTable
      .locator("thead th")
      .evaluateAll((headers) =>
        headers.map((header) =>
          (header.textContent ?? "").replace(/[↑↓]/g, "").trim()
        )
      );
  }

  async getHeaderSort(column: "id" | "severity" | "title" | "owner") {
    const header = {
      id: this.idHeader,
      severity: this.severityHeader,
      title: this.titleHeader,
      owner: this.ownerHeader,
    }[column];
    return header.getAttribute("aria-sort");
  }

  async getColumnHeaders() {
    return this.bugsTable.locator("thead th");
  }

  async getBugRowByTitle(title: string): Promise<Locator> {
    return this.page
      .locator('table[aria-label="Bugs"] tbody tr', { hasText: title })
      .first();
  }

  async clickBugByTitle(title: string) {
    const row = await this.getBugRowByTitle(title);
    await row.click();
  }

  async getBugCellByTitle(title: string): Promise<Locator> {
    return this.page.getByRole("cell", { name: title, exact: true });
  }

  async getNoResultsMessage(): Promise<Locator> {
    return this.page.getByRole("cell", {
      name: "No bugs matched.",
      exact: true,
    });
  }
}
