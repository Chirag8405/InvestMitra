import { useState, useEffect, useCallback } from 'react';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  marketCap: number;
  sector: string;
  lastUpdate: number;
}

const NSE_STOCKS: Omit<Stock, 'price' | 'change' | 'changePercent' | 'volume' | 'high' | 'low' | 'open' | 'lastUpdate'>[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', marketCap: 1800000, sector: 'Oil & Gas' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', marketCap: 1500000, sector: 'Information Technology' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', marketCap: 1200000, sector: 'Financial Services' },
  { symbol: 'INFY', name: 'Infosys Ltd', marketCap: 800000, sector: 'Information Technology' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', marketCap: 700000, sector: 'Financial Services' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', marketCap: 600000, sector: 'FMCG' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', marketCap: 400000, sector: 'Construction' },
  { symbol: 'SBIN', name: 'State Bank of India', marketCap: 500000, sector: 'Financial Services' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', marketCap: 450000, sector: 'Telecommunications' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', marketCap: 350000, sector: 'Financial Services' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', marketCap: 300000, sector: 'Consumer Goods' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', marketCap: 250000, sector: 'Information Technology' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', marketCap: 320000, sector: 'Automobile' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', marketCap: 200000, sector: 'Information Technology' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', marketCap: 280000, sector: 'Financial Services' },
];

const BASE_PRICES: Record<string, number> = {
  RELIANCE: 2486.75,
  TCS: 3924.15,
  HDFCBANK: 1634.20,
  INFY: 1789.60,
  ICICIBANK: 1256.40,
  HINDUNILVR: 2387.30,
  LT: 3654.80,
  SBIN: 867.50,
  BHARTIARTL: 1654.30,
  KOTAKBANK: 1735.90,
  ASIANPAINT: 2456.75,
  WIPRO: 298.45,
  MARUTI: 11234.50,
  HCLTECH: 1687.20,
  AXISBANK: 1098.65,
};

const USE_LIVE = import.meta.env.VITE_USE_LIVE_DATA === 'true';

function generateRealisticPrice(basePrice: number, volatility: number = 0.02): {
  price: number;
  change: number;
  changePercent: number;
} {
  const randomFactor = (Math.random() - 0.5) * 2;
  const priceChange = basePrice * volatility * randomFactor;
  const newPrice = basePrice + priceChange;
  const changePercent = (priceChange / basePrice) * 100;
  
  return {
    price: Math.round(newPrice * 100) / 100,
    change: Math.round(priceChange * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
  };
}

async function fetchLiveQuote(symbol: string) {
  const res = await fetch(`/.netlify/functions/market?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.ok) return null;
  return json as { symbol: string; price: number; change: number; changePercent: number; lastUpdate: number };
}

export function useMarketData() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialStocks: Stock[] = NSE_STOCKS.map(stock => {
      const basePrice = BASE_PRICES[stock.symbol] || 1000;
      const priceData = generateRealisticPrice(basePrice, 0.01);
      
      return {
        ...stock,
        ...priceData,
        volume: Math.floor(Math.random() * 1000000) + 50000,
        high: priceData.price * (1 + Math.random() * 0.03),
        low: priceData.price * (1 - Math.random() * 0.03),
        open: priceData.price * (1 + (Math.random() - 0.5) * 0.02),
        lastUpdate: Date.now(),
      };
    });
    setStocks(initialStocks);
    setLoading(false);
    
    const now = new Date();
    const hour = now.getHours();
    setIsMarketOpen(hour >= 9 && hour < 15);
  }, []);

  useEffect(() => {
    if (!isMarketOpen || stocks.length === 0) return;

    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          if (Math.random() > 0.3) return stock;
          
          const basePrice = BASE_PRICES[stock.symbol] || stock.price;
          const priceData = generateRealisticPrice(basePrice, 0.008);
          
          return {
            ...stock,
            ...priceData,
            volume: stock.volume + Math.floor(Math.random() * 10000),
            high: Math.max(stock.high, priceData.price),
            low: Math.min(stock.low, priceData.price),
            lastUpdate: Date.now(),
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isMarketOpen, stocks.length]);

  // Optional live updates via Netlify function and Alpha Vantage
  useEffect(() => {
    let liveInterval: number | undefined;
    if (!USE_LIVE) return;
    const symbols = NSE_STOCKS.slice(0, 5).map(s => s.symbol); // limit to avoid rate limits

    const updateLive = async () => {
      try {
        const updates = await Promise.all(symbols.map(sym => fetchLiveQuote(sym)));
        setStocks(prev => prev.map(s => {
          const live = updates.find(u => u && u.symbol === s.symbol);
          if (!live || !live.price) return s;
          const change = live.price - s.price;
          const changePercent = s.price ? (change / s.price) * 100 : 0;
          return {
            ...s,
            price: Math.round(live.price * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            high: Math.max(s.high, live.price),
            low: Math.min(s.low, live.price),
            lastUpdate: live.lastUpdate,
          };
        }));
      } catch {}
    };

    updateLive();
    liveInterval = window.setInterval(updateLive, 60_000);
    return () => {
      if (liveInterval) window.clearInterval(liveInterval);
    };
  }, []);

  const getStock = useCallback((symbol: string) => {
    return stocks.find(stock => stock.symbol === symbol);
  }, [stocks]);

  const searchStocks = useCallback((query: string) => {
    if (!query.trim()) return stocks;
    
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [stocks]);

  const filterBySector = useCallback((sector: string) => {
    if (sector === 'All') return stocks;
    return stocks.filter(stock => stock.sector === sector);
  }, [stocks]);

  const getSectors = useCallback(() => {
    const sectors = ['All', ...new Set(stocks.map(stock => stock.sector))];
    return sectors;
  }, [stocks]);

  return {
    stocks,
    loading,
    isMarketOpen,
    getStock,
    searchStocks,
    filterBySector,
    getSectors,
  };
}
