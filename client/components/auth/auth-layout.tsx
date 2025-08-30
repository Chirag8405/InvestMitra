import * as React from "react";
import { TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const location = useLocation();

  return (
    <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 md:grid-cols-2 gap-0">
      <div className="relative hidden md:flex bg-gradient-to-br from-primary/15 via-transparent to-primary/5 items-center justify-center p-10 overflow-hidden">
        {/* Animated background accents */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-10 h-72 w-72 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-3xl"
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 0.6, scale: 1, rotate: 0 }} 
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/30 to-transparent blur-3xl"
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ opacity: 0.5, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
        />

        <div className="max-w-md space-y-4 relative">
          <div className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground p-2 shadow-lg shadow-primary/20">
            <TrendingUp className="h-5 w-5" />
            <span className="font-semibold">InvestMitra</span>
          </div>
          <motion.h2
            className="text-3xl font-bold"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="text-muted-foreground"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          >
            {subtitle}
          </motion.p>
          <motion.ul
            className="text-sm space-y-2 text-foreground/80 list-disc list-inside mt-4"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <li>Trade with realistic fees and P&amp;L</li>
            <li>Sync your portfolio across devices</li>
            <li>Dark mode friendly, keyboard accessible</li>
          </motion.ul>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6 md:p-10 overflow-hidden">
        {/* Animated gradient sheen */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="absolute top-1/4 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 24, scale: 0.98, rotateX: 4 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.98, rotateX: -4 }}
            transition={{ type: "spring", damping: 24, stiffness: 260, mass: 0.9 }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
