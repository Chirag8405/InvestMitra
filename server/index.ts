import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo";
import { ensureSchema, isDbConfigured } from "./db";
import { login, register, me, logout } from "./routes/auth";
import { getPortfolio, placeOrder, getOrders, resetPortfolio, requireUser } from "./routes/trading";

export function createServer() {
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

  // Ensure DB schema once and block first request until ready
  let schemaReady: Promise<void> | null = null;
  async function ensureSchemaOnce() {
    if (!schemaReady) schemaReady = ensureSchema().catch((e) => { schemaReady = null; throw e; });
    return schemaReady;
  }
  app.use(async (_req, _res, next) => {
    try {
      if (isDbConfigured()) await ensureSchemaOnce();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("Schema init failed:", e?.message || e);
    }
    next();
  });

  // Build API router once
  const api = express.Router();

  // Example API routes
  api.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  api.get("/demo", handleDemo);

  // Echo endpoint for debugging body parsing
  api.post("/echo", (req, res) => {
    res.json({ ok: true, headers: req.headers, body: (req as any).body ?? null });
  });

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

  return app;
}
