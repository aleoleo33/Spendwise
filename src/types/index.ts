export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 'Salary' | 'Freelance' | 'Investment' | 'Bonus';

export type ExpenseCategory =
  | 'Food & Drinks'
  | 'Transportation'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Travel'
  | 'Other';

export type Category = IncomeCategory | ExpenseCategory;

export type PaymentMethod =
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'QRIS'
  | 'Bank Transfer'
  | 'E-Wallet';

export type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly';

export type AccountType = 'Bank' | 'E-Wallet' | 'Cash';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  account: string;
  paymentMethod: PaymentMethod;
  date: string; // ISO date string
  notes: string;
  status: 'completed' | 'pending';
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  color: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date string
  icon: string;
}

export interface Subscription {
  id: string;
  serviceName: string;
  price: number;
  billingCycle: BillingCycle;
  nextBillingDate: string; // ISO date string
  category: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  dateFormat: string;
  sidebarCollapsed: boolean;
}

export interface FinanceState {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  preferences: UserPreferences;
}
