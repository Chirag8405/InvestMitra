import { neon } from "@neondatabase/serverless";

// Lazy singleton for SQL client
let _sql: ReturnType<typeof neon> | null = null;

export function getDatabaseUrl() {
  const candidates = [
    "DATABASE_URL",
    "NEON_DATABASE_URL",
    "NETLIFY_DATABASE_URL",
    "NETLIFY_DATABASE_URL_UNPOOLED",
    "POSTGRES_URL",
    "PG_CONNECTION_STRING",
  ] as const;
  for (const key of candidates) {
    const val = process.env[key];
    if (val && typeof val === "string" && val.trim().length > 0) return val.trim();
  }
  return "";
}

export function isDbConfigured() {
  return Boolean(getDatabaseUrl());
}

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("Database connection string not set. Set DATABASE_URL or NEON_DATABASE_URL.");
  }
  if (!_sql) _sql = neon(url);
  return _sql;
}

export async function ensureSchema() {
  const sql = getSql();
  // Users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Portfolio cash per user
  await sql`
    CREATE TABLE IF NOT EXISTS portfolios (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      available_cash NUMERIC NOT NULL DEFAULT 100000,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Positions
  await sql`
    CREATE TABLE IF NOT EXISTS positions (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      avg_price NUMERIC NOT NULL,
      invested_value NUMERIC NOT NULL,
      current_price NUMERIC NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_positions_user_symbol ON positions(user_id, symbol)`;

  // Orders
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      order_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price NUMERIC NOT NULL,
      status TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      brokerage NUMERIC NOT NULL,
      total_amount NUMERIC NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_time ON orders(user_id, timestamp DESC)`;
}
