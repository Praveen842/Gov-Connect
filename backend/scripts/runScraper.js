require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { scrapeAllSources } = require('../services/scraperService');
const sequelize = require('../config/database');

sequelize.authenticate().then(async () => {
  console.log('Running scraper for all boards...');
  const summary = await scrapeAllSources();
  console.log('Scraper Summary:', JSON.stringify(summary, null, 2));
  
  const [rows] = await sequelize.query("SELECT board, COUNT(*) as cnt FROM exam_notifications GROUP BY board");
  console.log('Total notifications by board:', rows);
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
