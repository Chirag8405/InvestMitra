import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Stock } from './use-market-data';

export interface Position {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export interface Order {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  timestamp: number;
  brokerage: number;
  totalAmount: number;
}

export interface Portfolio {
  totalValue: number;
  investedAmount: number;
  availableCash: number;
  totalPnL: number;
  totalPnLPercent: number;
  todaysPnL: number;
  todaysPnLPercent: number;
  positions: Position[];
  orders: Order[];
}

const INITIAL_CASH = 100000; // ₹1,00,000
const BROKERAGE_RATE = 0.0003; // 0.03% brokerage
const MIN_BROKERAGE = 20; // Minimum ₹20 brokerage
const STORAGE_KEY = 'InvestMitra_portfolio_v1';

interface TradingContextValue {
  portfolio: Portfolio;
  placeOrder: (
    stock: Stock,
    type: 'BUY' | 'SELL',
    quantity: number,
    orderType?: 'MARKET' | 'LIMIT',
    limitPrice?: number
  ) => { success: boolean; message: string; orderId?: string };
  getPosition: (symbol: string) => Position | undefined;
  getOrderHistory: (limit?: number) => Order[];
  updatePortfolioWithCurrentPrices: (stocks: Stock[]) => void;
  calculateBrokerage: (amount: number) => number;
  resetPortfolio: () => void;
}

const TradingContext = createContext<TradingContextValue | undefined>(undefined);

function loadPortfolio(): Portfolio {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Portfolio;
      return {
        totalValue: parsed.totalValue ?? INITIAL_CASH,
        investedAmount: parsed.investedAmount ?? 0,
        availableCash: parsed.availableCash ?? INITIAL_CASH,
        totalPnL: parsed.totalPnL ?? 0,
        totalPnLPercent: parsed.totalPnLPercent ?? 0,
        todaysPnL: parsed.todaysPnL ?? 0,
        todaysPnLPercent: parsed.todaysPnLPercent ?? 0,
        positions: Array.isArray(parsed.positions) ? parsed.positions : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      };
    }
  } catch {}
  return {
    totalValue: INITIAL_CASH,
    investedAmount: 0,
    availableCash: INITIAL_CASH,
    totalPnL: 0,
    totalPnLPercent: 0,
    todaysPnL: 0,
    todaysPnLPercent: 0,
    positions: [],
    orders: [],
  };
}

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [portfolio, setPortfolio] = useState<Portfolio>(() => loadPortfolio());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch {}
  }, [portfolio]);

  const calculateBrokerage = useCallback((amount: number): number => {
    const calculated = amount * BROKERAGE_RATE;
    return Math.max(calculated, MIN_BROKERAGE);
  }, []);

  const updatePortfolioWithCurrentPrices = useCallback((stocks: Stock[]) => {
    setPortfolio(prev => {
      const updatedPositions = prev.positions.map(position => {
        const currentStock = stocks.find(stock => stock.symbol === position.symbol);
        if (!currentStock) return position;

        const currentValue = position.quantity * currentStock.price;
        const pnl = currentValue - position.investedValue;
        const pnlPercent = position.investedValue > 0 ? (pnl / position.investedValue) * 100 : 0;

        return {
          ...position,
          currentPrice: currentStock.price,
          currentValue,
          pnl,
          pnlPercent,
        };
      });

      const totalInvested = updatedPositions.reduce((sum, pos) => sum + pos.investedValue, 0);
      const totalCurrent = updatedPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
      const totalPnL = totalCurrent - totalInvested;
      const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      return {
        ...prev,
        positions: updatedPositions,
        investedAmount: totalInvested,
        totalValue: totalCurrent + prev.availableCash,
        totalPnL,
        totalPnLPercent,
        todaysPnL: totalPnL * 0.1,
        todaysPnLPercent: totalPnLPercent * 0.1,
      };
    });
  }, []);

  const placeOrder = useCallback((
    stock: Stock,
    type: 'BUY' | 'SELL',
    quantity: number,
    orderType: 'MARKET' | 'LIMIT' = 'MARKET',
    limitPrice?: number
  ): { success: boolean; message: string; orderId?: string } => {
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      return { success: false, message: 'Quantity must be a positive whole number' };
    }

    const price = orderType === 'MARKET' ? stock.price : (limitPrice || stock.price);
    if (orderType === 'LIMIT' && (!limitPrice || limitPrice <= 0)) {
      return { success: false, message: 'Limit price must be a positive number' };
    }

    const grossAmount = quantity * price;
    const brokerage = calculateBrokerage(grossAmount);

    const orderId = `ORD${Date.now()}${Math.random().toString(36).slice(2, 7)}`;

    if (type === 'BUY') {
      const totalAmount = grossAmount + brokerage;
      if (totalAmount > portfolio.availableCash) {
        return {
          success: false,
          message: `Insufficient funds. Required: ₹${totalAmount.toFixed(2)}, Available: ₹${portfolio.availableCash.toFixed(2)}`
        };
      }

      const newOrder: Order = {
        id: orderId,
        symbol: stock.symbol,
        name: stock.name,
        type,
        orderType,
        quantity,
        price,
        status: 'EXECUTED',
        timestamp: Date.now(),
        brokerage,
        totalAmount,
      };

      setPortfolio(prev => {
        const existingPositionIndex = prev.positions.findIndex(pos => pos.symbol === stock.symbol);
        let updatedPositions = [...prev.positions];

        if (existingPositionIndex >= 0) {
          const existingPosition = prev.positions[existingPositionIndex];
          const newTotalQuantity = existingPosition.quantity + quantity;
          const newTotalInvested = existingPosition.investedValue + grossAmount;
          const newAvgPrice = newTotalInvested / newTotalQuantity;

          updatedPositions[existingPositionIndex] = {
            ...existingPosition,
            quantity: newTotalQuantity,
            avgPrice: newAvgPrice,
            investedValue: newTotalInvested,
            currentPrice: stock.price,
            currentValue: newTotalQuantity * stock.price,
            pnl: (newTotalQuantity * stock.price) - newTotalInvested,
            pnlPercent: newTotalInvested > 0 ? (((newTotalQuantity * stock.price) - newTotalInvested) / newTotalInvested) * 100 : 0,
          };
        } else {
          const newPosition: Position = {
            symbol: stock.symbol,
            name: stock.name,
            quantity,
            avgPrice: price,
            currentPrice: stock.price,
            investedValue: grossAmount,
            currentValue: quantity * stock.price,
            pnl: (quantity * stock.price) - grossAmount,
            pnlPercent: grossAmount > 0 ? (((quantity * stock.price) - grossAmount) / grossAmount) * 100 : 0,
          };
          updatedPositions.push(newPosition);
        }

        return {
          ...prev,
          availableCash: prev.availableCash - totalAmount,
          positions: updatedPositions,
          orders: [newOrder, ...prev.orders],
        };
      });

      return {
        success: true,
        message: `Buy order executed successfully! Purchased ${quantity} shares of ${stock.symbol} at ₹${price.toFixed(2)}`,
        orderId,
      };

    } else {
      const existingPosition = portfolio.positions.find(pos => pos.symbol === stock.symbol);
      if (!existingPosition || existingPosition.quantity < quantity) {
        return {
          success: false,
          message: `Insufficient shares. Available: ${existingPosition?.quantity || 0}, Required: ${quantity}`
        };
      }

      const sellAmount = grossAmountAfterSell(quantity, price, calculateBrokerage);
      const newOrder: Order = {
        id: orderId,
        symbol: stock.symbol,
        name: stock.name,
        type,
        orderType,
        quantity,
        price,
        status: 'EXECUTED',
        timestamp: Date.now(),
        brokerage: calculateBrokerage(quantity * price),
        totalAmount: sellAmount,
      };

      setPortfolio(prev => {
        const updatedPositions = prev.positions.map(pos => {
          if (pos.symbol === stock.symbol) {
            const newQuantity = pos.quantity - quantity;
            if (newQuantity === 0) {
              return null as unknown as Position;
            }

            const soldInvestedValue = (quantity / pos.quantity) * pos.investedValue;
            const remainingInvestedValue = pos.investedValue - soldInvestedValue;

            return {
              ...pos,
              quantity: newQuantity,
              investedValue: remainingInvestedValue,
              currentPrice: stock.price,
              currentValue: newQuantity * stock.price,
              pnl: (newQuantity * stock.price) - remainingInvestedValue,
              pnlPercent: remainingInvestedValue > 0 ? (((newQuantity * stock.price) - remainingInvestedValue) / remainingInvestedValue) * 100 : 0,
            };
          }
          return pos;
        }).filter(Boolean) as Position[];

        return {
          ...prev,
          availableCash: prev.availableCash + sellAmount,
          positions: updatedPositions,
          orders: [newOrder, ...prev.orders],
        };
      });

      return {
        success: true,
        message: `Sell order executed successfully! Sold ${quantity} shares of ${stock.symbol} at ₹${price.toFixed(2)}`,
        orderId,
      };
    }
  }, [portfolio.availableCash, portfolio.positions, calculateBrokerage]);

  const getPosition = useCallback((symbol: string) => {
    return portfolio.positions.find(pos => pos.symbol === symbol);
  }, [portfolio.positions]);

  const getOrderHistory = useCallback((limit: number = 10) => {
    return portfolio.orders.slice(0, limit);
  }, [portfolio.orders]);

  const resetPortfolio = useCallback(() => {
    setPortfolio({
      totalValue: INITIAL_CASH,
      investedAmount: 0,
      availableCash: INITIAL_CASH,
      totalPnL: 0,
      totalPnLPercent: 0,
      todaysPnL: 0,
      todaysPnLPercent: 0,
      positions: [],
      orders: [],
    });
  }, []);

  const value = useMemo<TradingContextValue>(() => ({
    portfolio,
    placeOrder,
    getPosition,
    getOrderHistory,
    updatePortfolioWithCurrentPrices,
    calculateBrokerage,
    resetPortfolio,
  }), [portfolio, placeOrder, getPosition, getOrderHistory, updatePortfolioWithCurrentPrices, calculateBrokerage, resetPortfolio]);

  return (
    <TradingContext.Provider value={value}>{children}</TradingContext.Provider>
  );
}

function grossAmountAfterSell(quantity: number, price: number, calcBrokerage: (amount: number) => number) {
  const gross = quantity * price;
  const brokerage = calcBrokerage(gross);
  return gross - brokerage;
}

export function useTrading() {
  const ctx = useContext(TradingContext);
  if (!ctx) throw new Error('useTrading must be used within TradingProvider');
  return ctx;
}
