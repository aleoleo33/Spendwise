'use client';

import React, { useState } from 'react';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionForm from '@/components/transactions/TransactionForm';
import type { Transaction } from '@/types';
import { Plus } from 'lucide-react';

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const openEdit = (tx: Transaction) => { setEditingTx(tx); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingTx(null); };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all your income and expenses</p>
        </div>
        <button onClick={() => { setEditingTx(null); setShowForm(true); }} className="btn btn-primary">
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      <div className="card p-5">
        <TransactionTable onEdit={openEdit} />
      </div>

      {showForm && <TransactionForm transaction={editingTx} onClose={closeForm} />}
    </div>
  );
}
