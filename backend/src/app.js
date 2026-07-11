const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const apiRoutes = require('./routes');
const keshavaRoutes = require('./routes/keshava');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
// Allow popups for Google OAuth (required by keshava Google sign-in flow)
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// ─── Body & Cookie Parsing ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'success', message: 'R&D Management API is running.' });
});

// Vinay routes: /api/login, /api/register, /api/projects, /api/patents, etc.
app.use('/api', apiRoutes);

// Keshava routes: /api/keshava/publications, /api/keshava/auth/*, etc.
app.use('/api/keshava', keshavaRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
