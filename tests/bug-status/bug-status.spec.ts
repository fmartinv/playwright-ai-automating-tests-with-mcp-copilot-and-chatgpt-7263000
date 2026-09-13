import { test, expect } from "../fixtures/pages";
import {
  createBugViaApi,
  deleteBugsViaApi,
  type SeededBug,
} from "../helpers/bugApi";

test.describe("Bug status coverage gaps", () => {
  let bugs: SeededBug[] = [];

  test.beforeEach(async ({ request, loginPage, boardPage }) => {
    await loginPage.loginWithFirstUser();
    bugs = await Promise.all([
      createBugViaApi(request, {
        title: "Status Open",
        severity: "high",
        owner: "status-owner",
      }),
      createBugViaApi(request, {
        title: "Status Closed",
        severity: "low",
        owner: "status-owner",
      }),
    ]);
    const closed = bugs[1];
    await request.put(`/api/bugs/${closed.id}`, {
      data: {
        title: closed.title,
        severity: closed.severity,
        owner: closed.owner,
        description: closed.description,
        state: "closed",
      },
    });
    await boardPage.reload();
  });

  test.afterEach(async ({ request }) => {
    await deleteBugsViaApi(request, bugs);
    bugs = [];
  });

  test("defaults to Open and hides closed bugs", async ({ boardPage }) => {
    await expect(boardPage.openFilterButton).toBeVisible();
    await expect(await boardPage.getBugRowByTitle("Status Open")).toBeVisible();
    await expect(await boardPage.getBugRowByTitle("Status Closed")).toHaveCount(
      0
    );
  });

  test("shows only closed bugs when Closed is selected", async ({
    boardPage,
  }) => {
    await boardPage.showClosedBugs();
    await expect(
      await boardPage.getBugRowByTitle("Status Closed")
    ).toBeVisible();
    await expect(await boardPage.getBugRowByTitle("Status Open")).toHaveCount(
      0
    );
  });

  test("combines state filtering with search", async ({ boardPage }) => {
    await boardPage.showClosedBugs();
    await boardPage.searchByTitle("status open");
    await expect(await boardPage.getNoResultsMessage()).toBeVisible();
    await expect(await boardPage.getBugRowByTitle("Status Closed")).toHaveCount(
      0
    );
  });

  test("persists a state change through the edit modal", async ({
    boardPage,
    editBugModal,
  }) => {
    await boardPage.clickBugByTitle("Status Open");
    await editBugModal.setState("closed");
    await editBugModal.save();
    await boardPage.showClosedBugs();
    await expect(await boardPage.getBugRowByTitle("Status Open")).toBeVisible();
  });
});
