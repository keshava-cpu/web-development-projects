/**
 * Keshava Auth Routes
 * Migrated from server/src/index.js (ESM → CommonJS).
 * Mounted at: /api/keshava/auth
 *
 * Provides Google OAuth flow and mock-login for the publications tracker feature.
 * NOTE: These are separate from backend's existing /api/login and /api/register endpoints.
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET || 'default-secret';
const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'example.com';
const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

// Lazy-init Google OAuth client so startup doesn't fail if env vars are missing
let googleClient = null;
function getGoogleClient() {
  if (!googleClient) {
    googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }
  return googleClient;
}

/**
 * GET /api/keshava/auth/me
 * Returns current authenticated user from cookie-based session (set by keshava auth flow).
 * Also accepts the Bearer token set by vinay-temp login (req.user populated by protect middleware upstream).
 */
router.get('/me', (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'not_authenticated' });
    return;
  }
  res.json(req.user);
});

/**
 * POST /api/keshava/auth/logout
 * Clears the keshava auth cookie.
 */
router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token');
  res.json({ ok: true });
});

/**
 * GET /api/keshava/auth/college-oauth/start
 * Initiates Google OAuth flow and returns the redirect URL.
 */
router.get('/college-oauth/start', (req, res) => {
  const client = getGoogleClient();
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
  res.json({ url });
});

/**
 * GET /api/keshava/auth/google/callback
 * Handles Google OAuth callback. Exchanges auth code for tokens and redirects to frontend.
 */
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  const frontendTarget =
    process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    res.status(400).json({ error: 'missing_authorization_code' });
    return;
  }

  try {
    const client = getGoogleClient();
    const { tokens } = await client.getToken({
      code: code,
      redirect_uri:
        process.env.GOOGLE_REDIRECT_URI ||
        'http://localhost:5000/api/keshava/auth/google/callback',
    });
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'invalid_token_payload' });
      return;
    }

    const email = payload.email;
    const emailDomain = email.split('@')[1];

    if (emailDomain !== allowedDomain) {
      const isFetchRequest =
        req.headers['sec-fetch-mode'] === 'cors' || req.xhr;
      if (isFetchRequest) {
        return res.status(403).json({
          error: 'invalid_domain',
          message: `Only ${allowedDomain} email addresses are allowed`,
        });
      }
      return res.redirect(`${frontendTarget}/publications-tracker/invalid-domain`);
    }

    const role = adminEmails.includes(email) ? 'admin' : 'faculty';
    const authPayload = {
      email,
      name: payload.name,
      picture: payload.picture,
      role,
    };

    const token = jwt.sign(authPayload, jwtSecret, { expiresIn: '7d' });
    return res.redirect(
      `${frontendTarget}/publications-tracker/auth-callback?token=${token}`
    );
  } catch (error) {
    console.error('Keshava OAuth error:', error);
    return res.redirect(`${frontendTarget}/?error=oauth_failed`);
  }
});

/**
 * POST /api/keshava/auth/finalize-session
 * Receives a temp token and sets it as an HTTP-only cookie.
 */
router.post('/finalize-session', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'missing_token' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json(decoded);
  } catch (error) {
    console.error('Finalize session error:', error);
    return res.status(401).json({ error: 'invalid_session_token' });
  }
});

/**
 * POST /api/keshava/auth/mock-login
 * Mock login endpoint for development/testing without Google OAuth.
 */
router.post('/mock-login', (req, res) => {
  const { email, role, name } = req.body;
  if (!email || !role) {
    res.status(400).json({ error: 'missing_email_or_role' });
    return;
  }

  const authPayload = {
    email,
    name: name || email.split('@')[0],
    role: role === 'admin' ? 'admin' : 'faculty',
  };

  const token = jwt.sign(authPayload, jwtSecret, { expiresIn: '7d' });
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json(authPayload);
});

module.exports = router;
