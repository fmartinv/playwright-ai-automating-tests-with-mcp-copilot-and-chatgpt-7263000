import { test, expect } from "../fixtures/pages";
import { createBug, deleteBugIfExists } from "./test-helpers";

test.describe("Delete Bug - cancel retains bug", () => {
  let title: string;

  test.beforeEach(async ({ loginPage, boardPage, createBugModal }) => {
    await loginPage.loginWithFirstUser();
    title = `delete-bug-${Date.now()}`;
    await createBug(title, boardPage, createBugModal);
  });

  test.afterEach(async ({ boardPage, editBugModal }) => {
    await deleteBugIfExists(title, boardPage, editBugModal);
  });

  test("should_not_delete_when_cancelled", async ({
    boardPage,
    editBugModal,
  }) => {
    // Act
    await boardPage.clickBugByTitle(title);
    await expect(editBugModal.dialog).toBeVisible();
    await editBugModal.openDeleteConfirmation();
    await expect(editBugModal.confirmationDialog).toBeVisible();
    await editBugModal.cancelDeleteConfirmation();

    // Assert
    await expect(editBugModal.confirmationDialog).toBeHidden();
    await expect(editBugModal.dialog).toBeVisible();
    await expect(await boardPage.getBugRowByTitle(title)).toHaveCount(1);

    // Cleanup state for afterEach
    await editBugModal.cancel();
  });
});
