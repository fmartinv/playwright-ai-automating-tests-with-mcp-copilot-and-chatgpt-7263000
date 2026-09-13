import { test, expect } from "../fixtures/pages";
import { createBug, deleteBugIfExists } from "./test-helpers";

test.describe("Delete Bug - create then delete", () => {
  let title: string;

  test.beforeEach(async ({ loginPage, boardPage, createBugModal }) => {
    await loginPage.loginWithFirstUser();
    title = `delete-bug-${Date.now()}`;
    await createBug(title, boardPage, createBugModal);
  });

  test.afterEach(async ({ boardPage, editBugModal }) => {
    await deleteBugIfExists(title, boardPage, editBugModal);
  });

  test("should_create_then_delete_bug", async ({
    boardPage,
    editBugModal,
  }) => {
    // Act
    await boardPage.clickBugByTitle(title);
    await expect(editBugModal.dialog).toBeVisible();
    await expect(editBugModal.deleteButton).toBeVisible();
    await editBugModal.openDeleteConfirmation();
    await expect(editBugModal.confirmationDialog).toBeVisible();
    await editBugModal.confirmDeletion();

    // Assert
    await expect(editBugModal.confirmationDialog).toBeHidden();
    await expect(editBugModal.dialog).toBeHidden();
    await expect(await boardPage.getBugRowByTitle(title)).toHaveCount(0);
  });
});
