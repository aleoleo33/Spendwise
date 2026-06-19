'use client';

import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/constants';

export default function CashFlowChart() {
  const { state } = useFinance();

  const data = useMemo(() => {
    const months: Record<string, { income: number; expenses: number; savings: number }> = {};
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      months[key] = { income: 0, expenses: 0, savings: 0 };
      (months as any)[key]._label = label;
    }

    state.transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        if (t.type === 'income') months[key].income += t.amount;
        else months[key].expenses += t.amount;
      }
    });

    return Object.entries(months).map(([, v]) => ({
      month: (v as any)._label,
      income: Math.round(v.income / 1000),
      expenses: Math.round(v.expenses / 1000),
      savings: Math.round((v.income - v.expenses) / 1000),
    }));
  }, [state.transactions]);

  return (
    <div className="card p-5 animate-fade-in">
      <h3 className="text-base font-semibold text-foreground mb-1">Monthly Cash Flow</h3>
      <p className="text-xs text-muted-foreground mb-4">Income vs Expenses — last 12 months</p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `${v}K`} />
          <Tooltip
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
            formatter={(value) => [`Rp ${(value as number).toLocaleString('id-ID')}K`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
          <Line type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={2} dot={false} name="Income" />
          <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={false} name="Expenses" />
          <Line type="monotone" dataKey="savings" stroke="#16A34A" strokeWidth={2} dot={false} name="Savings" strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
