import { test } from "@playwright/test";

test("渲染默认样式", async ({ page }) => {
  const htmlString = "<img src='http://localhost:3000/api/alex-programer' />";
  await page.setContent(htmlString);
  await page.waitForLoadState();
  await page.locator("img").screenshot({ path: "./test/screenshot/test.png" });
});
