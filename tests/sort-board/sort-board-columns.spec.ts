import { test, expect } from "../fixtures/pages";
import {
  createBugViaApi,
  deleteBugsViaApi,
  type SeededBug,
} from "../helpers/bugApi";

test.describe("Board sorting coverage gaps", () => {
  let bugs: SeededBug[] = [];

  test.beforeEach(async ({ request, loginPage, boardPage }) => {
    await loginPage.loginWithFirstUser();
    bugs = await Promise.all([
      createBugViaApi(request, {
        title: "Sort Alpha",
        severity: "low",
        owner: "Owner C",
      }),
      createBugViaApi(request, {
        title: "Sort Charlie",
        severity: "high",
        owner: "Owner A",
      }),
      createBugViaApi(request, {
        title: "Sort Bravo",
        severity: "mid",
        owner: "Owner B",
      }),
    ]);
    await boardPage.reload();
  });

  test.afterEach(async ({ request }) => {
    await deleteBugsViaApi(request, bugs);
    bugs = [];
  });

  test("uses severity descending by default", async ({ boardPage }) => {
    await boardPage.searchByTitle("Sort");
    await expect(boardPage.getVisibleRowTitles()).resolves.toEqual([
      "Sort Charlie",
      "Sort Bravo",
      "Sort Alpha",
    ]);
    await expect(boardPage.getHeaderSort("severity")).resolves.toBe(
      "descending"
    );
    await expect(boardPage.getHeaderSort("title")).resolves.toBeNull();
  });

  test("sorts titles ascending then descending", async ({ boardPage }) => {
    await boardPage.searchByTitle("Sort");
    await boardPage.titleHeader.getByRole("button").click();
    await expect(boardPage.getVisibleRowTitles()).resolves.toEqual([
      "Sort Alpha",
      "Sort Bravo",
      "Sort Charlie",
    ]);
    await expect(boardPage.getHeaderSort("title")).resolves.toBe("ascending");

    await boardPage.titleHeader.getByRole("button").click();
    await expect(boardPage.getVisibleRowTitles()).resolves.toEqual([
      "Sort Charlie",
      "Sort Bravo",
      "Sort Alpha",
    ]);
    await expect(boardPage.getHeaderSort("title")).resolves.toBe("descending");
  });

  test("keeps only the latest active sort column", async ({ boardPage }) => {
    await boardPage.searchByTitle("Sort");
    await boardPage.ownerHeader.getByRole("button").click();
    await expect(boardPage.getHeaderSort("owner")).resolves.toBe("ascending");
    await boardPage.severityHeader.getByRole("button").click();
    await expect(boardPage.getHeaderSort("severity")).resolves.toBe(
      "ascending"
    );
    await expect(boardPage.getHeaderSort("owner")).resolves.toBeNull();
  });
});
