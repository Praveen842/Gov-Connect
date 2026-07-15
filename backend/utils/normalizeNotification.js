function normalizeNotification(raw) {
  return {
    board: raw.board || raw.source_code || "Government",
    exam_name: (raw.exam_name || raw.title || "Unknown exam").slice(0, 250),
    title: raw.title || raw.exam_name || "Notification",
    category: raw.category || "notification",
    notification_date: raw.notification_date ? new Date(raw.notification_date) : null,
    apply_start_date: raw.apply_start_date ? new Date(raw.apply_start_date) : null,
    apply_end_date: raw.apply_end_date ? new Date(raw.apply_end_date) : null,
    exam_date: raw.exam_date ? new Date(raw.exam_date) : null,
    official_notification_url: raw.official_notification_url || raw.url || null,
    attachments: raw.attachments || [],
    description: raw.description || null,
    official_apply_url: raw.official_apply_url || raw.apply_url || null,
    status: raw.status || "active",
    source_code: raw.source_code || raw.board || "government",
  };
}

module.exports = normalizeNotification;
