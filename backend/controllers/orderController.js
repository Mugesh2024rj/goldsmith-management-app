const db = require('../config/db');

const orderQuery = `
  SELECT o.*, c.name as customer_name, c.phone as customer_phone
  FROM orders o JOIN customers c ON o.customer_id = c.id
`;

exports.getAll = async (req, res) => {
  try {
    const { search, metal_type, status, work_type } = req.query;
    let query = orderQuery;
    const params = [];
    const conditions = [];
    if (search) {
      conditions.push('(c.name LIKE ? OR c.phone LIKE ? OR o.id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (metal_type) { conditions.push('o.metal_type = ?'); params.push(metal_type); }
    if (status) { conditions.push('o.status = ?'); params.push(status); }
    if (work_type) { conditions.push('o.work_type = ?'); params.push(work_type); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY o.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(orderQuery + ' WHERE o.id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Order not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { customer_id, metal_type, ornament_type, work_type, gross_weight, stone_weight, net_weight, wastage, rate, making_charge, repair_charge, advance_amount, total_amount, balance_amount, status, order_date, delivery_date } = req.body;
    const [result] = await db.query(
      'INSERT INTO orders (customer_id,metal_type,ornament_type,work_type,gross_weight,stone_weight,net_weight,wastage,rate,making_charge,repair_charge,advance_amount,total_amount,balance_amount,status,order_date,delivery_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [customer_id, metal_type, ornament_type, work_type, gross_weight, stone_weight, net_weight, wastage, rate, making_charge, repair_charge, advance_amount, total_amount, balance_amount, status || 'pending', order_date, delivery_date]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const { metal_type, ornament_type, work_type, gross_weight, stone_weight, net_weight, wastage, rate, making_charge, repair_charge, advance_amount, total_amount, balance_amount, status, order_date, delivery_date } = req.body;
    const cleanDate = (d) => (d ? String(d).split('T')[0] : null);
    await db.query(
      'UPDATE orders SET metal_type=?,ornament_type=?,work_type=?,gross_weight=?,stone_weight=?,net_weight=?,wastage=?,rate=?,making_charge=?,repair_charge=?,advance_amount=?,total_amount=?,balance_amount=?,status=?,order_date=?,delivery_date=? WHERE id=?',
      [metal_type, ornament_type, work_type, gross_weight, stone_weight, net_weight, wastage, rate, making_charge, repair_charge, advance_amount, total_amount, balance_amount, status, cleanDate(order_date), cleanDate(delivery_date), req.params.id]
    );
    res.json({ message: 'Order updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const isSettled = status === 'completed' || status === 'delivered';
    await db.query(
      'UPDATE orders SET status=?, balance_amount = CASE WHEN ? THEN 0 ELSE balance_amount END WHERE id=?',
      [status, isSettled, req.params.id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM orders WHERE id=?', [req.params.id]);
    res.json({ message: 'Order deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
