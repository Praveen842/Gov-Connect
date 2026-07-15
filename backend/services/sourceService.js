const sources = [
  {
    id: 1,
    name: "SSC Official Portal",
    url: "https://ssc.nic.in",
    type: "Recruitment",
    board: "SSC",
    status: "Active",
    selectors: {
      itemSelector: "article, .notice, .announcement, .news-item, .view-content, .search-result-item, .news-block, .news-list",
      titleSelector: "h1, h2, h3, .field-title, .title",
      linkSelector: "a[href]",
      dateSelector: "time, .date, .published, .news-date, .search-result-date",
    },
  },
  {
    id: 2,
    name: "UPSC Notification Feed",
    url: "https://upsc.gov.in",
    type: "Government",
    board: "UPSC",
    status: "Active",
    selectors: {
      itemSelector: "article, .notice, .announcement, .news-item, .views-row, .view-content, .news-block",
      titleSelector: "h1, h2, h3, .field-title, .title",
      linkSelector: "a[href]",
      dateSelector: "time, .date, .published, .news-date, .search-result-date",
    },
  },
];

function getSources() {
  return sources;
}

function addSource({ name, url, type = "Government", board = "Government", status = "Active" }) {
  const newSource = {
    id: Date.now(),
    name,
    url,
    type,
    board,
    status,
    selectors: {
      itemSelector: "article, .notice, .announcement, .news-item, .view-content, .news-block, .news-list",
      titleSelector: "h1, h2, h3, .field-title, .title",
      linkSelector: "a[href]",
      dateSelector: "time, .date, .published, .news-date, .search-result-date",
    },
  };

  sources.push(newSource);
  return newSource;
}

module.exports = {
  getSources,
  addSource,
};
