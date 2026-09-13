import { expect } from "@playwright/test";
import { BoardPage } from "../pages/BoardPage";
import { CreateBugModal } from "../pages/CreateBugModal";
import { EditBugModal } from "../pages/EditBugModal";

export async function createBug(
  title: string,
  boardPage: BoardPage,
  createBugModal: CreateBugModal
) {
  await boardPage.clickNewBugButton();
  await expect(createBugModal.dialog).toBeVisible();
  await createBugModal.fillBugForm({
    title,
    severity: "mid",
    owner: "tester",
    description: "created by test",
  });
  await createBugModal.submit();

  const row = await boardPage.getBugRowByTitle(title);
  await row.waitFor({ state: "visible", timeout: 5000 });
}

export async function deleteBugIfExists(
  title: string,
  boardPage: BoardPage,
  editBugModal: EditBugModal
) {
  const locator = await boardPage.getBugRowByTitle(title);
  const count = await locator.count();
  if (count === 0) return;

  if (await editBugModal.dialog.isVisible().catch(() => false)) {
    if (await editBugModal.confirmationDialog.isVisible().catch(() => false)) {
      await editBugModal.cancelDeleteConfirmation();
    }
    await editBugModal.cancel();
  }

  await boardPage.clickBugByTitle(title);
  await expect(editBugModal.dialog).toBeVisible();
  await editBugModal.delete();

  await expect(locator).toHaveCount(0);
}
