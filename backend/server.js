require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`Gold Smith Management System running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Trying port ${Number(PORT) + 1}...`);
    server.close();
    app.listen(Number(PORT) + 1, () => {
      console.log(`Gold Smith Management System running on http://localhost:${Number(PORT) + 1}`);
    });
  } else {
    console.error(err);
  }
});
