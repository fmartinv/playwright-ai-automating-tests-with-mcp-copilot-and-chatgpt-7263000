import { test, expect } from "../fixtures/pages";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

let createdTitle = "";

test("create a bug then edit it to Closed and record a video", async ({
  videoPage,
  videoLoginPage,
  videoBoardPage,
  videoCreateBugModal,
  videoEditBugModal,
}) => {
  const videosDir = join(process.cwd(), "playwright-videos");
  mkdirSync(videosDir, { recursive: true });

  await videoLoginPage.loginWithFirstUser();

  await videoBoardPage.clickNewBugButton();

  const title = `e2e video bug ${Date.now()}`;
  createdTitle = title;
  await videoCreateBugModal.fillBugForm({
    title,
    severity: "mid",
    owner: "buggy",
    description: "Created by automated video test",
  });
  await videoCreateBugModal.submit();

  const row = await videoBoardPage.getBugRowByTitle(title);
  await expect(row).toBeVisible();

  // Open the bug for editing
  await videoBoardPage.clickBugByTitle(title);
  await expect(videoEditBugModal.dialog).toBeVisible();

  // Change state to Closed using the edit modal select
  await videoEditBugModal.setState("closed");

  // Save
  await videoEditBugModal.save();

  // Show Closed bugs
  await videoBoardPage.showClosedBugs();

  // Close the page to finalize the video
  await videoPage.close();
  const video = videoPage.video();
  if (!video) {
    throw new Error("Expected the video fixture to record a video.");
  }
  const videoPath = await video.path();

  // Assert the video file exists
  expect(videoPath).toBeTruthy();
  expect(existsSync(videoPath)).toBe(true);

  // Log path for visibility in test output
  console.log("Recorded video:", videoPath);
});

test.afterEach(async ({ request }) => {
  if (!createdTitle) return;
  const response = await request.get("/api/bugs");
  const bugs = (await response.json()) as Array<{ id: number; title: string }>;
  const createdBug = bugs.find((bug) => bug.title === createdTitle);
  if (createdBug) await request.delete(`/api/bugs/${createdBug.id}`);
  createdTitle = "";
});
