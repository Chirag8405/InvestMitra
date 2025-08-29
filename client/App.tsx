import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Trading from "./pages/Trading";
import AIInsights from "./pages/AIInsights";
import Learn from "./pages/Learn";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import { TradingProvider } from "@/hooks/use-trading";
import { ErrorBoundary } from "@/components/error-boundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TradingProvider>
            <Layout>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/trading" element={<Trading />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </Layout>
          </TradingProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
