import type { IncomeCategory, ExpenseCategory, PaymentMethod, BillingCycle } from '@/types';

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Investment',
  'Bonus',
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Drinks',
  'Transportation',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Other',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'QRIS',
  'Bank Transfer',
  'E-Wallet',
];

export const BILLING_CYCLES: BillingCycle[] = ['Monthly', 'Quarterly', 'Yearly'];

export const CATEGORY_COLORS: Record<string, string> = {
  'Salary': '#2563EB',
  'Freelance': '#7C3AED',
  'Investment': '#059669',
  'Bonus': '#D97706',
  'Food & Drinks': '#EF4444',
  'Transportation': '#3B82F6',
  'Shopping': '#EC4899',
  'Bills': '#F59E0B',
  'Entertainment': '#8B5CF6',
  'Health': '#10B981',
  'Education': '#6366F1',
  'Travel': '#14B8A6',
  'Other': '#6B7280',
};

export const ACCOUNT_COLORS = [
  '#2563EB', // Blue
  '#059669', // Green
  '#7C3AED', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export const CHART_COLORS = [
  '#2563EB',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatShortDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
  });
};

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight' },
  { label: 'Accounts', href: '/accounts', icon: 'Wallet' },
  { label: 'Budgets', href: '/budgets', icon: 'PieChart' },
  { label: 'Goals', href: '/goals', icon: 'Target' },
  { label: 'Subscriptions', href: '/subscriptions', icon: 'CreditCard' },
  { label: 'Calendar', href: '/calendar', icon: 'Calendar' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;
