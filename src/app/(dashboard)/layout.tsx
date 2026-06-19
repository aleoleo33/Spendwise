'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useFinance } from '@/context/FinanceContext';
import ThemeInitializer from '@/components/layout/ThemeInitializer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state } = useFinance();
  const { sidebarCollapsed } = state.preferences;

  return (
    <>
      <ThemeInitializer />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            sidebarCollapsed ? 'ml-[80px]' : 'ml-[280px]'
          }`}
        >
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
