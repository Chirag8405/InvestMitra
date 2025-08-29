import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  BookOpen,
  Trophy,
  Bell,
  Plus,
  Brain,
  IndianRupeeIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTrading } from "@/hooks/use-trading";

// Mock data for Indian stocks
const topStocks = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", price: 2486.75, change: 23.40, changePercent: 0.95, trend: "up" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", price: 3924.15, change: -45.30, changePercent: -1.14, trend: "down" },
  { symbol: "INFY.NS", name: "Infosys Limited", price: 1789.60, change: 12.85, changePercent: 0.72, trend: "up" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", price: 1634.20, change: -8.95, changePercent: -0.54, trend: "down" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", price: 1256.40, change: 15.75, changePercent: 1.27, trend: "up" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", price: 2387.30, change: 7.60, changePercent: 0.32, trend: "up" },
];

const marketStatus = {
  isOpen: false,
  nextOpen: "9:15 AM IST Tomorrow",
  sensex: 81647.10,
  sensexChange: 329.40,
  nifty: 24580.80,
  niftyChange: 98.60,
};

const achievements = [
  { title: "First Trade", desc: "Complete your first trade", progress: 100, reward: 500 },
  { title: "Market Analyst", desc: "Check market 5 days in a row", progress: 60, reward: 1000 },
  { title: "Risk Master", desc: "Complete risk assessment", progress: 0, reward: 750 },
];

export default function Index() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { portfolio } = useTrading();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to make smart investment decisions today?
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/trading">
              <Plus className="h-4 w-4 mr-2" />
              Start Trading
            </Link>
          </Button>
        </div>
      </div>

      {/* Market Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Market Status</CardTitle>
            <Badge variant={marketStatus.isOpen ? "default" : "secondary"}>
              {marketStatus.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          {!marketStatus.isOpen && (
            <CardDescription>Next opens: {marketStatus.nextOpen}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SENSEX</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{formatNumber(marketStatus.sensex)}</span>
                  <span className="text-success flex items-center text-sm">
                    <ArrowUpRight className="h-3 w-3" />
                    {marketStatus.sensexChange} (0.4%)
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">NIFTY 50</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{formatNumber(marketStatus.nifty)}</span>
                  <span className="text-success flex items-center text-sm">
                    <ArrowUpRight className="h-3 w-3" />
                    {marketStatus.niftyChange} (0.4%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupeeIcon className="h-5 w-5" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invested</p>
              <p className="text-xl font-semibold">{formatCurrency(portfolio.investedAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p className={`text-xl font-semibold ${portfolio.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                {portfolio.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.totalPnL)} ({portfolio.totalPnLPercent.toFixed(2)}%)
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's P&L</p>
              <p className={`text-xl font-semibold ${portfolio.todaysPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                {portfolio.todaysPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.todaysPnL)} ({portfolio.todaysPnLPercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Stocks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top NSE Stocks
          </CardTitle>
          <CardDescription>Real-time prices with 15-minute delay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topStocks.map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stock.symbol.replace('.NS', '')}</span>
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(stock.price)}</p>
                  <div className={`flex items-center gap-1 text-sm ${stock.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {stock.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    <span>{stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/trading">View All Stocks</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-3" asChild>
              <Link to="/trading">
                <TrendingUp className="h-4 w-4" />
                Start Trading Session
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link to="/learn">
                <BookOpen className="h-4 w-4" />
                Continue Learning
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" asChild>
              <Link to="/portfolio">
                <IndianRupeeIcon className="h-4 w-4" />
                View Portfolio
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>Complete tasks to earn virtual coins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +₹{achievement.reward}
                  </Badge>
                </div>
                <Progress value={achievement.progress} className="h-2" />
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2" asChild>
              <Link to="/learn">View All Achievements</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Investment Insights
          </CardTitle>
          <CardDescription>AI-powered analysis and personalized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-start gap-3">
                <div className="bg-success rounded-full p-1">
                  <TrendingUp className="h-4 w-4 text-success-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-success">Smart Buy Signal: Tech Sector</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI detects strong momentum in IT stocks. TCS and Infosys showing bullish patterns with 85% confidence.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <div className="bg-warning rounded-full p-1">
                  <Target className="h-4 w-4 text-warning-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-warning">Portfolio Risk Alert</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sector concentration detected. Consider diversifying beyond financial services for better risk management.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 rounded-full p-1">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Performance Insight</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your trading pattern shows 68% win rate. AI suggests focusing on position sizing for better returns.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/ai-insights">View Complete AI Analysis</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
