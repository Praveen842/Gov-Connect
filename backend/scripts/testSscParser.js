require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { parseSscNotifications } = require('../parsers/sscParser');

async function run() {
  console.log('Fetching SSC notifications from API...');
  try {
    const items = await parseSscNotifications();
    console.log(`Fetched ${items.length} notifications`);
    if (items.length > 0) {
      console.log('\nFirst 3 items:');
      items.slice(0, 3).forEach((item, i) => {
        console.log(`\n[${i + 1}] ${item.title}`);
        console.log(`    Category : ${item.category}`);
        console.log(`    Date     : ${item.notification_date}`);
        console.log(`    PDF URL  : ${item.official_notification_url}`);
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
