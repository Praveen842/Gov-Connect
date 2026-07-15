const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function testSites() {
  try {
    const ibps = await axios.get('https://www.ibps.in/', { httpsAgent, timeout: 10000 });
    console.log("IBPS Length:", ibps.data.length);
  } catch(e) { console.error("IBPS Error:", e.message); }

  try {
    const rrb = await axios.get('https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,533,2015', { httpsAgent, timeout: 10000 });
    console.log("RRB Length:", rrb.data.length);
  } catch(e) { console.error("RRB Error:", e.message); }
}

testSites();
