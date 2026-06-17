const db = require('../config/db');
const { fetchLiveRates } = require('../utils/rates');

exports.getDashboard = async (req, res) => {
  try {
    const [[rates]] = await db.query('SELECT * FROM rates ORDER BY id DESC LIMIT 1');
    const [[weekly]] = await db.query("SELECT COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
    const [[monthly]] = await db.query("SELECT COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE MONTH(order_date)=MONTH(CURDATE()) AND YEAR(order_date)=YEAR(CURDATE())");
    const [[yearly]] = await db.query("SELECT COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE YEAR(order_date)=YEAR(CURDATE())");
    const [[pending]] = await db.query("SELECT COUNT(*) as count FROM orders WHERE status='pending'");
    const [[completed]] = await db.query("SELECT COUNT(*) as count FROM orders WHERE status='completed' OR status='delivered'");
    const [[repair]] = await db.query("SELECT COUNT(*) as count FROM orders WHERE work_type='repair'");
    const liveRates = await fetchLiveRates();
    const goldRate = liveRates.gold_rate || rates?.gold_rate || 0;
    const silverRate = liveRates.silver_rate || rates?.silver_rate || 0;

    try {
      const [rows] = await db.query('SELECT id FROM rates LIMIT 1');
      if (rows.length) {
        await db.query('UPDATE rates SET gold_rate=?, silver_rate=? WHERE id=?', [goldRate, silverRate, rows[0].id]);
      } else {
        await db.query('INSERT INTO rates (gold_rate, silver_rate) VALUES (?,?)', [goldRate, silverRate]);
      }
    } catch (updateError) {
      // Ignore DB update failures and keep the live value in the response.
    }

    res.json({
      gold_rate: goldRate,
      silver_rate: silverRate,
      weekly_revenue: weekly.revenue,
      monthly_revenue: monthly.revenue,
      yearly_revenue: yearly.revenue,
      pending_orders: pending.count,
      completed_orders: completed.count,
      repair_orders: repair.count,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
