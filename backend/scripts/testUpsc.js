const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://upsc.gov.in/whats-new')
  .then(res => {
    const $ = cheerio.load(res.data);
    const items = [];
    $('.views-row').slice(0, 5).each((i, el) => {
      const titleEl = $(el).find('a');
      const title = titleEl.text().trim();
      const link = titleEl.attr('href');
      items.push({ title, link });
    });
    console.log(items);
  })
  .catch(console.error);
