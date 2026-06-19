'use client';

import { useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';

export default function ThemeInitializer() {
  const { state } = useFinance();
  const { theme } = state.preferences;

  useEffect(() => {
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

  return null;
}
