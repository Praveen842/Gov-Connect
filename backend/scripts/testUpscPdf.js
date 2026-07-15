const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://upsc.gov.in/whats-new')
  .then(res => {
    const $ = cheerio.load(res.data);
    const pdfs = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if(href && href.toLowerCase().endsWith('.pdf')) {
        pdfs.push({ title: $(el).text().trim(), href });
      }
    });
    console.log(pdfs);
  })
  .catch(console.error);
