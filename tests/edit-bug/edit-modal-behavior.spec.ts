import { test, expect } from "../fixtures/pages";
import {
  createBugViaApi,
  deleteBugViaApi,
  type SeededBug,
} from "../helpers/bugApi";

test.describe("Edit bug modal coverage gaps", () => {
  let bug: SeededBug;

  test.beforeEach(async ({ request, loginPage, boardPage }, testInfo) => {
    await loginPage.loginWithFirstUser();
    bug = await createBugViaApi(request, {
      title: `edit-gap-${testInfo.workerIndex}-${Date.now()}`,
      severity: "mid",
      owner: "original-owner",
      description: "original description",
    });
    await boardPage.reload();
  });

  test.afterEach(async ({ request }) => {
    if (bug) await deleteBugViaApi(request, bug.id);
  });

  test("shows populated fields and a read-only ID", async ({
    boardPage,
    editBugModal,
  }) => {
    await boardPage.clickBugByTitle(bug.title);
    await expect(editBugModal.dialog).toBeVisible();
    await expect(editBugModal.idInput).toHaveValue(String(bug.id));
    await expect(editBugModal.isIdReadOnly()).resolves.toBe(true);
    await expect(editBugModal.titleInput).toHaveValue(bug.title);
    await expect(editBugModal.severitySelect).toHaveValue("mid");
    await expect(editBugModal.stateSelect).toHaveValue("open");
    await expect(editBugModal.ownerInput).toHaveValue("original-owner");
    await expect(editBugModal.descriptionInput).toHaveValue(
      "original description"
    );
  });

  test("disables Save when no fields change", async ({
    boardPage,
    editBugModal,
  }) => {
    await boardPage.clickBugByTitle(bug.title);
    await expect(editBugModal.saveButton).toBeDisabled();
  });

  test("saves updated fields", async ({ boardPage, editBugModal }) => {
    await boardPage.clickBugByTitle(bug.title);
    await editBugModal.titleInput.fill(`${bug.title}-updated`);
    await editBugModal.severitySelect.selectOption("high");
    await editBugModal.ownerInput.fill("updated-owner");
    await editBugModal.descriptionInput.fill("updated description");
    await editBugModal.save();
    await expect(
      await boardPage.getBugRowByTitle(`${bug.title}-updated`)
    ).toBeVisible();
  });

  test("keeps changes when the edit backdrop is clicked", async ({
    boardPage,
    editBugModal,
  }) => {
    await boardPage.clickBugByTitle(bug.title);
    await editBugModal.titleInput.fill("unsaved title");
    await editBugModal.clickBackdrop();
    await expect(editBugModal.dialog).toBeVisible();
    await expect(editBugModal.titleInput).toHaveValue("unsaved title");
  });

  test("closes with Escape and discards changes", async ({
    boardPage,
    editBugModal,
  }) => {
    await boardPage.clickBugByTitle(bug.title);
    await editBugModal.titleInput.fill("discarded title");
    await editBugModal.pressEscape();
    await expect(editBugModal.dialog).toBeHidden();
    await expect(await boardPage.getBugRowByTitle(bug.title)).toBeVisible();
  });

  test("closes with Cancel and discards changes", async ({
    boardPage,
    editBugModal,
  }) => {
    await boardPage.clickBugByTitle(bug.title);
    await editBugModal.titleInput.fill("cancelled edit");
    await editBugModal.cancel();
    await expect(await boardPage.getBugRowByTitle(bug.title)).toBeVisible();
    await expect(
      await boardPage.getBugRowByTitle("cancelled edit")
    ).toHaveCount(0);
  });

  test("closes with X and discards changes", async ({
    boardPage,
    editBugModal,
  }) => {
    await boardPage.clickBugByTitle(bug.title);
    await editBugModal.titleInput.fill("closed edit");
    await editBugModal.close();
    await expect(await boardPage.getBugRowByTitle(bug.title)).toBeVisible();
  });

  test("disables Save when a required field is blank", async ({
    boardPage,
    editBugModal,
  }) => {
    await boardPage.clickBugByTitle(bug.title);
    await editBugModal.titleInput.fill("");
    await expect(editBugModal.saveButton).toBeDisabled();
  });
});
