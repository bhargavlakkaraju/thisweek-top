
import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///workspace/thisweek/html/index.html", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/thisweek/thisweek-home-hero.png" });
await page.evaluate(async () => {
  const step = 400;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 50));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(300);
await page.screenshot({
  path: "/workspace/thisweek/thisweek-home-full.png",
  fullPage: true,
});
await browser.close();
console.log("screenshots ok");
