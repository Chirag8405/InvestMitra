import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Wallet,
  BookOpen,
  Trophy,
  TrendingUp,
  Brain,
  Menu,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTrading } from "@/hooks/use-trading";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Portfolio", href: "/portfolio", icon: Wallet },
  { name: "Trading", href: "/trading", icon: TrendingUp },
  { name: "AI Insights", href: "/ai-insights", icon: Brain },
  { name: "Learn", href: "/learn", icon: BookOpen },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { portfolio } = useTrading();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-2 rounded">Skip to content</a>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg p-2">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">InvestMitra</h1>
                <p className="text-xs text-muted-foreground">Smart Trading Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="Primary">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Virtual Balance */}
              <Badge variant="outline" className="hidden sm:flex gap-1 bg-success/10 text-success border-success/20">
                <span className="text-xs">Virtual Balance:</span>
                <span className="font-semibold">{formatCurrency(portfolio.totalValue)}</span>
              </Badge>

              <ThemeToggle />

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div id="mobile-nav" className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="container mx-auto px-4 py-3">
              <nav className="space-y-2" aria-label="Mobile Primary">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start gap-3"
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-3 pt-3 border-t">
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Virtual Balance: {formatCurrency(portfolio.totalValue)}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main" className="container mx-auto px-4 sm:px-6 lg:px-8 py-6" aria-busy={false}>
        {children}
      </main>
    </div>
  );
}
