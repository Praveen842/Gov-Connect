const sequelize = require('../config/database');
sequelize.query("DELETE FROM exam_notifications WHERE board != 'SSC'")
  .then(() => { console.log('Cleared non-SSC records'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
