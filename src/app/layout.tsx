import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '@/context/FinanceContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SpendWise — Personal Finance Dashboard',
  description: 'Track your income, expenses, budgets, subscriptions, and savings goals with SpendWise — a modern personal finance dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen`}>
        <FinanceProvider>
          {children}
        </FinanceProvider>
      </body>
    </html>
  );
}
