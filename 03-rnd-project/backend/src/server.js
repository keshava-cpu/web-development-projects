require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from environment — check backend/.env');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from environment — check backend/.env');
}

const app = require('./app');

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`R&D Management API listening on http://localhost:${PORT}/api`);
});
