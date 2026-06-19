'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';

export default function Navbar() {
  const { state, dispatch } = useFinance();
  const { theme } = state.preferences;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply theme on mount and when it changes
    const root = document.documentElement;
    if (
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { theme: newTheme },
    });
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search Bar - placeholder for CMD+K */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3 py-2 bg-secondary rounded-md text-muted-foreground cursor-pointer hover:bg-secondary/80 transition-colors">
        <Search size={18} />
        <span className="text-sm">Search transactions, budgets...</span>
        <div className="ml-auto flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-background rounded border border-border">Ctrl</kbd>
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-background rounded border border-border">K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Quick Actions */}
        <button className="btn btn-primary hidden sm:flex">
          Add Transaction
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />
          ) : (
            <div className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
      </div>
    </header>
  );
}
