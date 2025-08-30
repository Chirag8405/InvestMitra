import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ensureSchema } from "../../server/db";
import { handleDemo } from "../../server/routes/demo";
import { login, register, me, logout } from "../../server/routes/auth";
import { getPortfolio, placeOrder, getOrders, resetPortfolio, requireUser } from "../../server/routes/trading";

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ type: "*/*" }));
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
  const anyReq: any = req as any;
  if (Buffer.isBuffer(anyReq.body)) {
    try { anyReq.body = JSON.parse(anyReq.body.toString("utf8") || "{}"); } catch { anyReq.body = {}; }
  } else if (typeof anyReq.body === "string") {
    try { anyReq.body = JSON.parse(anyReq.body || "{}"); } catch { anyReq.body = {}; }
  }
  next();
});
app.use(cookieParser());

// Ensure DB schema (no-op if already created)
ensureSchema().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Schema init failed:", e?.message || e);
});

// Build API router once
const api = express.Router();

// Example API routes
api.get("/ping", (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "ping";
  res.json({ message: ping });
});

// Echo endpoint for debugging body parsing
api.post("/echo", (req, res) => {
  res.json({ ok: true, headers: req.headers, body: (req as any).body ?? null });
});

// Health/config status (does not expose secrets)
api.get("/health", (_req, res) => {
  res.json({
    ok: true,
    config: {
      jwtConfigured: Boolean(process.env.JWT_SECRET),
      dbConfigured: Boolean(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.NETLIFY_DATABASE_URL || process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL || process.env.PG_CONNECTION_STRING),
    },
  });
});

api.get("/demo", handleDemo);

// Auth
api.post("/auth/register", register);
api.post("/auth/login", login);
api.get("/auth/me", me);
api.post("/auth/logout", logout);

// Trading (auth required)
api.get("/portfolio", requireUser, getPortfolio);
api.post("/orders", requireUser, placeOrder);
api.get("/orders", requireUser, getOrders);
api.post("/portfolio/reset", requireUser, resetPortfolio);

// Mount at both local and Netlify function base paths
app.use("/api", api);
app.use("/.netlify/functions/api", api);

export const handler = serverless(app);
