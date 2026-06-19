'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, formatDate, BILLING_CYCLES } from '@/lib/constants';
import { Plus, Pencil, Trash2, X, RefreshCw } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Subscription } from '@/types';

const SERVICE_ICONS: Record<string, string> = {
  Netflix: '🎬', Spotify: '🎵', 'YouTube Premium': '📺', ChatGPT: '🤖',
  'ChatGPT Plus': '🤖', iCloud: '☁️', 'iCloud 200GB': '☁️',
  Default: '📦',
};

const schema = z.object({
  serviceName: z.string().min(1),
  price: z.preprocess((v) => Number(v), z.number().positive()),
  billingCycle: z.enum(['Monthly', 'Quarterly', 'Yearly']),
  nextBillingDate: z.string().min(1),
  category: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

function generateId() { return Math.random().toString(36).substring(2, 11); }

function SubForm({ sub, onClose }: { sub?: Subscription | null; onClose: () => void }) {
  const { dispatch } = useFinance();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { serviceName: sub?.serviceName ?? '', price: sub?.price ?? 0, billingCycle: sub?.billingCycle ?? 'Monthly', nextBillingDate: sub?.nextBillingDate?.split('T')[0] ?? '', category: sub?.category ?? 'Entertainment' },
  });
  const onSubmit = (data: FormData) => {
    const s: Subscription = { id: sub?.id ?? generateId(), ...data };
    dispatch({ type: sub ? 'UPDATE_SUBSCRIPTION' : 'ADD_SUBSCRIPTION', payload: s });
    onClose();
  };
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{sub ? 'Edit Subscription' : 'Add Subscription'}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Service Name</label>
            <input {...register('serviceName')} className="input" placeholder="e.g. Netflix" />
            {errors.serviceName && <p className="text-xs text-destructive mt-1">Required</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Price (Rp)</label>
              <input {...register('price')} type="number" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Billing Cycle</label>
              <select {...register('billingCycle')} className="input bg-background">
                {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Next Billing Date</label>
            <input {...register('nextBillingDate')} type="date" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select {...register('category')} className="input bg-background">
              {['Entertainment', 'Education', 'Bills', 'Productivity', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{sub ? 'Save' : 'Add Subscription'}</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function SubscriptionsPage() {
  const { state, dispatch } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);

  const totalMonthly = state.subscriptions.reduce((sum, s) => {
    if (s.billingCycle === 'Monthly') return sum + s.price;
    if (s.billingCycle === 'Quarterly') return sum + s.price / 3;
    if (s.billingCycle === 'Yearly') return sum + s.price / 12;
    return sum;
  }, 0);

  const handleDelete = (id: string) => {
    if (confirm('Delete this subscription?')) dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id });
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track recurring payments · <span className="text-foreground font-medium">{formatCurrency(Math.round(totalMonthly))}/mo</span>
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn btn-primary">
          <Plus size={18} /> Add Subscription
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.subscriptions.map(sub => {
          const icon = SERVICE_ICONS[sub.serviceName] || SERVICE_ICONS.Default;
          const daysLeft = Math.ceil((new Date(sub.nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const monthlyEq = sub.billingCycle === 'Monthly' ? sub.price : sub.billingCycle === 'Quarterly' ? sub.price / 3 : sub.price / 12;

          return (
            <div key={sub.id} className="card p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <p className="font-semibold text-foreground">{sub.serviceName}</p>
                    <p className="text-xs text-muted-foreground">{sub.category}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(sub); setShowForm(true); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(sub.price)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <RefreshCw size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{sub.billingCycle}</span>
                    {sub.billingCycle !== 'Monthly' && (
                      <span className="text-xs text-muted-foreground">· ~{formatCurrency(Math.round(monthlyEq))}/mo</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Next billing</p>
                  <p className={`text-sm font-medium ${daysLeft <= 7 ? 'text-warning' : 'text-foreground'}`}>
                    {daysLeft > 0 ? `in ${daysLeft}d` : 'Today'}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(sub.nextBillingDate)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && <SubForm sub={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
}
