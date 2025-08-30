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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
