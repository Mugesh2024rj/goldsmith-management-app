const db = require('../config/db');

const revenueQuery = (condition) => `
  SELECT 
    COALESCE(SUM(total_amount),0) as total_revenue,
    COALESCE(SUM(CASE WHEN metal_type='gold' THEN net_weight ELSE 0 END),0) as total_gold_weight,
    COALESCE(SUM(CASE WHEN metal_type='silver' THEN net_weight ELSE 0 END),0) as total_silver_weight,
    COALESCE(SUM(CASE WHEN status NOT IN ('completed','delivered') THEN balance_amount ELSE 0 END),0) as pending_amount,
    COUNT(CASE WHEN status='completed' OR status='delivered' THEN 1 END) as completed_orders,
    COUNT(*) as total_orders
  FROM orders WHERE ${condition}
`;

exports.daily = async (req, res) => {
  try {
    const [rows] = await db.query(revenueQuery('DATE(order_date) = CURDATE()'));
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.weekly = async (req, res) => {
  try {
    const [rows] = await db.query(revenueQuery('order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'));
    const [chartData] = await db.query(`
      SELECT DATE(order_date) as date, SUM(total_amount) as revenue
      FROM orders WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(order_date) ORDER BY date
    `);
    res.json({ ...rows[0], chartData });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.monthly = async (req, res) => {
  try {
    const [rows] = await db.query(revenueQuery('MONTH(order_date) = MONTH(CURDATE()) AND YEAR(order_date) = YEAR(CURDATE())'));
    const [chartData] = await db.query(`
      SELECT WEEK(order_date) as week, SUM(total_amount) as revenue
      FROM orders WHERE MONTH(order_date) = MONTH(CURDATE()) AND YEAR(order_date) = YEAR(CURDATE())
      GROUP BY WEEK(order_date) ORDER BY week
    `);
    const [metalData] = await db.query(`
      SELECT metal_type, COUNT(*) as count FROM orders
      WHERE MONTH(order_date) = MONTH(CURDATE()) AND YEAR(order_date) = YEAR(CURDATE())
      GROUP BY metal_type
    `);
    res.json({ ...rows[0], chartData, metalData });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.yearly = async (req, res) => {
  try {
    const [rows] = await db.query(revenueQuery('YEAR(order_date) = YEAR(CURDATE())'));
    const [chartData] = await db.query(`
      SELECT MONTH(order_date) as month, SUM(total_amount) as revenue
      FROM orders WHERE YEAR(order_date) = YEAR(CURDATE())
      GROUP BY MONTH(order_date) ORDER BY month
    `);
    const [statusData] = await db.query(`
      SELECT status, COUNT(*) as count FROM orders
      WHERE YEAR(order_date) = YEAR(CURDATE()) GROUP BY status
    `);
    res.json({ ...rows[0], chartData, statusData });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
