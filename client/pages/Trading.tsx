import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  ShoppingCart,
  Wallet,
  Clock,
  Eye,
  Plus,
  Minus,
  Activity
} from "lucide-react";
import { useMarketData } from "@/hooks/use-market-data";
import { useTrading } from "@/hooks/use-trading";
import { Skeleton } from "@/components/ui/skeleton";

export default function Trading() {
  const { stocks, loading, isMarketOpen, searchStocks, filterBySector, getSectors } = useMarketData();
  const { portfolio, placeOrder, getPosition, getOrderHistory, updatePortfolioWithCurrentPrices } = useTrading();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [filteredStocks, setFilteredStocks] = useState(stocks);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState("");
  const [priceType, setPriceType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [watchlist, setWatchlist] = useState<string[]>(["RELIANCE", "TCS", "INFY"]);
  const [errors, setErrors] = useState<{ quantity?: string; limitPrice?: string }>({});
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Update portfolio with current prices
  useEffect(() => {
    if (stocks.length > 0) {
      updatePortfolioWithCurrentPrices(stocks);
    }
  }, [stocks, updatePortfolioWithCurrentPrices]);

  // Filter stocks based on search and sector
  useEffect(() => {
    let filtered = searchStocks(searchQuery);
    filtered = filterBySector(selectedSector);
    if (searchQuery) {
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredStocks(filtered);
  }, [searchQuery, selectedSector, stocks, searchStocks, filterBySector]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const validate = useMemo(() => {
    const errs: { quantity?: string; limitPrice?: string } = {};
    if (!Number.isInteger(quantity) || quantity <= 0) errs.quantity = "Enter a valid quantity (whole number)";
    if (orderType === "SELL") {
      const pos = selectedStock ? getPosition(selectedStock.symbol) : undefined;
      if (pos && quantity > pos.quantity) errs.quantity = `Max available: ${pos.quantity}`;
    }
    if (priceType === "LIMIT") {
      const val = parseFloat(limitPrice);
      if (!limitPrice || !Number.isFinite(val) || val <= 0) errs.limitPrice = "Enter a valid limit price";
    }
    return errs;
  }, [quantity, priceType, limitPrice, orderType, selectedStock, getPosition]);

  useEffect(() => setErrors(validate), [validate]);

  const handlePlaceOrder = () => {
    if (!selectedStock) return;
    if (Object.keys(errors).length > 0) return;

    const result = placeOrder(
      selectedStock,
      orderType,
      quantity,
      priceType,
      priceType === "LIMIT" ? parseFloat(limitPrice) : undefined
    );

    if (result.success) {
      toast({
        title: "Order Executed",
        description: result.message,
      });
      setSelectedStock(null);
      setQuantity(1);
      setLimitPrice("");
    } else {
      toast({
        title: "Order Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 animate-spin" />
          <p>Loading market data…</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60 mt-2" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Trading Terminal
          </h1>
          <p className="text-muted-foreground mt-1">
            Buy and sell stocks with real-time market simulation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMarketOpen ? "default" : "secondary"}>
            {isMarketOpen ? "Market Open" : "Market Closed"}
          </Badge>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Cash: {formatCurrency(portfolio.availableCash)}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Stock Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                ref={searchRef}
                placeholder="Search stocks by symbol or name… (press / to focus)"
                aria-label="Search stocks"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {getSectors().map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stocks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stocks">All Stocks</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>

        {/* All Stocks */}
        <TabsContent value="stocks">
          <Card>
            <CardHeader>
              <CardTitle>NSE Stocks</CardTitle>
              <CardDescription>
                Real-time prices with 15-minute delay simulation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredStocks.map((stock) => {
                  const position = getPosition(stock.symbol);
                  const isInWatchlist = watchlist.includes(stock.symbol);

                  return (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{stock.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {stock.sector}
                          </Badge>
                          {position && (
                            <Badge variant="secondary" className="text-xs">
                              {position.quantity} shares
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {stock.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vol: {formatNumber(stock.volume)} | H: {formatCurrency(stock.high)} | L: {formatCurrency(stock.low)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(stock.price)}</p>
                          <div className={`flex items-center gap-1 text-sm ${
                            stock.change >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {stock.change >= 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            <span>
                              {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)} ({stock.changePercent}%)
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-pressed={isInWatchlist}
                            onClick={() => toggleWatchlist(stock.symbol)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className={`h-4 w-4 ${isInWatchlist ? 'text-primary' : 'text-muted-foreground'}`} />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedStock(stock)}
                                className="h-8 px-3"
                              >
                                Trade
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                              <DialogHeader>
                                <DialogTitle>Trade {stock.symbol}</DialogTitle>
                                <DialogDescription>
                                  Current Price: {formatCurrency(stock.price)}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    variant={orderType === "BUY" ? "default" : "outline"}
                                    onClick={() => setOrderType("BUY")}
                                    className="flex items-center gap-2"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Buy
                                  </Button>
                                  <Button
                                    variant={orderType === "SELL" ? "default" : "outline"}
                                    onClick={() => setOrderType("SELL")}
                                    className="flex items-center gap-2"
                                    disabled={!position || position.quantity === 0}
                                  >
                                    <Minus className="h-4 w-4" />
                                    Sell
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="quantity">Quantity</Label>
                                  <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    max={orderType === "SELL" ? position?.quantity || 0 : 1000}
                                    value={quantity}
                                    aria-invalid={Boolean(errors.quantity) || undefined}
                                    aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                  />
                                  {errors.quantity && (
                                    <p id="quantity-error" className="text-xs text-destructive">{errors.quantity}</p>
                                  )}
                                  {orderType === "SELL" && position && !errors.quantity && (
                                    <p className="text-xs text-muted-foreground">
                                      Available: {position.quantity} shares
                                    </p>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    variant={priceType === "MARKET" ? "default" : "outline"}
                                    onClick={() => setPriceType("MARKET")}
                                    size="sm"
                                  >
                                    Market
                                  </Button>
                                  <Button
                                    variant={priceType === "LIMIT" ? "default" : "outline"}
                                    onClick={() => setPriceType("LIMIT")}
                                    size="sm"
                                  >
                                    Limit
                                  </Button>
                                </div>

                                {priceType === "LIMIT" && (
                                  <div className="space-y-2">
                                    <Label htmlFor="limitPrice">Limit Price</Label>
                                    <Input
                                      id="limitPrice"
                                      type="number"
                                      step="0.01"
                                      value={limitPrice}
                                      aria-invalid={Boolean(errors.limitPrice) || undefined}
                                      aria-describedby={errors.limitPrice ? 'limit-error' : undefined}
                                      onChange={(e) => setLimitPrice(e.target.value)}
                                      placeholder={stock.price.toString()}
                                    />
                                    {errors.limitPrice && (
                                      <p id="limit-error" className="text-xs text-destructive">{errors.limitPrice}</p>
                                    )}
                                  </div>
                                )}

                                <div className="space-y-2 p-3 bg-accent/50 rounded-lg">
                                  <div className="flex justify-between text-sm">
                                    <span>Quantity:</span>
                                    <span>{quantity}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Price:</span>
                                    <span>{formatCurrency(priceType === "MARKET" ? stock.price : parseFloat(limitPrice) || stock.price)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Gross Amount:</span>
                                    <span>{formatCurrency(quantity * (priceType === "MARKET" ? stock.price : parseFloat(limitPrice) || stock.price))}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Brokerage:</span>
                                    <span>{formatCurrency(Math.max(quantity * (priceType === "MARKET" ? stock.price : parseFloat(limitPrice) || stock.price) * 0.0003, 20))}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold border-t pt-2">
                                    <span>Total:</span>
                                    <span>{formatCurrency(quantity * (priceType === "MARKET" ? stock.price : parseFloat(limitPrice) || stock.price) + Math.max(quantity * (priceType === "MARKET" ? stock.price : parseFloat(limitPrice) || stock.price) * 0.0003, 20))}</span>
                                  </div>
                                </div>

                                <Button
                                  onClick={handlePlaceOrder}
                                  className="w-full"
                                  disabled={Boolean(Object.keys(errors).length)}
                                >
                                  Place {orderType} Order
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Watchlist */}
        <TabsContent value="watchlist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                My Watchlist
              </CardTitle>
              <CardDescription>
                Stocks you're tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stocks
                  .filter(stock => watchlist.includes(stock.symbol))
                  .map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{stock.symbol}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleWatchlist(stock.symbol)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(stock.price)}</p>
                        <div className={`flex items-center gap-1 text-sm ${
                          stock.change >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {stock.change >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          <span>{stock.change >= 0 ? '+' : ''}{stock.changePercent}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                {watchlist.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No stocks in watchlist. Add stocks by clicking the eye icon.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions */}
        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                My Positions
              </CardTitle>
              <CardDescription>
                Your current stock holdings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {portfolio.positions.map((position) => (
                  <div
                    key={position.symbol}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{position.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {position.quantity} shares
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{position.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {formatCurrency(position.avgPrice)} | Current: {formatCurrency(position.currentPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(position.currentValue)}</p>
                      <div className={`flex items-center gap-1 text-sm ${
                        position.pnl >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {position.pnl >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        <span>
                          {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)} ({position.pnlPercent.toFixed(2)}%)
                        </span>
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
        </TabsContent>

        {/* Order History */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order History
              </CardTitle>
              <CardDescription>
                Your recent trading activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getOrderHistory().map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{order.symbol}</span>
                        <Badge
                          variant={order.type === "BUY" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {order.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} shares @ {formatCurrency(order.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">
                        Brokerage: {formatCurrency(order.brokerage)}
                      </p>
                    </div>
                  </div>
                ))}
                {portfolio.orders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No orders yet. Start trading to see your order history!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
