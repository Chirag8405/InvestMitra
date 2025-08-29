import { useState, useEffect, useCallback } from 'react';
import { Stock } from './use-market-data';
import { Portfolio, Position, Order } from './use-trading';

export interface Insight {
  id: string;
  type: 'RECOMMENDATION' | 'RISK_ALERT' | 'MARKET_ANALYSIS' | 'PERFORMANCE' | 'EDUCATIONAL';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  action?: string;
  stockSymbol?: string;
  timestamp: number;
  category: string;
  confidence: number; // 0-100
}

export interface StockRecommendation {
  symbol: string;
  name: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  reasoning: string;
  timeHorizon: 'SHORT' | 'MEDIUM' | 'LONG';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RiskAssessment {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  diversificationScore: number; // 0-100
  volatilityRisk: number; // 0-100
  concentrationRisk: number; // 0-100
  sectorRisks: { sector: string; exposure: number; risk: string }[];
  recommendations: string[];
}

export interface PerformanceAnalysis {
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  avgGain: number;
  avgLoss: number;
  profitFactor: number;
  bestTrade: { symbol: string; pnl: number };
  worstTrade: { symbol: string; pnl: number };
  tradingFrequency: 'LOW' | 'MEDIUM' | 'HIGH';
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

export function useAIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate realistic AI insights based on portfolio and market data
  const generateInsights = useCallback((
    portfolio: Portfolio,
    stocks: Stock[],
    recentTrades: Order[]
  ) => {
    setLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const newInsights: Insight[] = [];
      
      // Portfolio Diversification Analysis
      if (portfolio.positions.length > 0) {
        const sectorExposure = calculateSectorExposure(portfolio.positions);
        const topSector = Object.entries(sectorExposure).sort(([,a], [,b]) => b - a)[0];
        
        if (topSector && topSector[1] > 40) {
          newInsights.push({
            id: `diversification-${Date.now()}`,
            type: 'RISK_ALERT',
            priority: 'HIGH',
            title: 'Portfolio Concentration Risk',
            description: `Your portfolio is heavily concentrated in ${topSector[0]} sector (${topSector[1].toFixed(1)}%). Consider diversifying to reduce risk.`,
            action: 'Explore stocks in other sectors',
            timestamp: Date.now(),
            category: 'Risk Management',
            confidence: 85,
          });
        }
      }

      // Cash Position Analysis
      const cashPercentage = (portfolio.availableCash / portfolio.totalValue) * 100;
      if (cashPercentage > 20) {
        newInsights.push({
          id: `cash-${Date.now()}`,
          type: 'RECOMMENDATION',
          priority: 'MEDIUM',
          title: 'High Cash Position',
          description: `You have ${cashPercentage.toFixed(1)}% cash. Consider investing in fundamentally strong stocks to generate returns.`,
          action: 'Explore investment opportunities',
          timestamp: Date.now(),
          category: 'Portfolio Optimization',
          confidence: 75,
        });
      }

      // Market Analysis Based on Stock Performance
      const strongPerformers = stocks.filter(stock => stock.changePercent > 2);
      const weakPerformers = stocks.filter(stock => stock.changePercent < -2);
      
      if (strongPerformers.length > 0) {
        const topPerformer = strongPerformers.sort((a, b) => b.changePercent - a.changePercent)[0];
        newInsights.push({
          id: `market-strong-${Date.now()}`,
          type: 'MARKET_ANALYSIS',
          priority: 'MEDIUM',
          title: 'Strong Market Momentum',
          description: `${topPerformer.symbol} is showing strong momentum (+${topPerformer.changePercent}%). ${topPerformer.sector} sector appears bullish.`,
          stockSymbol: topPerformer.symbol,
          timestamp: Date.now(),
          category: 'Market Trends',
          confidence: 80,
        });
      }

      // Position-specific insights
      portfolio.positions.forEach(position => {
        if (position.pnlPercent < -10) {
          newInsights.push({
            id: `position-loss-${position.symbol}-${Date.now()}`,
            type: 'RISK_ALERT',
            priority: 'HIGH',
            title: `${position.symbol} Underperforming`,
            description: `${position.symbol} is down ${Math.abs(position.pnlPercent).toFixed(1)}%. Consider reviewing your investment thesis or setting a stop-loss.`,
            action: 'Review position',
            stockSymbol: position.symbol,
            timestamp: Date.now(),
            category: 'Position Management',
            confidence: 70,
          });
        } else if (position.pnlPercent > 15) {
          newInsights.push({
            id: `position-gain-${position.symbol}-${Date.now()}`,
            type: 'RECOMMENDATION',
            priority: 'MEDIUM',
            title: `${position.symbol} Strong Gains`,
            description: `${position.symbol} is up ${position.pnlPercent.toFixed(1)}%. Consider booking partial profits or trailing stop-loss.`,
            action: 'Consider profit booking',
            stockSymbol: position.symbol,
            timestamp: Date.now(),
            category: 'Profit Taking',
            confidence: 75,
          });
        }
      });

      // Trading Pattern Analysis
      if (recentTrades.length >= 5) {
        const buyTrades = recentTrades.filter(trade => trade.type === 'BUY').length;
        const sellTrades = recentTrades.filter(trade => trade.type === 'SELL').length;
        
        if (buyTrades > sellTrades * 3) {
          newInsights.push({
            id: `trading-pattern-${Date.now()}`,
            type: 'EDUCATIONAL',
            priority: 'LOW',
            title: 'Buying Pattern Detected',
            description: 'You\'ve been primarily buying stocks. Remember to book profits periodically and maintain portfolio balance.',
            timestamp: Date.now(),
            category: 'Trading Behavior',
            confidence: 65,
          });
        }
      }

      // Educational Insights
      if (portfolio.positions.length < 3) {
        newInsights.push({
          id: `education-diversification-${Date.now()}`,
          type: 'EDUCATIONAL',
          priority: 'LOW',
          title: 'Diversification Benefits',
          description: 'Consider building a diversified portfolio with 5-8 stocks across different sectors to reduce risk.',
          action: 'Learn about diversification',
          timestamp: Date.now(),
          category: 'Investment Education',
          confidence: 90,
        });
      }

      setInsights(newInsights);
      setLoading(false);
    }, 1000);
  }, []);

  // Generate stock recommendations
  const generateRecommendations = useCallback((stocks: Stock[], portfolio: Portfolio) => {
    const newRecommendations: StockRecommendation[] = [];
    
    // Find stocks with strong momentum
    const momentumStocks = stocks
      .filter(stock => stock.changePercent > 1 && stock.volume > 100000)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 3);
    
    momentumStocks.forEach(stock => {
      newRecommendations.push({
        symbol: stock.symbol,
        name: stock.name,
        action: 'BUY',
        confidence: Math.min(75 + stock.changePercent * 2, 95),
        targetPrice: stock.price * 1.05,
        reasoning: `Strong momentum with ${stock.changePercent}% gain and high volume. Technical indicators suggest continued uptrend.`,
        timeHorizon: 'SHORT',
        riskLevel: 'MEDIUM',
      });
    });

    // Find undervalued stocks (simulated)
    const undervaluedStocks = stocks
      .filter(stock => stock.changePercent < 0 && stock.changePercent > -3)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 2);
    
    undervaluedStocks.forEach(stock => {
      newRecommendations.push({
        symbol: stock.symbol,
        name: stock.name,
        action: 'BUY',
        confidence: 60 + Math.abs(stock.changePercent) * 5,
        targetPrice: stock.price * 1.08,
        reasoning: `Temporary dip of ${Math.abs(stock.changePercent)}% presents buying opportunity. Strong fundamentals suggest recovery.`,
        timeHorizon: 'MEDIUM',
        riskLevel: 'LOW',
      });
    });

    // Recommendations for existing positions
    portfolio.positions.forEach(position => {
      const currentStock = stocks.find(s => s.symbol === position.symbol);
      if (!currentStock) return;

      if (position.pnlPercent > 20) {
        newRecommendations.push({
          symbol: position.symbol,
          name: position.name,
          action: 'SELL',
          confidence: 70,
          targetPrice: currentStock.price * 0.95,
          reasoning: `Strong gains of ${position.pnlPercent.toFixed(1)}%. Consider partial profit booking to lock in gains.`,
          timeHorizon: 'SHORT',
          riskLevel: 'LOW',
        });
      } else if (position.pnlPercent < -15) {
        newRecommendations.push({
          symbol: position.symbol,
          name: position.name,
          action: 'HOLD',
          confidence: 55,
          targetPrice: position.avgPrice,
          reasoning: `Currently down ${Math.abs(position.pnlPercent).toFixed(1)}%. Hold for recovery unless fundamentals have changed.`,
          timeHorizon: 'LONG',
          riskLevel: 'HIGH',
        });
      }
    });

    setRecommendations(newRecommendations.slice(0, 6)); // Limit to 6 recommendations
  }, []);

  // Calculate risk assessment
  const calculateRiskAssessment = useCallback((portfolio: Portfolio) => {
    if (portfolio.positions.length === 0) {
      setRiskAssessment(null);
      return;
    }

    const sectorExposure = calculateSectorExposure(portfolio.positions);
    const maxSectorExposure = Math.max(...Object.values(sectorExposure));
    
    // Calculate diversification score
    const diversificationScore = Math.max(0, 100 - (maxSectorExposure - 20) * 2);
    
    // Calculate concentration risk
    const concentrationRisk = maxSectorExposure > 50 ? 80 : maxSectorExposure > 30 ? 50 : 20;
    
    // Calculate volatility risk (simplified)
    const avgPnLPercent = portfolio.positions.reduce((sum, pos) => sum + Math.abs(pos.pnlPercent), 0) / portfolio.positions.length;
    const volatilityRisk = Math.min(avgPnLPercent * 5, 100);
    
    // Overall risk assessment
    const overallRiskScore = (concentrationRisk + volatilityRisk) / 2;
    const overallRisk = overallRiskScore > 60 ? 'HIGH' : overallRiskScore > 30 ? 'MEDIUM' : 'LOW';
    
    const sectorRisks = Object.entries(sectorExposure).map(([sector, exposure]) => ({
      sector,
      exposure,
      risk: exposure > 40 ? 'HIGH' : exposure > 25 ? 'MEDIUM' : 'LOW'
    }));

    const recommendations = [];
    if (maxSectorExposure > 40) {
      recommendations.push('Reduce concentration in dominant sector');
    }
    if (portfolio.positions.length < 5) {
      recommendations.push('Increase diversification with more positions');
    }
    if (volatilityRisk > 50) {
      recommendations.push('Consider defensive stocks to reduce volatility');
    }

    setRiskAssessment({
      overallRisk,
      diversificationScore,
      volatilityRisk,
      concentrationRisk,
      sectorRisks,
      recommendations,
    });
  }, []);

  // Calculate performance analysis
  const calculatePerformanceAnalysis = useCallback((portfolio: Portfolio, orders: Order[]) => {
    if (orders.length === 0) {
      setPerformanceAnalysis(null);
      return;
    }

    const completedOrders = orders.filter(order => order.status === 'EXECUTED');
    const trades = completedOrders.length;
    
    // Calculate win rate (simplified)
    const profitableTrades = portfolio.positions.filter(pos => pos.pnl > 0).length;
    const winRate = trades > 0 ? (profitableTrades / portfolio.positions.length) * 100 : 0;
    
    // Calculate other metrics (simplified for demo)
    const totalPnL = portfolio.totalPnL;
    const maxDrawdown = Math.abs(Math.min(...portfolio.positions.map(pos => pos.pnlPercent), 0));
    
    const avgGain = portfolio.positions
      .filter(pos => pos.pnl > 0)
      .reduce((sum, pos) => sum + pos.pnl, 0) / Math.max(profitableTrades, 1);
    
    const losingPositions = portfolio.positions.filter(pos => pos.pnl < 0);
    const avgLoss = losingPositions.length > 0 
      ? Math.abs(losingPositions.reduce((sum, pos) => sum + pos.pnl, 0) / losingPositions.length)
      : 0;

    const profitFactor = avgLoss > 0 ? avgGain / avgLoss : avgGain > 0 ? 5 : 1;
    const sharpeRatio = totalPnL > 0 ? Math.min(totalPnL / 10000, 3) : 0; // Simplified calculation

    const bestTrade = portfolio.positions.reduce((best, pos) => 
      pos.pnl > best.pnl ? { symbol: pos.symbol, pnl: pos.pnl } : best,
      { symbol: '', pnl: -Infinity }
    );

    const worstTrade = portfolio.positions.reduce((worst, pos) => 
      pos.pnl < worst.pnl ? { symbol: pos.symbol, pnl: pos.pnl } : worst,
      { symbol: '', pnl: Infinity }
    );

    const tradingFrequency = trades < 5 ? 'LOW' : trades < 15 ? 'MEDIUM' : 'HIGH';
    const riskTolerance = maxDrawdown < 5 ? 'CONSERVATIVE' : maxDrawdown < 15 ? 'MODERATE' : 'AGGRESSIVE';

    setPerformanceAnalysis({
      sharpeRatio,
      maxDrawdown,
      winRate,
      avgGain,
      avgLoss,
      profitFactor,
      bestTrade: bestTrade.pnl !== -Infinity ? bestTrade : { symbol: 'N/A', pnl: 0 },
      worstTrade: worstTrade.pnl !== Infinity ? worstTrade : { symbol: 'N/A', pnl: 0 },
      tradingFrequency,
      riskTolerance,
    });
  }, []);

  const clearInsights = useCallback(() => {
    setInsights([]);
  }, []);

  const dismissInsight = useCallback((insightId: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  }, []);

  return {
    insights,
    recommendations,
    riskAssessment,
    performanceAnalysis,
    loading,
    generateInsights,
    generateRecommendations,
    calculateRiskAssessment,
    calculatePerformanceAnalysis,
    clearInsights,
    dismissInsight,
  };
}

