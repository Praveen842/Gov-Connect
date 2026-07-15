/**
 * One-time script: drops and recreates exam_sources, scraper_logs, and
 * exam_notifications to match the current Sequelize model definitions,
 * then seeds the default sources.
 *
 * Run with:  node scripts/resetTables.js
 */
require("dotenv").config();
const sequelize = require("../config/database");
const ExamSource = require("../models/ExamSource");
const defaultSources = require("../seed/defaultSources");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected.");

    // Disable FK checks for the entire operation (drops + creates)
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // Drop ALL tables that reference exam_notifications first
    await sequelize.query("DROP TABLE IF EXISTS candidate_exam_leads");
    console.log("Dropped candidate_exam_leads.");
    await sequelize.query("DROP TABLE IF EXISTS exam_notification_tags");
    console.log("Dropped exam_notification_tags.");
    await sequelize.query("DROP TABLE IF EXISTS eligibility_rules");
    console.log("Dropped eligibility_rules.");
    await sequelize.query("DROP TABLE IF EXISTS exam_updates");
    console.log("Dropped exam_updates.");

    // Drop in dependency order (children first)
    await sequelize.query("DROP TABLE IF EXISTS exam_notifications");
    console.log("Dropped exam_notifications.");
    await sequelize.query("DROP TABLE IF EXISTS scraper_logs");
    console.log("Dropped scraper_logs.");
    await sequelize.query("DROP TABLE IF EXISTS exam_sources");
    console.log("Dropped exam_sources.");

    // Create exam_sources first (parent table)
    await sequelize.query(`
      CREATE TABLE exam_sources (
        id                INT          NOT NULL AUTO_INCREMENT,
        source_name       VARCHAR(255) NOT NULL,
        source_code       VARCHAR(255) NOT NULL,
        base_url          VARCHAR(255) NOT NULL,
        notification_url  VARCHAR(255) DEFAULT NULL,
        result_url        VARCHAR(255) DEFAULT NULL,
        admit_card_url    VARCHAR(255) DEFAULT NULL,
        answer_key_url    VARCHAR(255) DEFAULT NULL,
        fetch_type        VARCHAR(255) NOT NULL DEFAULT 'html',
        status            VARCHAR(255) NOT NULL DEFAULT 'active',
        created_at        DATETIME     NOT NULL,
        updated_at        DATETIME     NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_source_code (source_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log("exam_sources created.");

    // Create scraper_logs
    await sequelize.query(`
      CREATE TABLE scraper_logs (
        id               INT          NOT NULL AUTO_INCREMENT,
        source_id        INT          NOT NULL,
        job_name         VARCHAR(255) NOT NULL,
        status           VARCHAR(255) NOT NULL DEFAULT 'started',
        records_inserted INT          NOT NULL DEFAULT 0,
        records_updated  INT          NOT NULL DEFAULT 0,
        error_message    TEXT,
        started_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        finished_at      DATETIME,
        PRIMARY KEY (id),
        INDEX idx_scraper_logs_source (source_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log("scraper_logs created.");

    // Create exam_notifications (no FK to avoid cross-table compatibility issues)
    await sequelize.query(`
      CREATE TABLE exam_notifications (
        id                           INT          NOT NULL AUTO_INCREMENT,
        source_id                    INT          NOT NULL,
        board                        VARCHAR(255) NOT NULL,
        exam_name                    VARCHAR(255) NOT NULL,
        title                        TEXT         NOT NULL,
        category                     VARCHAR(255),
        notification_date            DATETIME,
        apply_start_date             DATETIME,
        apply_end_date               DATETIME,
        exam_date                    DATETIME,
        official_notification_url    VARCHAR(255) NOT NULL,
        official_apply_url           VARCHAR(255),
        status                       VARCHAR(255) NOT NULL DEFAULT 'active',
        created_at                   DATETIME     NOT NULL,
        updated_at                   DATETIME     NOT NULL,
        PRIMARY KEY (id),
        INDEX idx_en_source_id   (source_id),
        INDEX idx_en_board       (board),
        INDEX idx_en_created_at  (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log("exam_notifications created.");

    // Re-enable FK checks only after all tables are in place
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("FK checks re-enabled.");

    // Seed default sources via Sequelize so timestamps are handled correctly
    await ExamSource.bulkCreate(defaultSources);
    console.log("Default sources seeded:", defaultSources.map((s) => s.source_code).join(", "));

    process.exit(0);
  } catch (err) {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1").catch(() => {});
    console.error("Reset failed:", err.message);
    console.error(err.sql || "");
    process.exit(1);
  }
})();
