'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/constants';

interface HeroCardProps {
  savedAmount: number;
  savingsRate: number;
  onAddTransaction: () => void;
}

export default function HeroCard({ savedAmount, savingsRate, onAddTransaction }: HeroCardProps) {
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' });

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-1">
          Welcome Back 👋
        </h1>
        <p className="text-muted-foreground text-sm max-w-md">
          You saved{' '}
          <span className="text-success font-semibold">{formatCurrency(savedAmount)}</span>{' '}
          this month in {monthName}.{' '}
          {savingsRate > 0 && (
            <>Savings rate <span className="text-success font-semibold">+{savingsRate}%</span>. Keep it up!</>
          )}
        </p>
      </div>
      <button onClick={onAddTransaction} className="btn btn-primary shrink-0">
        <Plus size={18} />
        Add Transaction
      </button>
    </div>
  );
}
