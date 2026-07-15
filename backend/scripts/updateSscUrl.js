require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

const newUrl = 'https://ssc.gov.in/api/noticeBoard/getAllNoticeBoard?page=0&pageSize=20&noticeBoardType=all';

db.authenticate().then(async () => {
  const [results] = await db.query(
    "UPDATE exam_sources SET notification_url = ?, fetch_type = 'api' WHERE source_code = 'SSC'",
    { replacements: [newUrl] }
  );
  console.log('Updated rows:', results.affectedRows);

  const [rows] = await db.query('SELECT source_code, notification_url, fetch_type FROM exam_sources');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});
