require('dotenv').config();
const db = require('./config/db');

async function test() {
  try {
    const [[r]] = await db.query('SELECT COUNT(*) as c FROM orders');
    console.log('DB connected. Orders:', r.c);
    const [[rates]] = await db.query('SELECT * FROM rates LIMIT 1');
    console.log('Rates:', rates);
    process.exit(0);
  } catch (e) {
    console.error('DB ERROR:', e.message);
    process.exit(1);
  }
}
test();
