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
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ─── Body & Cookie Parsing ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ─── Keshava cookie-based JWT middleware ──────────────────────────────────────
// This middleware reads the keshava auth_token cookie and attaches the decoded
// user to req.user (if no Bearer token is already set by vinay protect middleware).
// It runs globally so that keshava routes have access to req.user.
// NOTE: The vinay-temp /api routes use their own protect.js middleware per-route.
app.use((req, _res, next) => {
  // If req.user is already set (e.g., by upstream protect middleware), skip.
  if (req.user) return next();

  const token = req.cookies.auth_token;
  if (!token) return next();

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    req.user = jwt.verify(token, jwtSecret);
  } catch {
    // Invalid or expired cookie — ignore, do not clear (let the route handle it)
  }
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'success', message: 'R&D Management API is running.' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
// vinay-temp routes: /api/login, /api/register, /api/projects, etc.
app.use('/api', apiRoutes);

// keshava routes: /api/keshava/publications, /api/keshava/auth/*, etc.
app.use('/api/keshava', keshavaRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
