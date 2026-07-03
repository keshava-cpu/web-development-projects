import { OAuth2Client } from "google-auth-library";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
dotenv.config();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(s => s.trim()).filter(Boolean);
const JWT_SECRET = process.env.JWT_SECRET;
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const app = express();
app.use(cookieParser());
app.get("/api/auth/google/start", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "email", "profile"]
    });
    res.redirect(url);
});
