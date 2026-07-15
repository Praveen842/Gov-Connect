const sequelize = require('../config/database');
sequelize.query("SELECT id, title, official_notification_url FROM exam_notifications WHERE board = 'UPSC'")
  .then(([rows]) => { console.log(JSON.stringify(rows, null, 2)); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
