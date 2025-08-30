import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  IndianRupeeIcon
} from "lucide-react";
import { useTrading } from "@/hooks/use-trading";
import { useMarketData } from "@/hooks/use-market-data";

export default function Portfolio() {
  const { portfolio } = useTrading();
  const { getStock } = useMarketData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sectorsMap = portfolio.positions.reduce<Record<string, number>>((acc, pos) => {
    const stock = getStock(pos.symbol);
    const sector = stock?.sector || 'Unknown';
    acc[sector] = (acc[sector] || 0) + pos.currentValue;
    return acc;
  }, {});
  const sectors = Object.entries(sectorsMap).map(([sector, value]) => ({ sector, value }));
  const totalEquityValue = sectors.reduce((s, x) => s + x.value, 0);
  const allocation = [
    ...sectors.map(x => ({ sector: x.sector, percentage: totalEquityValue ? Math.round((x.value / (totalEquityValue + portfolio.availableCash)) * 100) : 0, value: x.value })),
    { sector: 'Cash', percentage: Math.round((portfolio.availableCash / (totalEquityValue + portfolio.availableCash || 1)) * 100), value: portfolio.availableCash },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            My Portfolio
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your virtual investments and performance
          </p>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              From initial {formatCurrency(portfolio.investedAmount + portfolio.availableCash - (portfolio.totalPnL > 0 ? portfolio.totalPnL : 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.availableCash)}</div>
            <p className="text-xs text-muted-foreground">
              Ready to invest
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolio.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {portfolio.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.totalPnL)}
            </div>
            <p className={`text-xs ${portfolio.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {portfolio.totalPnLPercent >= 0 ? '+' : ''}{portfolio.totalPnLPercent.toFixed(2)}% overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolio.todaysPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {portfolio.todaysPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.todaysPnL)}
            </div>
            <p className={`text-xs ${portfolio.todaysPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {portfolio.todaysPnLPercent >= 0 ? '+' : ''}{portfolio.todaysPnLPercent.toFixed(2)}% today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            My Holdings
          </CardTitle>
          <CardDescription>Your current stock positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.positions.map((pos) => (
              <div key={pos.symbol} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{pos.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {pos.quantity} shares
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pos.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(pos.avgPrice)} | Current: {formatCurrency(pos.currentPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(pos.currentValue)}</p>
                  <div className={`flex items-center gap-1 text-sm ${pos.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pos.pnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    <span>{pos.pnl >= 0 ? '+' : ''}{formatCurrency(pos.pnl)}</span>
                    <span>({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
            ))}
            {portfolio.positions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No positions yet. Start trading to build your portfolio!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sector Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Sector Allocation
          </CardTitle>
          <CardDescription>Portfolio distribution across sectors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allocation.map((sector) => (
              <div key={sector.sector} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{sector.sector}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{sector.percentage}%</span>
                    <p className="text-xs text-muted-foreground">{formatCurrency(sector.value)}</p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${sector.sector === 'Cash' ? 'bg-gray-500' : 'bg-primary'}`}
                    style={{ width: `${sector.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
