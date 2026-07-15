const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

axios.get('https://upsc.gov.in/whats-new', { httpsAgent }).then(res => {
  const $ = cheerio.load(res.data);
  console.log('UPSC items:', $('.views-row').length);
}).catch(console.error);
