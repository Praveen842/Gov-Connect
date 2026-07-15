require("dotenv").config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require("../config/database");

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query("ALTER TABLE exam_notifications MODIFY COLUMN official_notification_url VARCHAR(255) NULL");
    console.log("Altered table successfully");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
