'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SavingsGoal } from '@/types';

const GOAL_ICONS = ['🏠', '💻', '🚗', '✈️', '📱', '🛡️', '📚', '🎓', '💍', '🌊', '🎮', '💪'];

const schema = z.object({
  name: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0),
  deadline: z.string().min(1),
  icon: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

function generateId() { return Math.random().toString(36).substring(2, 11); }

function GoalForm({ goal, onClose }: { goal?: SavingsGoal | null; onClose: () => void }) {
  const { dispatch } = useFinance();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: goal?.name ?? '', targetAmount: goal?.targetAmount ?? 0, currentAmount: goal?.currentAmount ?? 0, deadline: goal?.deadline?.split('T')[0] ?? '', icon: goal?.icon ?? '🎯' },
  });
  const selectedIcon = watch('icon');
  const onSubmit = (data: FormData) => {
    const g: SavingsGoal = { id: goal?.id ?? generateId(), ...data };
    dispatch({ type: goal ? 'UPDATE_GOAL' : 'ADD_GOAL', payload: g });
    onClose();
  };
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{goal ? 'Edit Goal' : 'Add Goal'}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_ICONS.map(ico => (
                <button key={ico} type="button" onClick={() => setValue('icon', ico)}
                  className={`w-9 h-9 text-xl rounded-md border-2 transition-all ${selectedIcon === ico ? 'border-primary bg-primary/10' : 'border-transparent hover:border-border'}`}
                >{ico}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Goal Name</label>
            <input {...register('name')} className="input" placeholder="e.g. MacBook Pro" />
            {errors.name && <p className="text-xs text-destructive mt-1">Required</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Target (Rp)</label>
              <input {...register('targetAmount')} type="number" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Saved (Rp)</label>
              <input {...register('currentAmount')} type="number" className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Deadline</label>
            <input {...register('deadline')} type="date" className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{goal ? 'Save' : 'Add Goal'}</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function GoalsPage() {
  const { state, dispatch } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Delete this goal?')) dispatch({ type: 'DELETE_GOAL', payload: id });
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Savings Goals</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your saving targets</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn btn-primary">
          <Plus size={18} /> Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {state.goals.map(goal => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = goal.targetAmount - goal.currentAmount;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <div key={goal.id} className="card p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{goal.icon}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(goal); setShowForm(true); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-3">{goal.name}</h3>

              {/* Progress Ring */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="var(--muted)" strokeWidth="8" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke="var(--primary)" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
                      className="transition-all duration-700"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{pct}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved</span>
                  <span className="font-medium text-success">{formatCurrency(goal.currentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">{formatCurrency(remaining)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className={`font-medium text-xs ${daysLeft < 30 ? 'text-warning' : 'text-muted-foreground'}`}>
                    {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && <GoalForm goal={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
}
