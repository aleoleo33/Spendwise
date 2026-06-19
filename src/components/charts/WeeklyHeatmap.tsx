'use client';

import React, { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';

function getWeekLabel(weekIndex: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[weekIndex];
}

export default function WeeklyHeatmap() {
  const { state } = useFinance();

  const heatmapData = useMemo(() => {
    const now = new Date();
    const weeks: { label: string; days: { date: string; amount: number; count: number }[] }[] = [];

    // Build last 12 weeks of data (Mon-Sun grid, 7 cols x 12 rows)
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - w * 7);
      const days = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + d);
        const dateStr = day.toISOString().split('T')[0];
        days.push({ date: dateStr, amount: 0, count: 0 });
      }
      weeks.push({
        label: weekStart.toLocaleString('en-US', { month: 'short', day: 'numeric' }),
        days,
      });
    }

    state.transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const dateStr = t.date.split('T')[0];
        weeks.forEach((week) => {
          const day = week.days.find((d) => d.date === dateStr);
          if (day) {
            day.amount += t.amount;
            day.count += 1;
          }
        });
      });

    return weeks;
  }, [state.transactions]);

  const maxAmount = Math.max(...heatmapData.flatMap((w) => w.days.map((d) => d.amount)));

  function getColor(amount: number): string {
    if (amount === 0) return 'var(--muted)';
    const pct = amount / maxAmount;
    if (pct < 0.2) return '#BFDBFE';
    if (pct < 0.4) return '#93C5FD';
    if (pct < 0.6) return '#60A5FA';
    if (pct < 0.8) return '#3B82F6';
    return '#1D4ED8';
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card p-5 animate-fade-in">
      <h3 className="text-base font-semibold text-foreground mb-1">Weekly Spending Activity</h3>
      <p className="text-xs text-muted-foreground mb-4">Last 12 weeks — darker = more spending</p>

      {/* Day labels */}
      <div className="flex gap-1 mb-1 pl-14">
        {dayLabels.map((d) => (
          <div key={d} className="w-7 text-center text-xs text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="flex flex-col gap-1">
        {heatmapData.map((week) => (
          <div key={week.label} className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground w-12 shrink-0 text-right pr-2">{week.label}</span>
            {week.days.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: Rp ${day.amount.toLocaleString('id-ID')} (${day.count} txn)`}
                style={{ backgroundColor: getColor(day.amount) }}
                className="w-7 h-7 rounded-sm cursor-default transition-opacity hover:opacity-70"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-muted-foreground">Less</span>
        {['var(--muted)', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#1D4ED8'].map((c, i) => (
          <div key={i} style={{ backgroundColor: c }} className="w-5 h-5 rounded-sm" />
        ))}
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  );
}
