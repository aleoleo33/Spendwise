'use client';

import React, { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/constants';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';

interface Insight {
  type: 'positive' | 'negative' | 'warning' | 'info';
  text: string;
}

export default function InsightCards() {
  const { state, monthlyIncome, monthlyExpenses, savingsRate } = useFinance();

  const insights: Insight[] = useMemo(() => {
    const results: Insight[] = [];
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Current month transactions
    const curTxs = state.transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
    });

    // Previous month transactions
    const prevTxs = state.transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear() && t.type === 'expense';
    });

    // Savings rate
    if (savingsRate >= 30) {
      results.push({ type: 'positive', text: `Great job! Your savings rate is ${savingsRate}% this month.` });
    } else if (savingsRate < 10 && savingsRate >= 0) {
      results.push({ type: 'warning', text: `Your savings rate is only ${savingsRate}%. Try to cut back on expenses.` });
    }

    // Category spend changes
    const curCats: Record<string, number> = {};
    const prevCats: Record<string, number> = {};
    curTxs.forEach((t) => (curCats[t.category] = (curCats[t.category] || 0) + t.amount));
    prevTxs.forEach((t) => (prevCats[t.category] = (prevCats[t.category] || 0) + t.amount));

    const topCurCat = Object.entries(curCats).sort((a, b) => b[1] - a[1])[0];
    if (topCurCat) {
      results.push({ type: 'info', text: `Largest expense category this month: ${topCurCat[0]} (${formatCurrency(topCurCat[1])}).` });
    }

    // Budget exceeded check
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    state.budgets
      .filter((b) => b.month === currentMonth)
      .forEach((b) => {
        const spent = curCats[b.category] || 0;
        if (spent > b.monthlyLimit) {
          results.push({ type: 'negative', text: `${b.category} budget exceeded! Spent ${formatCurrency(spent)} of ${formatCurrency(b.monthlyLimit)}.` });
        } else if (spent > b.monthlyLimit * 0.8) {
          results.push({ type: 'warning', text: `${b.category} budget is at ${Math.round((spent / b.monthlyLimit) * 100)}% — almost reached.` });
        }
      });

    // Food spending change
    if (curCats['Food & Drinks'] && prevCats['Food & Drinks']) {
      const change = ((curCats['Food & Drinks'] - prevCats['Food & Drinks']) / prevCats['Food & Drinks']) * 100;
      if (Math.abs(change) > 5) {
        results.push({
          type: change > 0 ? 'negative' : 'positive',
          text: `Food & Drinks spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(change))}% vs last month.`,
        });
      }
    }

    // Most used payment method
    const pmCount: Record<string, number> = {};
    curTxs.forEach((t) => (pmCount[t.paymentMethod] = (pmCount[t.paymentMethod] || 0) + 1));
    const topPm = Object.entries(pmCount).sort((a, b) => b[1] - a[1])[0];
    if (topPm) {
      results.push({ type: 'info', text: `Most used payment method: ${topPm[0]} (${topPm[1]} transactions).` });
    }

    return results.slice(0, 5);
  }, [state, monthlyIncome, monthlyExpenses, savingsRate]);

  const iconMap = {
    positive: <TrendingUp size={16} className="text-success" />,
    negative: <TrendingDown size={16} className="text-destructive" />,
    warning: <AlertTriangle size={16} className="text-warning" />,
    info: <Lightbulb size={16} className="text-primary" />,
  };

  const bgMap = {
    positive: 'bg-success/10 border-success/20',
    negative: 'bg-destructive/10 border-destructive/20',
    warning: 'bg-warning/10 border-warning/20',
    info: 'bg-primary/10 border-primary/20',
  };

  return (
    <div className="card p-5 animate-fade-in">
      <h3 className="text-base font-semibold text-foreground mb-1">Financial Insights</h3>
      <p className="text-xs text-muted-foreground mb-4">Auto-generated from your spending data</p>
      <div className="flex flex-col gap-3">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No insights yet. Add more transactions to see insights.</p>
        ) : (
          insights.map((ins, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-md border ${bgMap[ins.type]}`}>
              <div className="mt-0.5">{iconMap[ins.type]}</div>
              <p className="text-sm text-foreground">{ins.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
