import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "/workspace/thisweek/outbid-live";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://outbid.lol/", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(2500);
await page.evaluate(async () => {
  if (document.fonts?.ready) await document.fonts.ready;
});
await page.waitForTimeout(800);

const hero = path.join(outDir, "outbid-hero.png");
const full = path.join(outDir, "outbid-full.png");
const mid = path.join(outDir, "outbid-board.png");

await page.screenshot({ path: hero });

// scroll a bit into board
await page.evaluate(() => window.scrollTo(0, 420));
await page.waitForTimeout(400);
await page.screenshot({ path: mid });

await page.evaluate(async () => {
  const step = 500;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 50));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(400);
await page.screenshot({ path: full, fullPage: true });

// dump some DOM structure for density notes
const notes = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      class: el.className?.toString?.().slice(0, 120),
      text: (el.innerText || "").slice(0, 200),
      h: Math.round(r.height),
      w: Math.round(r.width),
      pad: cs.padding,
      gap: cs.gap,
      font: cs.font,
    };
  };
  const buttons = [...document.querySelectorAll("button, a")].slice(0, 40).map((el) => ({
    text: (el.innerText || "").trim().slice(0, 60),
    bg: getComputedStyle(el).backgroundColor,
    color: getComputedStyle(el).color,
    pad: getComputedStyle(el).padding,
    h: Math.round(el.getBoundingClientRect().height),
  })).filter((b) => b.text);
  const cards = [...document.querySelectorAll("[class*='card'], [class*='row'], article, li")].slice(0, 30).map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      class: el.className?.toString?.().slice(0, 80),
      h: Math.round(r.height),
      w: Math.round(r.width),
      pad: cs.padding,
      text: (el.innerText || "").replace(/\s+/g, " ").slice(0, 100),
    };
  }).filter((c) => c.h > 40 && c.h < 200 && c.w > 400);
  return {
    title: document.title,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    buttons: buttons.slice(0, 25),
    cards: cards.slice(0, 15),
    bodyText: document.body.innerText.slice(0, 2500),
  };
});
fs.writeFileSync(path.join(outDir, "outbid-dom.json"), JSON.stringify(notes, null, 2));
await browser.close();
console.log(JSON.stringify({ hero, mid, full, notesSummary: { buttons: notes.buttons.length, cards: notes.cards.length, title: notes.title } }, null, 2));
