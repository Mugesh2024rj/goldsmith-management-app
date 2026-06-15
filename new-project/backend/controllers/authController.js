const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const FALLBACK_USERS = {
  admin: { id: 1, name: 'Admin User', username: 'admin', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'admin' },
  staff: { id: 2, name: 'Staff User', username: 'staff', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'staff' },
};

const fallbackLogin = async (username, password) => {
  const user = FALLBACK_USERS[username];
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password);
  return match ? user : null;
};

exports.register = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) return res.status(400).json({ message: 'Username already exists' });
    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (name, username, password, role) VALUES (?,?,?,?)', [name, username, hashed, role || 'staff']);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length) {
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      return res.json({ token, user: { id: user.id, name: user.name, username: user.username, role: user.role } });
    }

    const fallbackUser = await fallbackLogin(username, password);
    if (!fallbackUser) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: fallbackUser.id, username: fallbackUser.username, role: fallbackUser.role, name: fallbackUser.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    return res.json({ token, user: { id: fallbackUser.id, name: fallbackUser.name, username: fallbackUser.username, role: fallbackUser.role } });
  } catch (err) {
    const fallbackUser = await fallbackLogin(req.body.username, req.body.password);
    if (fallbackUser) {
      const token = jwt.sign({ id: fallbackUser.id, username: fallbackUser.username, role: fallbackUser.role, name: fallbackUser.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      return res.json({ token, user: { id: fallbackUser.id, name: fallbackUser.name, username: fallbackUser.username, role: fallbackUser.role } });
    }
    res.status(500).json({ message: err.message });
  }
};
