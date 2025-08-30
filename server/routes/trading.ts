import type { RequestHandler } from "express";
import { z } from "zod";
import { getSql } from "../db";
import { requireUser } from "./auth";
import { randomUUID } from "crypto";

const INITIAL_CASH = 100000;
const BROKERAGE_RATE = 0.0003; // 0.03%
const MIN_BROKERAGE = 20;

function calculateBrokerage(amount: number) {
  const calculated = amount * BROKERAGE_RATE;
  return Math.max(calculated, MIN_BROKERAGE);
}

export const getPortfolio: RequestHandler = async (req: any, res) => {
  const sql = getSql();
  const userId = req.userId as string;
  const cashRows = (await sql`
    SELECT available_cash FROM portfolios WHERE user_id = ${userId}
  `) as any[];
  let availableCash = cashRows[0]?.available_cash ? Number(cashRows[0].available_cash) : INITIAL_CASH;

  if (cashRows.length === 0) {
    await sql`INSERT INTO portfolios (id, user_id, available_cash) VALUES (${randomUUID()}, ${userId}, ${INITIAL_CASH})`;
    availableCash = INITIAL_CASH;
  }

  const positions = (await sql`
    SELECT id, symbol, name, quantity, avg_price, invested_value, current_price, updated_at
    FROM positions WHERE user_id = ${userId}
  `) as any[];

  const orders = (await sql`
    SELECT id, symbol, name, type, order_type as orderType, quantity, price, status, timestamp, brokerage, total_amount as totalAmount
    FROM orders WHERE user_id = ${userId} ORDER BY timestamp DESC LIMIT 50
  `) as any[];

  const investedAmount = positions.reduce((s, p) => s + Number(p.invested_value), 0);
  const totalCurrent = positions.reduce((s, p) => s + Number(p.current_price) * Number(p.quantity), 0);
  const totalPnL = totalCurrent - investedAmount;
  const totalPnLPercent = investedAmount > 0 ? (totalPnL / investedAmount) * 100 : 0;

  res.json({
    ok: true,
    portfolio: {
      totalValue: availableCash + totalCurrent,
      investedAmount,
      availableCash,
      totalPnL,
      totalPnLPercent,
      todaysPnL: totalPnL * 0.1,
      todaysPnLPercent: totalPnLPercent * 0.1,
      positions: positions.map((p) => ({
        symbol: p.symbol,
        name: p.name,
        quantity: Number(p.quantity),
        avgPrice: Number(p.avg_price),
        currentPrice: Number(p.current_price),
        investedValue: Number(p.invested_value),
        currentValue: Number(p.current_price) * Number(p.quantity),
        pnl: Number(p.current_price) * Number(p.quantity) - Number(p.invested_value),
        pnlPercent:
          Number(p.invested_value) > 0
            ? ((Number(p.current_price) * Number(p.quantity) - Number(p.invested_value)) / Number(p.invested_value)) * 100
            : 0,
      })),
      orders,
    },
  });
};

const placeOrderSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["BUY", "SELL"]),
  orderType: z.enum(["MARKET", "LIMIT"]).default("MARKET"),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

