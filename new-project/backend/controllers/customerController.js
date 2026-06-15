const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const [result] = await db.query('INSERT INTO customers (name, phone, address) VALUES (?,?,?)', [name, phone, address]);
    res.status(201).json({ id: result.insertId, name, phone, address });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    await db.query('UPDATE customers SET name=?, phone=?, address=? WHERE id=?', [name, phone, address, req.params.id]);
    res.json({ message: 'Customer updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM customers WHERE id=?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
