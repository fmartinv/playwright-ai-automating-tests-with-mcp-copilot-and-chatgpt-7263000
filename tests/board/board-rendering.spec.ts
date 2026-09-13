import { test, expect } from "../fixtures/pages";
import {
  createBugViaApi,
  deleteBugViaApi,
  type SeededBug,
} from "../helpers/bugApi";

test.describe("Board rendering coverage gaps", () => {
  let bug: SeededBug;

  test.beforeEach(async ({ request, loginPage, boardPage }, testInfo) => {
    await loginPage.loginWithFirstUser();
    bug = await createBugViaApi(request, {
      title: `Board coverage ${testInfo.workerIndex}-${Date.now()}`,
      severity: "high",
      owner: "board-owner",
    });
    await boardPage.reload();
  });

  test.afterEach(async ({ request }) => {
    if (bug) await deleteBugViaApi(request, bug.id);
  });

  test("renders the expected table columns and bug data", async ({
    boardPage,
  }) => {
    await expect(boardPage.bugsTable).toBeVisible();
    await expect(boardPage.getColumnHeaderLabels()).resolves.toEqual([
      "ID",
      "Severity",
      "Title",
      "Owner",
    ]);
    const row = await boardPage.getBugRowByTitle(bug.title);
    await expect(row).toContainText(String(bug.id));
    await expect(row).toContainText("HIGH");
    await expect(row).toContainText("board-owner");
    await expect(row.locator('[data-severity="HIGH"]')).toBeVisible();
  });
});
