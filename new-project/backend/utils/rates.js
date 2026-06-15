const https = require('https');

// pax-gold (PAXG) tracks 1 troy oz of gold. Divide by 31.1035 to get per-gram INR rate.
const GOLD_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=inr';
const TROY_OZ_TO_GRAM = 31.1035;
// Gold-silver ratio (~80) is used to derive silver per-gram from gold per-gram.
const GOLD_SILVER_RATIO = 80;

const fetchJson = (url) => new Promise((resolve, reject) => {
  const req = https.get(url, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      if (res.statusCode >= 400) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
    });
  });
  req.on('error', reject);
});

async function fetchLiveRates() {
  try {
    const fetcher = globalThis.fetch
      ? (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      : fetchJson;

    const data = await fetcher(GOLD_URL);
    const goldPerGram = Math.round(Number(data['pax-gold']?.inr || 0) / TROY_OZ_TO_GRAM);
    const silverPerGram = Math.round(goldPerGram / GOLD_SILVER_RATIO);
    return { gold_rate: goldPerGram, silver_rate: silverPerGram };
  } catch (error) {
    return { gold_rate: 0, silver_rate: 0, error: error.message };
  }
}

module.exports = { fetchLiveRates };
