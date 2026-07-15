const axios = require("axios");
const { parseSscNotifications } = require("../parsers/sscParser");
const { parseUpscNotifications } = require("../parsers/upscParser");
const { parseRrbNotifications } = require("../parsers/rrbParser");
const { parseIbpsNotifications } = require("../parsers/ibpsParser");
const normalizeNotification = require("../utils/normalizeNotification");
const findDuplicate = require("../utils/duplicateChecker");
const ExamSource = require("../models/ExamSource");
const ExamNotification = require("../models/ExamNotification");
const ScraperLog = require("../models/ScraperLog");

// Parsers that handle their own HTTP fetching (async, return Promise<Array>)
const asyncParserCodes = new Set(["SSC", "UPSC", "RRB", "IBPS"]);

const parserMap = {
  SSC: parseSscNotifications,
  UPSC: parseUpscNotifications,
  RRB: parseRrbNotifications,
  IBPS: parseIbpsNotifications,
};

async function fetchSourceHtml(url) {
  const response = await axios.get(url, {
    timeout: 20_000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    },
  });
  return response.data;
}

async function upsertNotification(source, rawNotification) {
  const normalized = normalizeNotification(rawNotification);
  const duplicate = await findDuplicate(source._id, normalized.official_notification_url, normalized.title);

  if (duplicate) {
    const updateResult = await ExamNotification.updateOne(
      { _id: duplicate._id },
      {
        $set: {
          board: normalized.board,
          exam_name: normalized.exam_name,
          title: normalized.title,
          category: normalized.category,
          notification_date: normalized.notification_date,
          apply_start_date: normalized.apply_start_date,
          apply_end_date: normalized.apply_end_date,
          exam_date: normalized.exam_date,
          official_apply_url: normalized.official_apply_url,
          official_notification_url: normalized.official_notification_url,
          attachments: normalized.attachments || [],
          description: normalized.description || null,
          status: normalized.status,
        }
      }
    );

    return { type: "updated", record: duplicate, updatedCount: updateResult.modifiedCount };
  }

  const created = await ExamNotification.create({
    source_id: source._id,
    board: normalized.board,
    exam_name: normalized.exam_name,
    title: normalized.title,
    category: normalized.category,
    notification_date: normalized.notification_date,
    apply_start_date: normalized.apply_start_date,
    apply_end_date: normalized.apply_end_date,
    exam_date: normalized.exam_date,
    official_notification_url: normalized.official_notification_url,
    attachments: normalized.attachments || [],
    description: normalized.description || null,
    official_apply_url: normalized.official_apply_url,
    status: normalized.status,
  });

  return { type: "inserted", record: created };
}

async function scrapeSource(source) {
  const parser = parserMap[source.source_code];
  if (!parser) {
    throw new Error(`No parser found for source code ${source.source_code}`);
  }

  // Async parsers (e.g. SSC) fetch their own data via API — skip HTML fetch
  let rawNotifications;
  if (asyncParserCodes.has(source.source_code)) {
    rawNotifications = await parser(source.notification_url || source.base_url);
  } else {
    const html = await fetchSourceHtml(source.notification_url || source.base_url);
    rawNotifications = parser(html);
  }

  const inserted = [];
  const updated = [];
  const errors = [];

  for (const rawNotification of rawNotifications) {
    try {
      const result = await upsertNotification(source, rawNotification);
      if (result.type === "inserted") inserted.push(result.record);
      else if (result.type === "updated") updated.push(result.record);
    } catch (error) {
      errors.push(error);
    }
  }

  return { inserted, updated, errors, total: rawNotifications.length };
}

async function scrapeAllSources() {
  const sources = await ExamSource.find({ status: "active" });
  const jobName = "scraperJob";
  const summary = [];

  for (const source of sources) {
    const log = await ScraperLog.create({
      source_id: source._id,
      job_name: jobName,
      status: "started",
      records_inserted: 0,
      records_updated: 0,
      started_at: new Date(),
    });

    try {
      const { inserted, updated, errors, total } = await scrapeSource(source);

      log.status = errors.length ? "failed" : "completed";
      log.records_inserted = inserted.length;
      log.records_updated = updated.length;
      log.error_message = errors.length ? errors.map((err) => err.message).join(" | ") : null;
      log.finished_at = new Date();
      await log.save();

      summary.push({
        source: source.source_code,
        total,
        inserted: inserted.length,
        updated: updated.length,
        errors: errors.map((err) => err.message),
      });
    } catch (error) {
      log.status = "failed";
      log.error_message = error.message;
      log.finished_at = new Date();
      await log.save();

      summary.push({
        source: source.source_code,
        total: 0,
        inserted: 0,
        updated: 0,
        errors: [error.message],
      });
    }
  }

  return summary;
}

module.exports = {
  scrapeAllSources,
  fetchSourceHtml,
};
