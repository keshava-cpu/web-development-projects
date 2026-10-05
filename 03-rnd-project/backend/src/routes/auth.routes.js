const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// router.post("/register", authController.register); // Disabled
router.post("/login", authController.login);

router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token');
  res.clearCookie('auth_token_readable'); // Ensure everything is cleaned up
  return res.json({ statusCode: 200, message: 'Logged out successfully.' });
});

module.exports = router;
