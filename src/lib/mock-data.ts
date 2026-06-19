import type { Transaction, Account, Budget, SavingsGoal, Subscription } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// ─── Accounts ──────────────────────────────────────────────────────────────────
export const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'BCA', type: 'Bank', initialBalance: 8500000, color: '#2563EB' },
  { id: 'acc-2', name: 'Jago', type: 'Bank', initialBalance: 3200000, color: '#059669' },
  { id: 'acc-3', name: 'GoPay', type: 'E-Wallet', initialBalance: 500000, color: '#7C3AED' },
  { id: 'acc-4', name: 'Cash', type: 'Cash', initialBalance: 300000, color: '#F59E0B' },
];

// ─── Budgets ───────────────────────────────────────────────────────────────────
const currentMonth = new Date().toISOString().slice(0, 7);

export const MOCK_BUDGETS: Budget[] = [
  { id: 'bud-1', category: 'Food & Drinks', monthlyLimit: 1000000, month: currentMonth },
  { id: 'bud-2', category: 'Transportation', monthlyLimit: 500000, month: currentMonth },
  { id: 'bud-3', category: 'Shopping', monthlyLimit: 800000, month: currentMonth },
  { id: 'bud-4', category: 'Bills', monthlyLimit: 1200000, month: currentMonth },
  { id: 'bud-5', category: 'Entertainment', monthlyLimit: 400000, month: currentMonth },
  { id: 'bud-6', category: 'Health', monthlyLimit: 300000, month: currentMonth },
  { id: 'bud-7', category: 'Education', monthlyLimit: 500000, month: currentMonth },
  { id: 'bud-8', category: 'Travel', monthlyLimit: 600000, month: currentMonth },
];

// ─── Savings Goals ─────────────────────────────────────────────────────────────
export const MOCK_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'MacBook Pro',
    targetAmount: 30000000,
    currentAmount: 18000000,
    deadline: '2026-12-31',
    icon: '💻',
  },
  {
    id: 'goal-2',
    name: 'Emergency Fund',
    targetAmount: 50000000,
    currentAmount: 32000000,
    deadline: '2027-06-30',
    icon: '🛡️',
  },
  {
    id: 'goal-3',
    name: 'Bali Vacation',
    targetAmount: 10000000,
    currentAmount: 4500000,
    deadline: '2026-09-01',
    icon: '✈️',
  },
  {
    id: 'goal-4',
    name: 'New Phone',
    targetAmount: 15000000,
    currentAmount: 9000000,
    deadline: '2026-08-15',
    icon: '📱',
  },
];

// ─── Subscriptions ─────────────────────────────────────────────────────────────
export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    serviceName: 'Netflix',
    price: 120000,
    billingCycle: 'Monthly',
    nextBillingDate: '2026-07-15',
    category: 'Entertainment',
  },
  {
    id: 'sub-2',
    serviceName: 'Spotify',
    price: 55000,
    billingCycle: 'Monthly',
    nextBillingDate: '2026-07-01',
    category: 'Entertainment',
  },
  {
    id: 'sub-3',
    serviceName: 'YouTube Premium',
    price: 69000,
    billingCycle: 'Monthly',
    nextBillingDate: '2026-07-10',
    category: 'Entertainment',
  },
  {
    id: 'sub-4',
    serviceName: 'ChatGPT Plus',
    price: 320000,
    billingCycle: 'Monthly',
    nextBillingDate: '2026-07-05',
    category: 'Education',
  },
  {
    id: 'sub-5',
    serviceName: 'iCloud 200GB',
    price: 45000,
    billingCycle: 'Monthly',
    nextBillingDate: '2026-07-20',
    category: 'Bills',
  },
];

