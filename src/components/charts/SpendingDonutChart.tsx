'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinance } from '@/context/FinanceContext';
import { CATEGORY_COLORS, formatCurrency } from '@/lib/constants';

export default function SpendingDonutChart() {
  const { state } = useFinance();

  const data = useMemo(() => {
    const now = new Date();
    const catTotals: Record<string, number> = {};

    state.transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.type === 'expense' &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .forEach((t) => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      });

    return Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [state.transactions]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card p-5 animate-fade-in">
      <h3 className="text-base font-semibold text-foreground mb-1">Spending by Category</h3>
      <p className="text-xs text-muted-foreground mb-4">This month — {formatCurrency(total)} total</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={CATEGORY_COLORS[entry.name] || '#6B7280'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
            formatter={(value: number) => [formatCurrency(value), '']}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
