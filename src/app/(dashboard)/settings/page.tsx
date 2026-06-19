'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Sun, Moon, Monitor, Trash2 } from 'lucide-react';

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export default function SettingsPage() {
  const { state, dispatch } = useFinance();
  const { theme, currency, dateFormat } = state.preferences;

  const set = (payload: Partial<typeof state.preferences>) =>
    dispatch({ type: 'UPDATE_PREFERENCES', payload });

  const clearData = () => {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      localStorage.removeItem('spendwise-data');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your SpendWise experience</p>
      </div>

      {/* Theme */}
      <div className="card p-5">
        <h2 className="text-base font-semibold mb-1">Appearance</h2>
        <p className="text-sm text-muted-foreground mb-4">Choose your preferred color theme</p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => set({ theme: value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-all ${
                theme === value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Icon size={22} className={theme === value ? 'text-primary' : 'text-muted-foreground'} />
              <span className={`text-sm font-medium ${theme === value ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="card p-5">
        <h2 className="text-base font-semibold mb-1">Currency</h2>
        <p className="text-sm text-muted-foreground mb-4">Select your primary currency</p>
        <div className="flex gap-3 flex-wrap">
          {['IDR', 'USD', 'EUR', 'SGD', 'MYR'].map((c) => (
            <button
              key={c}
              onClick={() => set({ currency: c })}
              className={`btn px-5 py-2 ${currency === c ? 'btn-primary' : 'btn-secondary'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Date Format */}
      <div className="card p-5">
        <h2 className="text-base font-semibold mb-1">Date Format</h2>
        <p className="text-sm text-muted-foreground mb-4">Choose how dates are displayed</p>
        <div className="flex gap-3 flex-wrap">
          {['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'].map((f) => (
            <button
              key={f}
              onClick={() => set({ dateFormat: f })}
              className={`btn px-5 py-2 font-mono text-sm ${dateFormat === f ? 'btn-primary' : 'btn-secondary'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-5 border-destructive/30">
        <h2 className="text-base font-semibold mb-1">Data Management</h2>
        <p className="text-sm text-muted-foreground mb-4">All data is stored locally in your browser</p>
        <div className="flex gap-3">
          <button onClick={clearData} className="btn btn-destructive gap-2">
            <Trash2 size={16} /> Reset to Defaults
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card p-5">
        <h2 className="text-base font-semibold mb-1">About SpendWise</h2>
        <p className="text-sm text-muted-foreground">Version 1.0.0 · Personal Finance Dashboard · Frontend only, data stored in localStorage</p>
      </div>
    </div>
  );
}
