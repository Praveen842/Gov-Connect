require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
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

async function debugSsc() {
  const chromePath = findChrome();
  console.log('Chrome path:', chromePath);
  
  if (!chromePath) {
    console.error('Chrome not found!');
    return;
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });

  const page = await browser.newPage();
  const networkRequests = [];

  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
      networkRequests.push({ type: 'REQ', url: req.url(), method: req.method() });
    }
    req.continue();
  });

  page.on('response', async resp => {
    const url = resp.url();
    const ct = resp.headers()['content-type'] || '';
    if (ct.includes('json') || url.includes('api')) {
      networkRequests.push({ type: 'RESP', url, status: resp.status(), contentType: ct });
      try {
        const text = await resp.text();
        networkRequests[networkRequests.length - 1].preview = text.slice(0, 200);
      } catch {}
    }
  });

  console.log('Navigating to SSC notice board...');
  await page.goto('https://ssc.gov.in/home/notice-board', {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  await new Promise(r => setTimeout(r, 5000));

  console.log('\nNetwork requests captured:');
  networkRequests.forEach(r => {
    console.log('\n' + r.type, r.url);
    if (r.preview) console.log('  Preview:', r.preview.slice(0, 150));
  });

  await browser.close();
}

debugSsc().catch(console.error);
