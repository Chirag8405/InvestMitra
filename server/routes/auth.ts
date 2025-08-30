import type { RequestHandler } from "express";
import { z } from "zod";
import { getSql, isDbConfigured } from "../db";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";

const EMAIL_MIN = 5;
const PASSWORD_MIN = 8;
const TOKEN_NAME = "auth_token";

const registerSchema = z.object({
  email: z.string().min(EMAIL_MIN).email(),
  password: z.string().min(PASSWORD_MIN),
});

const loginSchema = registerSchema;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

function isJwtConfigured() { return Boolean(process.env.JWT_SECRET); }

export const register: RequestHandler = async (req, res) => {
  try {
    if (!isDbConfigured()) return res.status(200).json({ ok: false, error: "db_not_configured" });
    if (!isJwtConfigured()) return res.status(200).json({ ok: false, error: "jwt_not_configured" });
    const raw: any = (req as any).body;
    let input: any = raw ?? {};
    if (Buffer.isBuffer(raw)) { try { input = JSON.parse(raw.toString("utf8") || "{}"); } catch { input = {}; } }
    else if (typeof raw === "string") { try { input = JSON.parse(raw || "{}"); } catch { input = {}; } }
    const body = registerSchema.parse(input);
    const sql = getSql();

    const existing = (await sql`SELECT id FROM users WHERE email = ${body.email}`) as any[];
    if (Array.isArray(existing) && existing.length > 0) return res.status(409).json({ ok: false, error: "email_in_use" });

    const userId = randomUUID();
    const password_hash = await bcrypt.hash(body.password, 10);
    await sql`
      INSERT INTO users (id, email, password_hash)
      VALUES (${userId}, ${body.email}, ${password_hash})
      ON CONFLICT (email) DO NOTHING
    `;

    // create default portfolio row
    const portfolioId = randomUUID();
    await sql`INSERT INTO portfolios (id, user_id) VALUES (${portfolioId}, ${userId}) ON CONFLICT DO NOTHING`;

    const token = await new SignJWT({ uid: userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(getJwtSecret());

    res.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ ok: true, user: { id: userId, email: body.email } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, error: "bad_request", issues: err.issues });
    res.status(500).json({ ok: false, error: "server_error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    if (!isDbConfigured()) return res.status(200).json({ ok: false, error: "db_not_configured" });
    if (!isJwtConfigured()) return res.status(200).json({ ok: false, error: "jwt_not_configured" });
    const raw: any = (req as any).body;
    let input: any = raw ?? {};
    if (Buffer.isBuffer(raw)) { try { input = JSON.parse(raw.toString("utf8") || "{}"); } catch { input = {}; } }
    else if (typeof raw === "string") { try { input = JSON.parse(raw || "{}"); } catch { input = {}; } }
    const body = loginSchema.parse(input);
    const sql = getSql();

    const users = (await sql`
      SELECT id, password_hash FROM users WHERE email = ${body.email}
    `) as any[];
    if (users.length === 0) return res.status(401).json({ ok: false, error: "invalid_credentials" });

    const user = users[0];
    const ok = await bcrypt.compare(body.password, user.password_hash);
    if (!ok) return res.status(401).json({ ok: false, error: "invalid_credentials" });

    const token = await new SignJWT({ uid: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(getJwtSecret());

    res.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ ok: true, user: { id: user.id, email: body.email } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, error: "bad_request", issues: err.issues });
    res.status(500).json({ ok: false, error: "server_error" });
  }
};

export const me: RequestHandler = async (req, res) => {
  try {
    if (!isJwtConfigured()) return res.status(401).json({ ok: false, error: "jwt_not_configured" });
    const token = req.cookies?.[TOKEN_NAME];
    if (!token) return res.status(401).json({ ok: false });

    const { payload } = await jwtVerify(token, getJwtSecret());
    const uid = (payload as any).uid as string;
    const sql = getSql();
    const users = (await sql`SELECT email FROM users WHERE id = ${uid}`) as any[];
    if (users.length === 0) return res.status(401).json({ ok: false });
    res.json({ ok: true, user: { id: uid, email: users[0].email } });
  } catch {
    res.status(401).json({ ok: false });
  }
};

export const logout: RequestHandler = async (_req, res) => {
  res.clearCookie(TOKEN_NAME, { path: "/" });
  res.json({ ok: true });
};

export async function requireUser(req: any, res: any, next: any) {
  try {
    if (!isJwtConfigured()) return res.status(401).json({ ok: false, error: "jwt_not_configured" });
    const token = req.cookies?.[TOKEN_NAME];
    if (!token) return res.status(401).json({ ok: false, error: "unauthorized" });
    const { payload } = await jwtVerify(token, getJwtSecret());
    req.userId = (payload as any).uid as string;
    next();
  } catch {
    res.status(401).json({ ok: false, error: "unauthorized" });
  }
}
