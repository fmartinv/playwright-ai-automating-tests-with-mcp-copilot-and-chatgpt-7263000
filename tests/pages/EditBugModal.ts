import { Page, Locator } from "@playwright/test";

export class EditBugModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly stateSelect: Locator;
  readonly idInput: Locator;
  readonly titleInput: Locator;
  readonly severitySelect: Locator;
  readonly ownerInput: Locator;
  readonly descriptionInput: Locator;
  readonly closeButton: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmationDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteConfirmationButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole("dialog", { name: /Edit bug/ });
    this.idInput = this.dialog.getByLabel("ID");
    this.titleInput = this.dialog.getByLabel("Title");
    this.severitySelect = this.dialog.getByLabel("Severity");
    this.stateSelect = this.dialog.getByLabel("State");
    this.ownerInput = this.dialog.getByLabel("Owner");
    this.descriptionInput = this.dialog.getByLabel("Description");
    this.closeButton = this.dialog.getByRole("button", { name: "Close" });
    this.saveButton = this.dialog.getByRole("button", {
      name: "Save",
      exact: true,
    });
    this.deleteButton = this.dialog
      .locator("form")
      .getByRole("button", { name: "Delete", exact: true });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.confirmationDialog = page.getByRole("dialog", {
      name: "Confirm delete",
    });
    this.confirmDeleteButton = this.confirmationDialog.getByRole("button", {
      name: "Delete",
    });
    this.cancelDeleteConfirmationButton = this.confirmationDialog.getByRole(
      "button",
      { name: "Cancel" }
    );
  }

  async openDeleteConfirmation() {
    await this.deleteButton.click();
    await this.confirmationDialog.waitFor({ state: "visible" });
  }

  async confirmDeletion() {
    await this.confirmDeleteButton.click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  async cancelDeleteConfirmation() {
    await this.cancelDeleteConfirmationButton.click();
    await this.confirmationDialog.waitFor({ state: "hidden" });
    await this.dialog.waitFor({ state: "visible" });
  }

  async delete() {
    await this.openDeleteConfirmation();
    await this.confirmDeletion();
  }

  async setState(state: "open" | "closed") {
    await this.stateSelect.selectOption(state);
  }

  async pressEscape() {
    await this.page.keyboard.press("Escape");
    await this.dialog.waitFor({ state: "hidden" });
  }

  async close() {
    await this.closeButton.click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  async clickBackdrop() {
    const box = await this.dialog.boundingBox();
    if (!box) throw new Error("Edit modal is not rendered.");
    await this.page.mouse.click(box.x - 10, box.y - 10);
  }

  async isIdReadOnly() {
    return (await this.idInput.getAttribute("aria-readonly")) === "true";
  }

  async save() {
    await this.saveButton.click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  async cancel() {
    await this.cancelButton.click();
    // Wait for modal to close
    await this.page.waitForSelector('[role="dialog"]', { state: "hidden" });
  }

  async isVisible(): Promise<boolean> {
    return await this.dialog.isVisible().catch(() => false);
  }
}
