import { chromium } from "playwright";
import fs from "fs";

const html = "file:///workspace/thisweek/html/board-v11.html";
const heroPath = "/workspace/thisweek/board-v11-hero.png";
const fullPath = "/workspace/thisweek/board-v11-full.png";

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(html, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// Ensure fonts/favicons settled
await page.evaluate(async () => {
  if (document.fonts?.ready) await document.fonts.ready;
});
await page.waitForTimeout(400);

await page.screenshot({ path: heroPath });

await page.evaluate(async () => {
  const step = 400;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(300);

await page.screenshot({ path: fullPath, fullPage: true });
await browser.close();

function dims(path) {
  // PNG IHDR width/height at bytes 16-23
  const buf = fs.readFileSync(path);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(24);
  const size = buf.length;
  return { path, w, h, size };
}

console.log(JSON.stringify({ hero: dims(heroPath), full: dims(fullPath) }, null, 2));
