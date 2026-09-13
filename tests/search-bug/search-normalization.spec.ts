import { test, expect } from "../fixtures/pages";
import {
  createBugViaApi,
  deleteBugsViaApi,
  type SeededBug,
} from "../helpers/bugApi";

test.describe("Search normalization coverage gaps", () => {
  let bugs: SeededBug[] = [];

  test.beforeEach(async ({ request, loginPage, boardPage }) => {
    await loginPage.loginWithFirstUser();
    bugs = await Promise.all([
      createBugViaApi(request, {
        title: "Login fails",
        severity: "high",
        owner: "search-owner",
        description: "secret description",
      }),
      createBugViaApi(request, {
        title: "Issue with log-in",
        severity: "mid",
        owner: "search-owner",
      }),
      createBugViaApi(request, {
        title: "Unrelated title",
        severity: "low",
        owner: "search-owner",
      }),
    ]);
    await boardPage.reload();
  });

  test.afterEach(async ({ request }) => {
    await deleteBugsViaApi(request, bugs);
    bugs = [];
  });

  test("matches case and punctuation-normalized titles", async ({
    boardPage,
  }) => {
    await boardPage.searchByTitle("LOGIN");
    await expect(
      await boardPage.getBugCellByTitle("Login fails")
    ).toBeVisible();
    await expect(
      await boardPage.getBugCellByTitle("Issue with log-in")
    ).toBeVisible();
    await expect(
      await boardPage.getBugCellByTitle("Unrelated title")
    ).not.toBeVisible();
  });

  test("clear search restores all bugs", async ({ boardPage }) => {
    await boardPage.searchByTitle("login");
    await boardPage.clearSearch();
    await expect(boardPage.searchInput).toHaveValue("");
    await expect(
      await boardPage.getBugCellByTitle("Unrelated title")
    ).toBeVisible();
  });

  test("preserves the active sort while searching", async ({ boardPage }) => {
    await boardPage.titleHeader.getByRole("button").click();
    await boardPage.searchByTitle("login");
    await expect(boardPage.getHeaderSort("title")).resolves.toBe("ascending");
    await expect(
      await boardPage.getBugCellByTitle("Login fails")
    ).toBeVisible();
  });

  test("does not search description, owner, or severity", async ({
    boardPage,
  }) => {
    await boardPage.searchByTitle("secret description");
    await expect(await boardPage.getNoResultsMessage()).toBeVisible();
    await boardPage.clearSearch();
    await boardPage.searchByTitle("search-owner");
    await expect(await boardPage.getNoResultsMessage()).toBeVisible();
    await boardPage.clearSearch();
    await boardPage.searchByTitle("high");
    await expect(await boardPage.getNoResultsMessage()).toBeVisible();
  });
});
