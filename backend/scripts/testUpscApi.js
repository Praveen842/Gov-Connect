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

(async () => {
  const chromePath = findChrome();
  if (!chromePath) return console.log("Chrome not found");

  const browser = await puppeteer.launch({ executablePath: chromePath, headless: "new" });
  const page = await browser.newPage();
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('graphql') || url.includes('ajax')) {
      console.log('Intercepted:', url);
    }
  });

  await page.goto('https://upsc.gov.in/whats-new', { waitUntil: 'networkidle2' });
  await browser.close();
  console.log("Done");
})();
