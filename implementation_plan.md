# Web Scraper Migration & Expansion Plan

This plan outlines the steps to build and integrate robust automated web scrapers for the remaining three examination boards: UPSC, RRB, and IBPS.

## Proposed Changes

Currently, the scraping service correctly fetches SSC data using an asynchronous, API-driven approach. We will upgrade the remaining parsers to handle complex nested scraping tasks autonomously.

### 1. UPSC Scraper Upgrade
- **Challenge:** UPSC's "What's New" page (`https://upsc.gov.in/whats-new`) lists notifications, but the actual PDF documents are often nested one click deep inside subpages.
- **Implementation:**
  - Rewrite `parsers/upscParser.js` to be fully asynchronous.
  - Fetch the main "What's New" page and extract the top 20 latest notifications.
  - For each notification, check if the link directly points to a `.pdf`.
  - If not, use Axios to swiftly fetch the subpage HTML and extract the embedded `.pdf` link.
  - Return the normalized data array.

### 2. RRB Scraper Upgrade
- **Challenge:** Railway Recruitment Board notifications are centrally listed but the DOM structure needs correct mapping.
- **Implementation:**
  - Rewrite `parsers/rrbParser.js` to be asynchronous.
  - Use Axios to fetch the HTML from `https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,533,2015`.
  - Parse the tables/lists to extract the latest RRB notifications, mapping `official_apply_url` and `official_notification_url`.

### 3. IBPS Scraper Upgrade
- **Challenge:** IBPS lists active notices directly on its homepage ticker/lists.
- **Implementation:**
  - Rewrite `parsers/ibpsParser.js` to fetch `https://www.ibps.in/`.
  - Parse the latest news/notifications from the homepage elements.

### 4. Scraper Service & Seed Integration
- **`services/scraperService.js`**: Add UPSC, RRB, and IBPS to the `asyncParserCodes` Set so the scraping engine delegates the HTTP fetching entirely to the specialized parser files.
- **`seed/defaultSources.js`**: Ensure the URLs are correctly updated so the database properly points the scraper jobs to the correct starting endpoints.

## User Review Required

> **WARNING**: Web scraping is inherently susceptible to layout changes on the target government websites. If a board redesigns their site, the specific parser may fail and require a code update in the future.

## Verification Plan

### Automated Tests
- Run the standalone parser scripts for UPSC, RRB, and IBPS to ensure they successfully fetch valid JSON arrays containing PDF URLs.
- Run `node scripts/runScraper.js` to verify all boards insert correctly without database schema conflicts.

### Manual Verification
- Restart the backend to let the updated `seedDatabase` script and `updateScheduler` run.
- Open the candidate dashboard at `http://localhost:5173`.
- Verify the UPSC, RRB, and IBPS cards now show live notification counts instead of "Coming Soon".
- Click into each board and verify the notification titles, dates, and "📄 View Official PDF Notice" buttons work perfectly.
