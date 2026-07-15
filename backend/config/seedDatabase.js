const ExamSource = require("../models/ExamSource");
const defaultSources = require("../seed/defaultSources");

async function seedDatabase() {
  try {
    for (const source of defaultSources) {
      await ExamSource.findOneAndUpdate(
        { source_code: source.source_code },
        source,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log("Exam sources seeded / updated.");
  } catch (err) {
    console.warn("Seeding skipped:", err.message);
  }
}

seedDatabase().catch((err) => {
  console.error("Seeding failed:", err.message);
});
