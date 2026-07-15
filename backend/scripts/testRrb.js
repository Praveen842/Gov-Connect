const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

axios.get('https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,533,2015', { httpsAgent })
  .then(res => {
    const $ = cheerio.load(res.data);
    const links = [];
    $('a').each((i, el) => {
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      const href = $(el).attr('href');
      if (title && href && title.length > 5 && !href.startsWith('javascript')) {
        links.push({ title, href });
      }
    });
    console.log("RRB Links:", links.slice(0, 10));
  })
  .catch(console.error);
