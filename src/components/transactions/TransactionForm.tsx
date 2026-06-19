'use client';

import React, { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS
} from '@/lib/constants';
import type { Transaction } from '@/types';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.preprocess((v) => Number(v), z.number().positive('Amount must be positive')),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  account: z.string().min(1, 'Account is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  transaction?: Transaction | null;
  onClose: () => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

export default function TransactionForm({ transaction, onClose }: Props) {
  const { state, dispatch } = useFinance();
  const isEditing = !!transaction;

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      type: transaction?.type ?? 'expense',
      amount: transaction?.amount ?? undefined,
      category: transaction?.category ?? '',
      description: transaction?.description ?? '',
      account: transaction?.account ?? state.accounts[0]?.name ?? '',
      paymentMethod: transaction?.paymentMethod ?? 'QRIS',
      date: transaction?.date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      notes: transaction?.notes ?? '',
    },
  });

  const txType = watch('type');
  const categories = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    setValue('category', '');
  }, [txType, setValue]);

  const onSubmit = (data: FormData) => {
    const tx: Transaction = {
      id: transaction?.id ?? generateId(),
      type: data.type,
      amount: data.amount,
      category: data.category as Transaction['category'],
      description: data.description,
      account: data.account,
      paymentMethod: data.paymentMethod as Transaction['paymentMethod'],
      date: new Date(data.date).toISOString(),
      notes: data.notes ?? '',
      status: 'completed',
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: tx });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: tx });
    }
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal p-6" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={`btn py-2.5 capitalize ${txType === t ? (t === 'income' ? 'bg-success text-white' : 'bg-destructive text-white') : 'btn-secondary'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Amount (Rp)</label>
            <input
              {...register('amount')}
              type="number"
              className="input"
              placeholder="e.g. 150000"
            />
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
            <select {...register('category')} className="input bg-background">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <input {...register('description')} className="input" placeholder="e.g. Lunch at Warteg" />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Account</label>
              <select {...register('account')} className="input bg-background">
                {state.accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Payment</label>
              <select {...register('paymentMethod')} className="input bg-background">
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
            <input {...register('date')} type="date" className="input" />
            {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes (optional)</label>
            <textarea {...register('notes')} className="input resize-none" rows={2} placeholder="Any additional notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
              {isEditing ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
