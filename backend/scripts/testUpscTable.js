const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://upsc.gov.in/whats-new')
  .then(res => {
    const $ = cheerio.load(res.data);
    const rows = [];
    $('.views-table tbody tr').slice(0, 3).each((i, el) => {
      rows.push({
        col1: $(el).find('td').eq(0).text().trim(),
        col2: $(el).find('td').eq(1).text().trim(),
        link: $(el).find('a').attr('href')
      });
    });
    console.log("Table rows:", rows);
    
    // Fallback if no table
    if (rows.length === 0) {
      console.log("No table found. Looking for list items...");
      $('.views-row').slice(0, 3).each((i, el) => {
        console.log($(el).text().replace(/\s+/g, ' ').trim());
      });
    }
  })
  .catch(console.error);
