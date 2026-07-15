require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('../config/database');
const ExamNotification = require('../models/ExamNotification');
const ExamSource = require('../models/ExamSource');
const { fn, col, literal } = require('sequelize');

sequelize.authenticate().then(async () => {
  // Test getBoards
  const rows = await ExamNotification.findAll({
    attributes: [
      'board',
      [fn('COUNT', col('id')), 'count'],
      [fn('MAX', col('created_at')), 'last_scraped'],
    ],
    group: ['board'],
    order: [[literal('count'), 'DESC']],
    raw: true,
  });
  console.log('=== Boards in DB ===');
  console.log(JSON.stringify(rows, null, 2));

  // Test getExamsByBoard (first 3 SSC)
  const { count, rows: exams } = await ExamNotification.findAndCountAll({
    where: { board: 'SSC' },
    order: [['created_at', 'DESC']],
    limit: 3,
    include: [{ model: ExamSource, as: 'source', attributes: ['source_name', 'source_code'] }],
  });
  console.log('\n=== First 3 SSC notifications ===');
  exams.forEach(e => {
    console.log(`\nTitle: ${e.title.slice(0, 80)}...`);
    console.log(`PDF: ${e.official_notification_url}`);
    console.log(`Date: ${e.notification_date}`);
  });
  console.log(`\nTotal SSC: ${count}`);
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