function calculateSectorExposure(positions: Position[]): Record<string, number> {
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const sectorValues: Record<string, number> = {};
  
  // This is simplified - in real app, you'd get sector info from stock data
  const sectorMapping: Record<string, string> = {
    'RELIANCE': 'Oil & Gas',
    'TCS': 'Information Technology',
    'INFY': 'Information Technology',
    'HDFCBANK': 'Financial Services',
    'ICICIBANK': 'Financial Services',
    'HINDUNILVR': 'FMCG',
    'LT': 'Construction',
    'SBIN': 'Financial Services',
    'BHARTIARTL': 'Telecommunications',
    'KOTAKBANK': 'Financial Services',
    'ASIANPAINT': 'Consumer Goods',
    'WIPRO': 'Information Technology',
    'MARUTI': 'Automobile',
    'HCLTECH': 'Information Technology',
    'AXISBANK': 'Financial Services',
  };
  
  positions.forEach(position => {
    const sector = sectorMapping[position.symbol] || 'Other';
    sectorValues[sector] = (sectorValues[sector] || 0) + position.currentValue;
  });

  const sectorExposure: Record<string, number> = {};
  Object.entries(sectorValues).forEach(([sector, value]) => {
    sectorExposure[sector] = (value / totalValue) * 100;
  });

  return sectorExposure;
}
