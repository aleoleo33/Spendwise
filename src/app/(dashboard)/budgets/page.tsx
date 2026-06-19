'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/constants';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import type { Budget } from '@/types';

const schema = z.object({
  category: z.string().min(1),
  monthlyLimit: z.coerce.number().positive(),
  month: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

function generateId() { return Math.random().toString(36).substring(2, 11); }

function BudgetForm({ budget, onClose }: { budget?: Budget | null; onClose: () => void }) {
  const { dispatch } = useFinance();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: budget?.category ?? '', monthlyLimit: budget?.monthlyLimit ?? 0, month: budget?.month ?? currentMonth },
  });
  const onSubmit = (data: FormData) => {
    const b: Budget = { id: budget?.id ?? generateId(), ...data, category: data.category as Budget['category'] };
    dispatch({ type: budget ? 'UPDATE_BUDGET' : 'ADD_BUDGET', payload: b });
    onClose();
  };
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{budget ? 'Edit Budget' : 'Add Budget'}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select {...register('category')} className="input bg-background">
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-destructive mt-1">Required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Monthly Limit (Rp)</label>
            <input {...register('monthlyLimit')} type="number" className="input" />
            {errors.monthlyLimit && <p className="text-xs text-destructive mt-1">Must be positive</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Month</label>
            <input {...register('month')} type="month" className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{budget ? 'Save' : 'Add Budget'}</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function BudgetsPage() {
  const { state, dispatch, getBudgetSpent } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const handleDelete = (id: string) => {
    if (confirm('Delete this budget?')) dispatch({ type: 'DELETE_BUDGET', payload: id });
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">Set and track monthly spending limits</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn btn-primary">
          <Plus size={18} /> Add Budget
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.budgets.map(budget => {
          const spent = getBudgetSpent(budget.category, budget.month);
          const pct = Math.min(100, Math.round((spent / budget.monthlyLimit) * 100));
          const remaining = budget.monthlyLimit - spent;
          const isOver = spent > budget.monthlyLimit;
          const color = CATEGORY_COLORS[budget.category] || '#6B7280';

          return (
            <div key={budget.id} className="card p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-semibold text-foreground">{budget.category}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{budget.month}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(budget); setShowForm(true); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(budget.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className={`font-medium ${isOver ? 'text-destructive' : 'text-foreground'}`}>{formatCurrency(spent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="text-foreground">{formatCurrency(budget.monthlyLimit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className={`font-medium ${remaining < 0 ? 'text-destructive' : 'text-success'}`}>{formatCurrency(Math.abs(remaining))}{remaining < 0 ? ' over' : ''}</span>
                </div>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: isOver ? 'var(--destructive)' : color }}
                />
              </div>
              <p className={`text-xs mt-1.5 font-medium ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>{pct}% used</p>
            </div>
          );
        })}
      </div>

      {showForm && <BudgetForm budget={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
}
