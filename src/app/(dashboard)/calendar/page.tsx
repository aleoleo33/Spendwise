'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, CATEGORY_COLORS } from '@/lib/constants';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Transaction } from '@/types';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage() {
  const { state } = useFinance();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group transactions by date
  const txByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    state.transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const key = d.toISOString().split('T')[0];
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    });
    return map;
  }, [state.transactions, month, year]);

  const selectedTxs = selectedDate ? txByDate[selectedDate] || [] : [];
  const selectedTotal = selectedTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const today = new Date().toISOString().split('T')[0];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getCellDate = (day: number) => {
    return new Date(year, month, day).toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Spending Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">Click a day to see its transactions</p>
      </div>

      <div className="card p-5">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="btn btn-secondary p-2"><ChevronLeft size={18} /></button>
          <h2 className="text-lg font-semibold text-foreground">{MONTH_NAMES[month]} {year}</h2>
          <button onClick={nextMonth} className="btn btn-secondary p-2"><ChevronRight size={18} /></button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = getCellDate(day);
            const txs = txByDate[dateStr] || [];
            const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative aspect-square rounded-md p-1.5 flex flex-col items-center transition-all text-sm ${
                  isSelected ? 'bg-primary text-primary-foreground' :
                  isToday ? 'bg-primary/10 text-primary font-bold' :
                  txs.length > 0 ? 'hover:bg-muted' : 'hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <span className="font-medium">{day}</span>
                {expenses > 0 && (
                  <span className={`text-xs mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-destructive'}`}>
                    {expenses >= 1000000
                      ? `${(expenses / 1000000).toFixed(1)}M`
                      : `${Math.round(expenses / 1000)}K`}
                  </span>
                )}
                {txs.length > 0 && (
                  <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Drawer */}
      {selectedDate && (
        <div className="card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
              {selectedTotal > 0 && <p className="text-sm text-muted-foreground">Total expenses: <span className="text-destructive font-medium">{formatCurrency(selectedTotal)}</span></p>}
            </div>
            <button onClick={() => setSelectedDate(null)} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><X size={18} /></button>
          </div>

          {selectedTxs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No transactions on this day.</p>
          ) : (
            <div className="divide-y divide-border">
              {selectedTxs.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[tx.category] || '#6B7280' }} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.category} · {tx.paymentMethod}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
