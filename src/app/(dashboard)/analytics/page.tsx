'use client';

import React, { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, CATEGORY_COLORS } from '@/lib/constants';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function AnalyticsPage() {
  const { state } = useFinance();

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: Record<string, { label: string; income: number; expenses: number; savings: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { label: d.toLocaleString('en-US', { month: 'short' }), income: 0, expenses: 0, savings: 0 };
    }
    state.transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        if (t.type === 'income') months[key].income += t.amount;
        else months[key].expenses += t.amount;
      }
    });
    return Object.values(months).map(m => ({
      ...m,
      income: Math.round(m.income / 1000),
      expenses: Math.round(m.expenses / 1000),
      savings: Math.round((m.income - m.expenses) / 1000),
    }));
  }, [state.transactions]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const cats: Record<string, number> = {};
    state.transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [state.transactions]);

  const tooltipStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep dive into your financial data</p>
      </div>

      {/* Line Chart — Monthly Trend */}
      <div className="card p-5">
        <h3 className="text-base font-semibold mb-1">Monthly Cash Flow</h3>
        <p className="text-xs text-muted-foreground mb-4">Income, Expenses & Savings — last 12 months (×1000 Rp)</p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={v => `${v}K`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`Rp ${(v as number).toLocaleString()}K`]} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
            <Line type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={2.5} dot={false} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} dot={false} name="Expenses" />
            <Line type="monotone" dataKey="savings" stroke="#16A34A" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Savings" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Bar Chart — Income vs Expense */}
        <div className="card p-5">
          <h3 className="text-base font-semibold mb-1">Income vs Expenses</h3>
          <p className="text-xs text-muted-foreground mb-4">Monthly comparison (×1000 Rp)</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={v => `${v}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`Rp ${(v as number).toLocaleString()}K`]} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Bar dataKey="income" fill="#2563EB" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Category Breakdown */}
        <div className="card p-5">
          <h3 className="text-base font-semibold mb-1">Spending Categories</h3>
          <p className="text-xs text-muted-foreground mb-4">This month's expense breakdown</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6B7280'} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(v as number)]} />
              <Legend formatter={(v) => <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Table */}
      <div className="card p-5">
        <h3 className="text-base font-semibold mb-4">Category Breakdown — This Month</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-3 text-muted-foreground font-medium">Category</th>
                <th className="text-right pb-3 text-muted-foreground font-medium">Amount</th>
                <th className="text-right pb-3 text-muted-foreground font-medium">Share</th>
                <th className="pb-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categoryData.map(cat => {
                const total = categoryData.reduce((s, c) => s + c.value, 0);
                const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                return (
                  <tr key={cat.name}>
                    <td className="py-3 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[cat.name] || '#6B7280' }} />
                      {cat.name}
                    </td>
                    <td className="py-3 text-right font-medium">{formatCurrency(cat.value)}</td>
                    <td className="py-3 text-right text-muted-foreground">{pct}%</td>
                    <td className="py-3 px-4 w-32">
                      <div className="progress-track h-1.5">
                        <div className="progress-fill h-1.5" style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat.name] || '#6B7280' }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
