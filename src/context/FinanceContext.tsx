'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import type { FinanceState, Transaction, Account, Budget, SavingsGoal, Subscription, UserPreferences } from '@/types';
import { MOCK_TRANSACTIONS, MOCK_ACCOUNTS, MOCK_BUDGETS, MOCK_GOALS, MOCK_SUBSCRIPTIONS, DEFAULT_PREFERENCES } from '@/lib/mock-data';

const STORAGE_KEY = 'spendwise-data';

// ─── Action Types ──────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_STATE'; payload: FinanceState }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> };

// ─── Initial State ─────────────────────────────────────────────────────────────
const initialState: FinanceState = {
  transactions: MOCK_TRANSACTIONS,
  accounts: MOCK_ACCOUNTS,
  budgets: MOCK_BUDGETS,
  goals: MOCK_GOALS,
  subscriptions: MOCK_SUBSCRIPTIONS,
  preferences: DEFAULT_PREFERENCES,
};

// ─── Reducer ───────────────────────────────────────────────────────────────────
function financeReducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_ACCOUNT':
      return { ...state, accounts: state.accounts.filter(a => a.id !== action.payload) };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(b =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'ADD_SUBSCRIPTION':
      return { ...state, subscriptions: [...state.subscriptions, action.payload] };
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(s =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'DELETE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.filter(s => s.id !== action.payload),
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────
interface FinanceContextValue {
  state: FinanceState;
  dispatch: React.Dispatch<Action>;
  // Computed values
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  netWorth: number;
  // Helpers
  getAccountBalance: (accountName: string) => number;
  getBudgetSpent: (category: string, month: string) => number;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FinanceState;
        dispatch({ type: 'SET_STATE', payload: parsed });
      }
    } catch {
      // Use defaults
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = useMemo(
    () =>
      state.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [state.transactions, currentMonth, currentYear]
  );

  const monthlyIncome = useMemo(
    () =>
      monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTransactions]
  );

  const monthlyExpenses = useMemo(
    () =>
      monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTransactions]
  );

  const totalBalance = useMemo(() => {
    const accountBalances = state.accounts.reduce((sum, a) => sum + a.initialBalance, 0);
    const totalIncome = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return accountBalances + totalIncome - totalExpense;
  }, [state.accounts, state.transactions]);

  const savingsRate = useMemo(
    () => (monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0),
    [monthlyIncome, monthlyExpenses]
  );

  const netWorth = useMemo(
    () => totalBalance + state.goals.reduce((sum, g) => sum + g.currentAmount, 0),
    [totalBalance, state.goals]
  );

  const getAccountBalance = useCallback(
    (accountName: string): number => {
      const account = state.accounts.find(a => a.name === accountName);
      if (!account) return 0;
      const income = state.transactions
        .filter(t => t.account === accountName && t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const expense = state.transactions
        .filter(t => t.account === accountName && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      return account.initialBalance + income - expense;
    },
    [state.accounts, state.transactions]
  );

  const getBudgetSpent = useCallback(
    (category: string, month: string): number => {
      return state.transactions
        .filter(t => {
          const d = new Date(t.date);
          const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return t.type === 'expense' && t.category === category && txMonth === month;
        })
        .reduce((s, t) => s + t.amount, 0);
    },
    [state.transactions]
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      netWorth,
      getAccountBalance,
      getBudgetSpent,
    }),
    [state, totalBalance, monthlyIncome, monthlyExpenses, savingsRate, netWorth, getAccountBalance, getBudgetSpent]
  );

  if (!isHydrated) {
    return null;
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
