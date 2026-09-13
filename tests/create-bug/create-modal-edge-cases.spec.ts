import { test, expect } from "../fixtures/pages";

test.describe("Create bug modal coverage gaps", () => {
  test.beforeEach(async ({ loginPage, boardPage }) => {
    await loginPage.loginWithFirstUser();
    await boardPage.clickNewBugButton();
  });

  test("defaults owner to the authenticated user", async ({
    createBugModal,
  }) => {
    await expect(createBugModal.ownerInput).toHaveValue("buggy");
    await expect(createBugModal.severitySelect).toHaveValue("mid");
  });

  test("closes with the X button without saving", async ({
    createBugModal,
    boardPage,
  }) => {
    await createBugModal.titleInput.fill("cancelled-create");
    await createBugModal.close();
    await expect(createBugModal.dialog).toBeHidden();
    await expect(
      await boardPage.getBugRowByTitle("cancelled-create")
    ).toHaveCount(0);
  });

  test("closes with Cancel without saving", async ({
    createBugModal,
    boardPage,
  }) => {
    await createBugModal.titleInput.fill("cancel-button-create");
    await createBugModal.cancel();
    await expect(
      await boardPage.getBugRowByTitle("cancel-button-create")
    ).toHaveCount(0);
  });

  test("closes with Escape without saving", async ({
    createBugModal,
    boardPage,
  }) => {
    await createBugModal.titleInput.fill("escaped-create");
    await createBugModal.pressEscape();
    await expect(createBugModal.dialog).toBeHidden();
    await expect(
      await boardPage.getBugRowByTitle("escaped-create")
    ).toHaveCount(0);
  });

  test("keeps entered values when the backdrop is clicked", async ({
    createBugModal,
  }) => {
    await createBugModal.titleInput.fill("backdrop-create");
    await createBugModal.descriptionInput.fill("preserved description");
    await createBugModal.clickBackdrop();
    await expect(createBugModal.dialog).toBeVisible();
    await expect(createBugModal.titleInput).toHaveValue("backdrop-create");
    await expect(createBugModal.descriptionInput).toHaveValue(
      "preserved description"
    );
  });

  test("reports required-field validation without closing", async ({
    createBugModal,
  }) => {
    await createBugModal.submitExpectingValidation();
    await expect(createBugModal.validationErrors).toContainText(
      "Title is required."
    );
    await expect(createBugModal.validationErrors).toContainText(
      "Description is required."
    );
    await expect(createBugModal.dialog).toBeVisible();
  });
});
