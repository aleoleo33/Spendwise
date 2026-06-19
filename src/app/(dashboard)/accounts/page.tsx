'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/constants';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Account } from '@/types';
import { ACCOUNT_COLORS } from '@/lib/constants';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['Bank', 'E-Wallet', 'Cash']),
  initialBalance: z.preprocess((v) => Number(v), z.number().min(0)),
  color: z.string(),
});
type FormData = z.infer<typeof schema>;

function generateId() { return Math.random().toString(36).substring(2, 11); }

function AccountForm({ account, onClose }: { account?: Account | null; onClose: () => void }) {
  const { dispatch } = useFinance();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: account?.name ?? '',
      type: account?.type ?? 'Bank',
      initialBalance: account?.initialBalance ?? 0,
      color: account?.color ?? ACCOUNT_COLORS[0],
    },
  });
  const selectedColor = watch('color');

  const onSubmit = (data: FormData) => {
    const acc: Account = { id: account?.id ?? generateId(), ...data };
    dispatch({ type: account ? 'UPDATE_ACCOUNT' : 'ADD_ACCOUNT', payload: acc });
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">{account ? 'Edit Account' : 'Add Account'}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Account Name</label>
            <input {...register('name')} className="input" placeholder="e.g. BCA, GoPay" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select {...register('type')} className="input bg-background">
              {['Bank', 'E-Wallet', 'Cash'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Initial Balance (Rp)</label>
            <input {...register('initialBalance')} type="number" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setValue('color', c)}
                  style={{ background: c }}
                  className={`w-8 h-8 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{account ? 'Save' : 'Add Account'}</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function AccountsPage() {
  const { state, dispatch, getAccountBalance } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Delete this account?')) dispatch({ type: 'DELETE_ACCOUNT', payload: id });
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your bank accounts and wallets</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn btn-primary">
          <Plus size={18} /> Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {state.accounts.map(acc => {
          const balance = getAccountBalance(acc.name);
          const txCount = state.transactions.filter(t => t.account === acc.name).length;
          return (
            <div key={acc.id} className="card p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold text-sm" style={{ background: acc.color }}>
                  {acc.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(acc); setShowForm(true); }} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(acc.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="font-semibold text-foreground">{acc.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{acc.type}</p>
              <p className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(balance)}</p>
              <p className="text-xs text-muted-foreground mt-1">{txCount} transactions</p>
            </div>
          );
        })}
      </div>

      {showForm && <AccountForm account={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
}
