'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Target,
  CreditCard,
  Calendar,
  Settings,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { NAV_ITEMS } from '@/lib/constants';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  BarChart3,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Target,
  CreditCard,
  Calendar,
  Settings,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { state, dispatch } = useFinance();
  const { sidebarCollapsed } = state.preferences;

  const toggleSidebar = () => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { sidebarCollapsed: !sidebarCollapsed },
    });
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 z-40 flex flex-col ${
        sidebarCollapsed ? 'w-[80px]' : 'w-[280px]'
      }`}
    >
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
        {!sidebarCollapsed && (
          <span className="text-xl font-bold text-foreground">SpendWise</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-sidebar-hover text-muted-foreground transition-colors mx-auto"
          aria-label="Toggle Sidebar"
        >
          {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-primary font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : ''} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-sidebar-border shrink-0">
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shrink-0">
            JD
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