// ─── Transactions ──────────────────────────────────────────────────────────────
const descriptions = {
  'Food & Drinks': ['Starbucks Coffee', 'Makan Siang Warteg', 'GrabFood Order', 'McDonalds', 'Kopi Kenangan', 'Bakso Pak Kumis', 'Nasi Padang', 'Pizza Hut', 'Es Teh Jumbo', 'Sate Ayam'],
  'Transportation': ['Gojek Ride', 'Grab Car', 'Pertamina Fuel', 'MRT Jakarta', 'Transjakarta', 'Parkir Mall', 'Tol Jagorawi'],
  'Shopping': ['Uniqlo T-Shirt', 'Tokopedia Order', 'Shopee Purchase', 'Miniso Accessories', 'IKEA Home', 'Book Store'],
  'Bills': ['PLN Electricity', 'PDAM Water', 'Internet IndiHome', 'Phone Bill Telkomsel', 'Apartment Rent'],
  'Entertainment': ['Netflix Sub', 'Cinema XXI', 'Steam Game', 'Spotify Premium', 'Concert Ticket'],
  'Health': ['Apotek K-24', 'Gym Membership', 'Medical Checkup', 'Vitamin Supplements'],
  'Education': ['Udemy Course', 'Book Purchase', 'Online Workshop', 'Skill Academy'],
  'Travel': ['Hotel Booking', 'Flight Ticket', 'Traveloka Package', 'Travel Insurance'],
  'Other': ['ATM Admin Fee', 'Transfer Fee', 'Charity Donation', 'Gift for Friend'],
  'Salary': ['Monthly Salary', 'Salary Payment'],
  'Freelance': ['Web Dev Project', 'Design Freelance', 'Consulting Fee', 'Content Writing'],
  'Investment': ['Stock Dividend', 'Crypto Gains', 'Mutual Fund Return'],
  'Bonus': ['Year End Bonus', 'Performance Bonus', 'Referral Bonus'],
};

const accountNames = ['BCA', 'Jago', 'GoPay', 'Cash'];
const paymentMethods = ['Cash', 'Debit Card', 'Credit Card', 'QRIS', 'Bank Transfer', 'E-Wallet'] as const;
const expenseCategories = ['Food & Drinks', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Travel', 'Other'] as const;
const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Bonus'] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) / 1000) * 1000;
}

function generateTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  const now = new Date();

  // Generate 12 months of income (regular salary + occasional others)
  for (let m = 11; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);

    // Monthly salary (always on the 25th)
    txs.push({
      id: generateId(),
      type: 'income',
      amount: 8000000,
      category: 'Salary',
      description: 'Monthly Salary',
      account: 'BCA',
      paymentMethod: 'Bank Transfer',
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 25).toISOString(),
      notes: '',
      status: 'completed',
    });

    // Occasional freelance income
    if (Math.random() > 0.4) {
      txs.push({
        id: generateId(),
        type: 'income',
        amount: randomAmount(1000000, 5000000),
        category: randomItem(incomeCategories.filter(c => c !== 'Salary')),
        description: randomItem(descriptions['Freelance']),
        account: randomItem(accountNames),
        paymentMethod: 'Bank Transfer',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString(),
        notes: '',
        status: 'completed',
      });
    }

    // Generate 8-12 expenses per month
    const numExpenses = Math.floor(Math.random() * 5) + 8;
    for (let e = 0; e < numExpenses; e++) {
      const cat = randomItem(expenseCategories);
      const descList = descriptions[cat] || ['General Expense'];
      const amountRanges: Record<string, [number, number]> = {
        'Food & Drinks': [15000, 150000],
        'Transportation': [10000, 200000],
        'Shopping': [50000, 500000],
        'Bills': [100000, 500000],
        'Entertainment': [30000, 300000],
        'Health': [50000, 500000],
        'Education': [100000, 800000],
        'Travel': [200000, 2000000],
        'Other': [10000, 200000],
      };
      const [min, max] = amountRanges[cat] || [10000, 200000];

      txs.push({
        id: generateId(),
        type: 'expense',
        amount: randomAmount(min, max),
        category: cat,
        description: randomItem(descList),
        account: randomItem(accountNames),
        paymentMethod: randomItem(paymentMethods),
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString(),
        notes: '',
        status: 'completed',
      });
    }
  }

  // Sort by date descending
  txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return txs;
}

export const MOCK_TRANSACTIONS: Transaction[] = generateTransactions();

export const DEFAULT_PREFERENCES = {
  theme: 'dark' as const,
  currency: 'IDR',
  dateFormat: 'dd/MM/yyyy',
  sidebarCollapsed: false,
};
