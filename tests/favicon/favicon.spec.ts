import { test, expect } from "../fixtures/pages";

test("BuggyBoard references its favicon asset", async ({
  documentPage,
  page,
}) => {
  await page.goto("/login");
  await expect(documentPage.faviconLink).toHaveAttribute(
    "href",
    /favicon\.ico$/
  );
});
