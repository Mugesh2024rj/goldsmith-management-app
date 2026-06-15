const https = require('https');

const GOLD_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=inr';
const TROY_OZ_TO_GRAM = 31.1035;
const GOLD_SILVER_RATIO = 80;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache = { gold_rate: 0, silver_rate: 0, fetchedAt: 0 };

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
  // Return cached value if still fresh
  if (cache.gold_rate > 0 && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return { gold_rate: cache.gold_rate, silver_rate: cache.silver_rate };
  }

  try {
    const fetcher = globalThis.fetch
      ? (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      : fetchJson;

    const data = await fetcher(GOLD_URL);
    const goldPerGram = Math.round(Number(data['pax-gold']?.inr || 0) / TROY_OZ_TO_GRAM);
    if (goldPerGram > 0) {
      cache = { gold_rate: goldPerGram, silver_rate: Math.round(goldPerGram / GOLD_SILVER_RATIO), fetchedAt: Date.now() };
    }
    return { gold_rate: cache.gold_rate, silver_rate: cache.silver_rate };
  } catch (error) {
    // Return last known good cache even if expired, rather than 0
    if (cache.gold_rate > 0) return { gold_rate: cache.gold_rate, silver_rate: cache.silver_rate };
    return { gold_rate: 0, silver_rate: 0, error: error.message };
  }
}

module.exports = { fetchLiveRates };
