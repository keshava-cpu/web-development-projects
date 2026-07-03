import cors from "cors";
import express from "express";
import helmet from "helmet";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { apiEntries } from "./data.js";
import "dotenv/config";
const app = express();
const port = Number(process.env.PORT ?? 4000);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
const jwtSecret = process.env.JWT_SECRET || "default-secret";
const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "example.com";
const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim());
function verifyToken(request, response, next) {
    const token = request.cookies.auth_token;
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        request.user = decoded;
    }
    catch (error) {
        response.clearCookie("auth_token");
    }
    next();
}
// Danger
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    console.log("env val:", process.env.NODE_ENV);
}
else
    console.log(process.env.NODE_ENV, "production");
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(verifyToken);
app.get("/health", (_request, response) => {
    response.json({
        ok: true,
        service: "rnd-publications-api",
        time: new Date().toISOString(),
    });
});
app.get("/api/auth/me", (request, response) => {
    if (!request.user) {
        response.status(401).json({ error: "not_authenticated" });
        return;
    }
    response.json(request.user);
});
app.post("/api/auth/logout", (_request, response) => {
    response.clearCookie("auth_token");
    response.json({ ok: true });
});
app.get("/api/auth/college-oauth/start", (request, response) => {
    const url = googleClient.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "email", "profile"],
        prompt: "select_account",
    });
    response.json({ url });
});
app.get("/api/auth/google/callback", async (request, response) => {
    const { code } = request.query;
    if (!code) {
        response.status(400).json({ error: "missing_authorization_code" });
        return;
    }
    try {
        // changed here
        const { tokens } = await googleClient.getToken({
            code: code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI ||
                "https://testing-publications-page.onrender.com/api/auth/google/callback",
        });
        googleClient.setCredentials(tokens);
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            response.status(400).json({ error: "invalid_token_payload" });
            return;
        }
        const email = payload.email;
        const emailDomain = email.split("@")[1];
        if (emailDomain !== allowedDomain) {
            // Check if the request was made by a frontend client-side fetch API call
            const isFetchRequest = request.headers["sec-fetch-mode"] === "cors" || request.xhr;
            if (isFetchRequest) {
                return response.status(403).json({
                    error: "invalid_domain",
                    message: `Only ${allowedDomain} email addresses are allowed`,
                });
            }
            // IF A DIRECT BROWSER RELOAD/REDIRECT HITS THIS, SEND THEM TO THE FRONTEND ERROR PAGE NATIVELY
            const frontendUrl = process.env.FRONTEND_URL ||
                "https://testing-publications-page-web.vercel.app";
            return response.redirect(`${frontendUrl}/invalid-domain`);
        }
        const role = adminEmails.includes(email) ? "admin" : "faculty";
        const authPayload = {
            email,
            name: payload.name,
            picture: payload.picture,
            role,
        };
        const token = jwt.sign(authPayload, jwtSecret, { expiresIn: "7d" });
        // removed cookies
        const frontendTarget = process.env.FRONTEND_URL ||
            "https://testing-publications-page-web.vercel.app";
        return response.redirect(`${frontendTarget}/auth-callback?token=${token}`);
    }
    catch (error) {
        console.error("OAuth error:", error);
        const frontendTarget = process.env.FRONTEND_URL ||
            "https://testing-publications-page-web.vercel.app";
        return response.redirect(`${frontendTarget}/?error=oauth_failed`);
    }
});
app.post("/api/auth/finalize-session", (request, response) => {
    const { token } = request.body;
    if (!token) {
        return response.status(400).json({ error: "missing_token" });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        response.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return response.json(decoded);
    }
    catch (error) {
        console.error("Finalize session error:", error);
        return response.status(401).json({ error: "invalid_session_token" });
    }
});
app.get("/api/auth/google/callback/complete.js", (request, response) => {
    const userParam = typeof request.query.user === "string" ? request.query.user : "{}";
    const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
    response.type("application/javascript").send(`
    (function () {
      const message = {
        type: "oauth-success",
        user: ${userParam}
      };

      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(message, ${JSON.stringify(frontendOrigin)});
        }
      } catch (e) {
        // Ignore cross-window messaging errors and still attempt to close.
      }

      setTimeout(function () {
        try {
          // window.close();
        } catch (e) {
          // Ignore close failures.
        }
      }, 3000);
    })();
  `);
});
app.post("/api/auth/manual/start", (_request, response) => {
    response.json({
        message: "Manual verification scaffolded",
        next: "Send college email verification link and create password setup here.",
    });
});
app.post("/api/auth/mock-login", (request, response) => {
    const { email, role, name } = request.body;
    if (!email || !role) {
        response.status(400).json({ error: "missing_email_or_role" });
        return;
    }
    const authPayload = {
        email,
        name: name || email.split("@")[0],
        role: role === "admin" ? "admin" : "faculty",
    };
    const token = jwt.sign(authPayload, jwtSecret, { expiresIn: "7d" });
    response.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    response.json(authPayload);
});
app.get("/api/publications", (_request, response) => {
    response.json({ items: apiEntries });
});
app.post("/api/publications", (request, response) => {
    if (!request.user) {
        console.log("No user Obj Found, un authorized user");
        response.status(401).json({ error: "not_authenticated" });
        return;
    }
    const { id, title, department, owner, contributors, status, summary, latestFile, updatedAt, metrics, versions, timeline, messages, adminNotes, } = request.body;
    if (!id || !title || !department || !owner) {
        response.status(400).json({ error: "missing_required_fields" });
        return;
    }
    const newEntry = {
        id,
        title,
        department,
        owner,
        contributors: contributors || [owner],
        status: status || "draft",
        summary: summary || "",
        latestFile: latestFile || "draft.pdf",
        updatedAt: updatedAt || new Date().toISOString(),
        metrics: metrics || { messageCount: 0, impactPoints: 0 },
        versions: versions || [],
        timeline: timeline || [],
        messages: messages || [],
        adminNotes: adminNotes || [],
    };
    apiEntries.unshift(newEntry);
    response.json({ item: newEntry });
});
app.post("/api/publications/:id/status", (request, response) => {
    if (!request.user) {
        response.status(401).json({ error: "not_authenticated" });
        return;
    }
    const nextStatus = request.body?.status;
    const target = apiEntries.find((entry) => entry.id === request.params.id);
    if (!target || !nextStatus) {
        response
            .status(400)
            .json({ error: "publication_not_found_or_invalid_status" });
        return;
    }
    target.status = nextStatus;
    if (nextStatus === "in_review") {
        target.reviewRequestedAt = new Date().toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    target.updatedAt = new Date().toISOString();
    // If a timeline event is provided, push it!
    const timelineEvent = request.body?.timelineEvent;
    if (timelineEvent) {
        target.timeline = target.timeline || [];
        target.timeline.push(timelineEvent);
    }
    response.json({ item: target });
});
app.post("/api/publications/:id/update", (request, response) => {
    if (!request.user) {
        response.status(401).json({ error: "not_authenticated" });
        return;
    }
    const target = apiEntries.find((entry) => entry.id === request.params.id);
    if (!target) {
        response.status(404).json({ error: "publication_not_found" });
        return;
    }
    // Verify that only the owner can edit
    if (target.owner !== request.user.email) {
        response.status(403).json({
            error: "unauthorized",
            message: "Only the entry owner can edit this publication",
        });
        return;
    }
    // Update allowed fields
    const { title, department, summary, contributors, latestFile, metrics, newVersion, timelineEvent, } = request.body;
    if (title !== undefined)
        target.title = title;
    if (department !== undefined)
        target.department = department;
    if (summary !== undefined)
        target.summary = summary;
    if (contributors !== undefined)
        target.contributors = contributors;
    if (latestFile !== undefined)
        target.latestFile = latestFile;
    if (metrics !== undefined)
        target.metrics = metrics;
    target.updatedAt = new Date().toISOString();
    // If a new version is provided, push it!
    if (newVersion) {
        target.versions = target.versions || [];
        target.versions.push(newVersion);
    }
    // If a timeline event is provided, push it!
    if (timelineEvent) {
        target.timeline = target.timeline || [];
        target.timeline.push(timelineEvent);
    }
    response.json({ item: target });
});
app.listen(port, () => {
    console.log(`R&D publications API running on http://localhost:${port}`);
});
