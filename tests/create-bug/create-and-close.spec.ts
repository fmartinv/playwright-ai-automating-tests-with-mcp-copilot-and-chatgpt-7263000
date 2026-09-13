import { test, expect } from "../fixtures/pages";
import { mkdirSync } from "fs";
import { join } from "path";

let createdTitle = "";

test("create a bug then edit it to Closed and capture screenshots", async ({
  page,
  loginPage,
  boardPage,
  createBugModal,
  editBugModal,
}) => {
  const screenshotsDir = join(process.cwd(), "playwright-screenshots");
  mkdirSync(screenshotsDir, { recursive: true });

  await loginPage.loginWithFirstUser();
  await page.screenshot({
    path: join(screenshotsDir, "01-logged-in.png"),
    fullPage: true,
  });

  await boardPage.clickNewBugButton();
  await page.screenshot({
    path: join(screenshotsDir, "02-create-modal-open.png"),
  });

  const title = `e2e bug ${Date.now()}`;
  createdTitle = title;
  await createBugModal.fillBugForm({
    title,
    severity: "high",
    owner: "buggy",
    description: "Created by automated test",
  });
  await page.screenshot({ path: join(screenshotsDir, "03-create-filled.png") });
  await createBugModal.submit();

  // Wait for the new bug to appear in the table
  const row = await boardPage.getBugRowByTitle(title);
  await expect(row).toBeVisible();
  await page.screenshot({
    path: join(screenshotsDir, "04-bug-created.png"),
    fullPage: true,
  });

  // Open the bug for editing
  await boardPage.clickBugByTitle(title);
  await expect(editBugModal.dialog).toBeVisible();
  await page.screenshot({
    path: join(screenshotsDir, "05-edit-modal-open.png"),
  });

  // Change state to Closed (select in the edit dialog has id edit-bug-state)
  await editBugModal.setState("closed");
  await page.screenshot({
    path: join(screenshotsDir, "06-state-set-to-closed.png"),
  });

  // Click Save in edit modal
  await editBugModal.save();

  // Show Closed bugs and verify the bug appears there
  await boardPage.showClosedBugs();
  const closedRow = await boardPage.getBugRowByTitle(title);
  await expect(closedRow).toBeVisible();
  await page.screenshot({
    path: join(screenshotsDir, "07-bug-closed-in-board.png"),
    fullPage: true,
  });
});

test.afterEach(async ({ request }) => {
  if (!createdTitle) return;
  const response = await request.get("/api/bugs");
  const bugs = (await response.json()) as Array<{ id: number; title: string }>;
  const createdBug = bugs.find((bug) => bug.title === createdTitle);
  if (createdBug) await request.delete(`/api/bugs/${createdBug.id}`);
  createdTitle = "";
});
