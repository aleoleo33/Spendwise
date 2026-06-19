'use client';

import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Percent, BarChart3 } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/constants';
import StatCard from '@/components/ui/StatCard';
import HeroCard from '@/components/dashboard/HeroCard';
import InsightCards from '@/components/dashboard/InsightCards';
import CashFlowChart from '@/components/charts/CashFlowChart';
import SpendingDonutChart from '@/components/charts/SpendingDonutChart';
import WeeklyHeatmap from '@/components/charts/WeeklyHeatmap';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionForm from '@/components/transactions/TransactionForm';
import type { Transaction } from '@/types';

export default function DashboardPage() {
  const { totalBalance, monthlyIncome, monthlyExpenses, savingsRate, netWorth } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const openAdd = () => { setEditingTx(null); setShowForm(true); };
  const openEdit = (tx: Transaction) => { setEditingTx(tx); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingTx(null); };

  const savedAmount = monthlyIncome - monthlyExpenses;

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Hero */}
      <HeroCard savedAmount={savedAmount} savingsRate={savingsRate} onAddTransaction={openAdd} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(totalBalance)}
          change={8}
          changeLabel="vs last month"
          icon={<Wallet size={20} className="text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          change={5}
          icon={<TrendingUp size={20} className="text-success" />}
          iconBg="bg-success/10"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          change={-3}
          icon={<TrendingDown size={20} className="text-destructive" />}
          iconBg="bg-destructive/10"
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          change={savingsRate > 30 ? 2 : -1}
          icon={<Percent size={20} className="text-warning" />}
          iconBg="bg-warning/10"
        />
        <StatCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          change={12}
          icon={<BarChart3 size={20} className="text-purple-500" />}
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <CashFlowChart />
        </div>
        <div>
          <SpendingDonutChart />
        </div>
      </div>

      {/* Heatmap + Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WeeklyHeatmap />
        <InsightCards />
      </div>

      {/* Recent Transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Recent Transactions</h3>
            <p className="text-xs text-muted-foreground">Latest 8 transactions</p>
          </div>
          <a href="/transactions" className="text-sm text-primary hover:underline">View all →</a>
        </div>
        <TransactionTable onEdit={openEdit} limit={8} />
      </div>

      {/* Transaction Modal */}
      {showForm && <TransactionForm transaction={editingTx} onClose={closeForm} />}
    </div>
  );
}
