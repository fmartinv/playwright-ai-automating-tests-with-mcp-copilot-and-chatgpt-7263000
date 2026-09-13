import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { BoardPage } from "../pages/BoardPage";
import { CreateBugModal } from "../pages/CreateBugModal";
import { EditBugModal } from "../pages/EditBugModal";
import { TitleBar } from "../pages/TitleBar";
import { DocumentPage } from "../pages/DocumentPage";
import type { BrowserContext, Page } from "@playwright/test";

// Declare fixture types for TypeScript support
type PagesFixtures = {
  loginPage: LoginPage;
  boardPage: BoardPage;
  createBugModal: CreateBugModal;
  editBugModal: EditBugModal;
  titleBar: TitleBar;
  documentPage: DocumentPage;
  videoPage: Page;
  videoLoginPage: LoginPage;
  videoBoardPage: BoardPage;
  videoCreateBugModal: CreateBugModal;
  videoEditBugModal: EditBugModal;
};

// Create and export custom test function with fixtures
export const test = base.extend<PagesFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
    // Cleanup happens automatically
  },

  boardPage: async ({ page }, use) => {
    const boardPage = new BoardPage(page);
    await use(boardPage);
  },

  createBugModal: async ({ page }, use) => {
    const modal = new CreateBugModal(page);
    await use(modal);
  },

  editBugModal: async ({ page }, use) => {
    const modal = new EditBugModal(page);
    await use(modal);
  },

  titleBar: async ({ page }, use) => {
    await use(new TitleBar(page));
  },

  documentPage: async ({ page }, use) => {
    await use(new DocumentPage(page));
  },

  videoPage: async ({ browser }, use) => {
    let context: BrowserContext | undefined;
    try {
      context = await browser.newContext({
        recordVideo: {
          dir: "playwright-videos",
          size: { width: 1280, height: 720 },
        },
      });
      await use(await context.newPage());
    } finally {
      await context?.close();
    }
  },

  videoLoginPage: async ({ videoPage }, use) => {
    await use(new LoginPage(videoPage));
  },

  videoBoardPage: async ({ videoPage }, use) => {
    await use(new BoardPage(videoPage));
  },

  videoCreateBugModal: async ({ videoPage }, use) => {
    await use(new CreateBugModal(videoPage));
  },

  videoEditBugModal: async ({ videoPage }, use) => {
    await use(new EditBugModal(videoPage));
  },
});

export { expect } from "@playwright/test";
