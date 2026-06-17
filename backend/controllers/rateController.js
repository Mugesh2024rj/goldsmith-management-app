const db = require('../config/db');
const { fetchLiveRates } = require('../utils/rates');

exports.getRates = async (req, res) => {
  try {
    const liveRates = await fetchLiveRates();
    if (liveRates.gold_rate || liveRates.silver_rate) {
      res.json({ gold_rate: liveRates.gold_rate, silver_rate: liveRates.silver_rate });
      return;
    }
    // Fall back to DB if live fetch returns zeros
    const [rows] = await db.query('SELECT * FROM rates ORDER BY id DESC LIMIT 1');
    res.json({ gold_rate: rows[0]?.gold_rate || 0, silver_rate: rows[0]?.silver_rate || 0 });
  } catch (err) {
    try {
      const [rows] = await db.query('SELECT * FROM rates ORDER BY id DESC LIMIT 1');
      res.json({ gold_rate: rows[0]?.gold_rate || 0, silver_rate: rows[0]?.silver_rate || 0 });
    } catch (dbErr) {
      res.status(500).json({ message: dbErr.message || err.message });
    }
  }
};

exports.updateRates = async (req, res) => {
  try {
    const { gold_rate, silver_rate } = req.body;
    const [rows] = await db.query('SELECT id FROM rates LIMIT 1');
    if (rows.length) {
      await db.query('UPDATE rates SET gold_rate=?, silver_rate=? WHERE id=?', [gold_rate, silver_rate, rows[0].id]);
    } else {
      await db.query('INSERT INTO rates (gold_rate, silver_rate) VALUES (?,?)', [gold_rate, silver_rate]);
    }
    res.json({ message: 'Rates updated', gold_rate, silver_rate });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
