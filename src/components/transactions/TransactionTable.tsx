'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/lib/constants';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Transaction } from '@/types';

interface Props {
  onEdit: (tx: Transaction) => void;
  limit?: number;
}

const PAGE_SIZE = 10;

export default function TransactionTable({ onEdit, limit }: Props) {
  const { state, dispatch } = useFinance();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = state.transactions.filter((t) => {
    const matchSearch =
      !search ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.account.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

  const paged = limit ? filtered.slice(0, limit) : filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  };

  return (
    <div className="animate-fade-in">
      {!limit && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            className="input flex-1"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setFilterType(type); setPage(0); }}
                className={`btn px-4 py-2 capitalize text-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Category</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Description</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Account</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Method</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Amount</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  No transactions found.
                </td>
              </tr>
            ) : (
              paged.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(tx.date)}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: `${CATEGORY_COLORS[tx.category] || '#6B7280'}20`,
                        color: CATEGORY_COLORS[tx.category] || '#6B7280',
                      }}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground max-w-[200px] truncate">{tx.description}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{tx.account}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{tx.paymentMethod}</td>
                  <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!limit && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-foreground">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="btn btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
