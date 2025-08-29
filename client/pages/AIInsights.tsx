import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  X,
  RefreshCw,
  Star,
  Activity,
  PieChart
} from "lucide-react";
import { useMarketData } from "@/hooks/use-market-data";
import { useTrading } from "@/hooks/use-trading";
import { useAIInsights } from "@/hooks/use-ai-insights";

export default function AIInsights() {
  const { stocks } = useMarketData();
  const { portfolio, getOrderHistory } = useTrading();
  const { 
    insights, 
    recommendations, 
    riskAssessment, 
    performanceAnalysis, 
    loading,
    generateInsights,
    generateRecommendations,
    calculateRiskAssessment,
    calculatePerformanceAnalysis,
    dismissInsight
  } = useAIInsights();

  const [isGenerating, setIsGenerating] = useState(false);

  const hasGeneratedInsights = useRef(false);

  useEffect(() => {
    if (stocks.length > 0 && !hasGeneratedInsights.current) {
      const orders = getOrderHistory(20);
      generateInsights(portfolio, stocks, orders);
      generateRecommendations(stocks, portfolio);
      calculateRiskAssessment(portfolio);
      calculatePerformanceAnalysis(portfolio, orders);
      hasGeneratedInsights.current = true;
    }
  }, [stocks, portfolio, generateInsights, generateRecommendations, calculateRiskAssessment, calculatePerformanceAnalysis, getOrderHistory]);

  const handleRefreshInsights = async () => {
    setIsGenerating(true);
    const orders = getOrderHistory(20);
    generateInsights(portfolio, stocks, orders);
    generateRecommendations(stocks, portfolio);
    setTimeout(() => setIsGenerating(false), 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-destructive';
      case 'MEDIUM': return 'text-warning';
      case 'LOW': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'RISK_ALERT': return <AlertTriangle className="h-4 w-4" />;
      case 'RECOMMENDATION': return <Target className="h-4 w-4" />;
      case 'MARKET_ANALYSIS': return <BarChart3 className="h-4 w-4" />;
      case 'EDUCATIONAL': return <Lightbulb className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Investment Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis of your portfolio and market opportunities
          </p>
        </div>
        <Button 
          onClick={handleRefreshInsights}
          disabled={isGenerating || loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Live Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Live Insights */}
        <TabsContent value="insights">
          <div className="space-y-4">
            {loading || isGenerating ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>AI is analyzing your portfolio...</p>
                  </div>
                </CardContent>
              </Card>
            ) : insights.length > 0 ? (
              insights.map((insight) => (
                <Card key={insight.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge 
                          variant={insight.priority === 'HIGH' ? 'destructive' : insight.priority === 'MEDIUM' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissInsight(insight.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardDescription className="text-sm">{insight.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{insight.description}</p>
                    {insight.action && (
                      <Button variant="outline" size="sm">
                        {insight.action}
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(insight.timestamp).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
                  <p className="text-muted-foreground">
                    Start trading to receive AI-powered insights and recommendations.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations">
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <Card key={`${rec.symbol}-${index}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{rec.symbol}</CardTitle>
                        <Badge 
                          variant={rec.action === 'BUY' ? 'default' : rec.action === 'SELL' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.action}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.confidence}% confidence
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.timeHorizon.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < rec.confidence / 20 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <CardDescription>{rec.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Target Price:</span>
                        <span className="font-semibold">{formatCurrency(rec.targetPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Risk Level:</span>
                        <Badge 
                          variant={rec.riskLevel === 'HIGH' ? 'destructive' : rec.riskLevel === 'MEDIUM' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {rec.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                  <p className="text-muted-foreground">
                    Build your portfolio to receive personalized stock recommendations.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Risk Analysis */}
        <TabsContent value="risk">
          {riskAssessment ? (
            <div className="space-y-6">
              {/* Overall Risk */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Overall Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        riskAssessment.overallRisk === 'HIGH' ? 'text-destructive' :
                        riskAssessment.overallRisk === 'MEDIUM' ? 'text-warning' : 'text-success'
                      }`}>
                        {riskAssessment.overallRisk}
                      </div>
                      <p className="text-sm text-muted-foreground">Overall Risk</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{riskAssessment.diversificationScore.toFixed(0)}/100</div>
                      <p className="text-sm text-muted-foreground">Diversification Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{riskAssessment.volatilityRisk.toFixed(0)}%</div>
                      <p className="text-sm text-muted-foreground">Volatility Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sector Risk Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Sector Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskAssessment.sectorRisks.map((sector) => (
                      <div key={sector.sector} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{sector.sector}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{sector.exposure.toFixed(1)}%</span>
                            <Badge 
                              variant={sector.risk === 'HIGH' ? 'destructive' : sector.risk === 'MEDIUM' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {sector.risk}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={sector.exposure} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Mitigation Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {riskAssessment.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Risk Data Available</h3>
                <p className="text-muted-foreground">
                  Build your portfolio to receive detailed risk analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Analysis */}
        <TabsContent value="performance">
          {performanceAnalysis ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <div className="text-xl font-bold">{performanceAnalysis.sharpeRatio.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                    </div>
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <div className="text-xl font-bold">{performanceAnalysis.winRate.toFixed(0)}%</div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                    </div>
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <div className="text-xl font-bold">{performanceAnalysis.maxDrawdown.toFixed(1)}%</div>
                      <p className="text-sm text-muted-foreground">Max Drawdown</p>
                    </div>
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <div className="text-xl font-bold">{performanceAnalysis.profitFactor.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Profit Factor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trading Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Trading Frequency</span>
                        <Badge variant="outline">{performanceAnalysis.tradingFrequency}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Risk Tolerance</span>
                        <Badge variant="outline">{performanceAnalysis.riskTolerance}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Gain</span>
                        <span className="text-sm font-semibold text-success">
                          {formatCurrency(performanceAnalysis.avgGain)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Loss</span>
                        <span className="text-sm font-semibold text-destructive">
                          {formatCurrency(performanceAnalysis.avgLoss)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best & Worst Trades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">Best Performer</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{performanceAnalysis.bestTrade.symbol || 'N/A'}</span>
                          <span className="text-sm font-semibold text-success">
                            +{formatCurrency(performanceAnalysis.bestTrade.pnl)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium">Worst Performer</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{performanceAnalysis.worstTrade.symbol || 'N/A'}</span>
                          <span className="text-sm font-semibold text-destructive">
                            {formatCurrency(performanceAnalysis.worstTrade.pnl)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Performance Data Available</h3>
                <p className="text-muted-foreground">
                  Complete some trades to see detailed performance analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
