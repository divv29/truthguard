/**
 * server.js  — TruthGuard Backend
 *
 * Entry point. Registers middleware, routes, and error handlers.
 * Changes from original:
 *   ✅  Added userRoutes  →  /api/users
 */

require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const articleRoutes             = require("./routes/articles");
const userRoutes                = require("./routes/users");          // ← NEW
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:         process.env.FRONTEND_URL || "http://localhost:3000",
    methods:        ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status:    "ok",
    service:   "TruthGuard API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/articles", articleRoutes);
app.use("/api/users",    userRoutes);                                 // ← NEW

// ── 404 + Error handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TruthGuard Backend running on http://localhost:${PORT}`);
  console.log(`   Health check : http://localhost:${PORT}/health`);
  console.log(`   Articles API : http://localhost:${PORT}/api/articles`);
  console.log(`   Users API    : http://localhost:${PORT}/api/users\n`);  // ← NEW
});
