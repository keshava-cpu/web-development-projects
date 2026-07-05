require('dotenv').config();

const app = require('./app');

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`R&D Management API listening on http://localhost:${PORT}/api`);
});
