require("dotenv").config();
const sequelize = require("../config/database");
const ExamSource = require("../models/ExamSource");
const defaultSources = require("../seed/defaultSources");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected.");

    for (const source of defaultSources) {
      await ExamSource.upsert({
        source_name: source.source_name,
        source_code: source.source_code,
        base_url: source.base_url,
        notification_url: source.notification_url,
        result_url: source.result_url,
        admit_card_url: source.admit_card_url,
        answer_key_url: source.answer_key_url,
        fetch_type: source.fetch_type,
        status: source.status,
      });
      console.log(`Updated source: ${source.source_code}`);
    }

    console.log("Sources updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating sources:", error);
    process.exit(1);
  }
})();
