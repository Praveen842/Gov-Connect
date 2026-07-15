const ExamNotification = require("../models/ExamNotification");

async function findDuplicate(sourceId, officialNotificationUrl, title) {
  return ExamNotification.findOne({
    source_id: sourceId,
    title: title
  });
}

module.exports = findDuplicate;
