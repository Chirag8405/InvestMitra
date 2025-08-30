import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo";
import { ensureSchema } from "./db";
import { login, register, me, logout } from "./routes/auth";
import { getPortfolio, placeOrder, getOrders, resetPortfolio, requireUser } from "./routes/trading";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Ensure DB schema (no-op if already created)
  ensureSchema().catch((e) => {
    // eslint-disable-next-line no-console
    console.error("Schema init failed:", e?.message || e);
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", me);
  app.post("/api/auth/logout", logout);

  // Trading (auth required)
  app.get("/api/portfolio", requireUser, getPortfolio);
  app.post("/api/orders", requireUser, placeOrder);
  app.get("/api/orders", requireUser, getOrders);
  app.post("/api/portfolio/reset", requireUser, resetPortfolio);

  return app;
}