export const placeOrder: RequestHandler = async (req: any, res) => {
  try {
    const body = placeOrderSchema.parse(req.body);
    const sql = getSql();
    const userId = req.userId as string;

    const cashRows = (await sql`SELECT available_cash FROM portfolios WHERE user_id = ${userId}`) as any[];
    let availableCash = cashRows[0]?.available_cash ? Number(cashRows[0].available_cash) : INITIAL_CASH;
    if (cashRows.length === 0) {
      await sql`INSERT INTO portfolios (id, user_id, available_cash) VALUES (${randomUUID()}, ${userId}, ${INITIAL_CASH})`;
      availableCash = INITIAL_CASH;
    }

    const grossAmount = body.quantity * body.price;
    const brokerage = calculateBrokerage(grossAmount);

    if (body.type === "BUY") {
      const totalAmount = grossAmount + brokerage;
      if (totalAmount > availableCash) return res.status(400).json({ ok: false, error: "insufficient_funds" });

      // Upsert position
      const existing = (await sql`SELECT * FROM positions WHERE user_id = ${userId} AND symbol = ${body.symbol}`) as any[];
      if (existing.length > 0) {
        const pos = existing[0];
        const newQty = Number(pos.quantity) + body.quantity;
        const newInvested = Number(pos.invested_value) + grossAmount;
        const newAvg = newInvested / newQty;
        const newCurrent = body.price; // use last trade price as current
        await sql`
          UPDATE positions
          SET quantity = ${newQty}, invested_value = ${newInvested}, avg_price = ${newAvg}, current_price = ${newCurrent}, updated_at = now()
          WHERE id = ${pos.id}
        `;
      } else {
        await sql`
          INSERT INTO positions (id, user_id, symbol, name, quantity, avg_price, invested_value, current_price)
          VALUES (${randomUUID()}, ${userId}, ${body.symbol}, ${body.name}, ${body.quantity}, ${body.price}, ${grossAmount}, ${body.price})
        `;
      }

      await sql`UPDATE portfolios SET available_cash = ${availableCash - totalAmount} WHERE user_id = ${userId}`;

      const orderId = randomUUID();
      await sql`
        INSERT INTO orders (id, user_id, symbol, name, type, order_type, quantity, price, status, timestamp, brokerage, total_amount)
        VALUES (${orderId}, ${userId}, ${body.symbol}, ${body.name}, ${body.type}, ${body.orderType}, ${body.quantity}, ${body.price}, 'EXECUTED', now(), ${brokerage}, ${grossAmount + brokerage})
      `;

      return res.json({ ok: true });
    } else {
      // SELL
      const existing = (await sql`SELECT * FROM positions WHERE user_id = ${userId} AND symbol = ${body.symbol}`) as any[];
      if (existing.length === 0 || Number(existing[0].quantity) < body.quantity) {
        return res.status(400).json({ ok: false, error: "insufficient_shares" });
      }

      const pos = existing[0];
      const newQty = Number(pos.quantity) - body.quantity;
      const sellGross = grossAmount;
      const sellBrokerage = brokerage;
      const netProceeds = sellGross - sellBrokerage;

      if (newQty === 0) {
        await sql`DELETE FROM positions WHERE id = ${pos.id}`;
      } else {
        const soldInvested = (body.quantity / Number(pos.quantity)) * Number(pos.invested_value);
        const remainingInvested = Number(pos.invested_value) - soldInvested;
        await sql`
          UPDATE positions
          SET quantity = ${newQty}, invested_value = ${remainingInvested}, current_price = ${body.price}, updated_at = now()
          WHERE id = ${pos.id}
        `;
      }

      await sql`UPDATE portfolios SET available_cash = ${availableCash + netProceeds} WHERE user_id = ${userId}`;

      const orderId = randomUUID();
      await sql`
        INSERT INTO orders (id, user_id, symbol, name, type, order_type, quantity, price, status, timestamp, brokerage, total_amount)
        VALUES (${orderId}, ${userId}, ${body.symbol}, ${body.name}, ${body.type}, ${body.orderType}, ${body.quantity}, ${body.price}, 'EXECUTED', now(), ${sellBrokerage}, ${netProceeds})
      `;

      return res.json({ ok: true });
    }
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ ok: false, error: "bad_request" });
    res.status(500).json({ ok: false, error: "server_error" });
  }
};

export const getOrders: RequestHandler = async (req: any, res) => {
  const sql = getSql();
  const userId = req.userId as string;
  const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 100);
  const orders = (await sql`
    SELECT id, symbol, name, type, order_type as orderType, quantity, price, status, timestamp, brokerage, total_amount as totalAmount
    FROM orders WHERE user_id = ${userId} ORDER BY timestamp DESC LIMIT ${limit}
  `) as any[];
  res.json({ ok: true, orders });
};

export const resetPortfolio: RequestHandler = async (req: any, res) => {
  const sql = getSql();
  const userId = req.userId as string;
  await sql`DELETE FROM positions WHERE user_id = ${userId}`;
  await sql`DELETE FROM orders WHERE user_id = ${userId}`;
  await sql`UPDATE portfolios SET available_cash = ${INITIAL_CASH} WHERE user_id = ${userId}`;
  res.json({ ok: true });
};

export { requireUser };
