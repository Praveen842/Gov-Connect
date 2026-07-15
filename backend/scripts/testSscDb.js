require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { parseSscNotifications } = require('../parsers/sscParser');
const sequelize = require('../config/database');
const ExamNotification = require('../models/ExamNotification');
const { Op } = require('sequelize');

sequelize.authenticate().then(async () => {
  console.log('Fetching SSC notifications from API limit 100...');
  try {
    const items = await parseSscNotifications();
    console.log(`Fetched ${items.length} notifications`);
    
    let inserted = 0;
    let updated = 0;
    for (const item of items) {
      try {
        const [record, created] = await ExamNotification.findOrCreate({
          where: {
            board: item.board,
            title: item.title,
            official_notification_url: item.official_notification_url
          },
          defaults: item
        });
        if (created) inserted++;
        else updated++;
      } catch (err) {
        console.error('DB Insert error for item:', item.title.slice(0, 50), err.message);
      }
    }
    console.log(`Inserted: ${inserted}, Updated: ${updated}`);
    
    const [rows] = await sequelize.query("SELECT COUNT(*) as cnt FROM exam_notifications WHERE board = 'SSC'");
    console.log('Total SSC in DB now:', rows[0].cnt);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
});
