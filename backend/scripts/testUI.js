const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function run() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error("Chrome not found!");
    return;
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to login...");
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'artifacts/screenshot_1_login.png' });

  console.log("Logging in...");
  await page.type('input[type="email"]', 'john@example.com');
  await page.type('input[type="password"]', '123456');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log("On dashboard...");
  await page.screenshot({ path: 'artifacts/screenshot_2_dashboard.png' });

  console.log("Going to SSC board...");
  await page.goto('http://localhost:5173/exams/board/SSC', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'artifacts/screenshot_3_ssc.png' });

  await browser.close();
  console.log("Done!");
}

run().catch(console.error);
