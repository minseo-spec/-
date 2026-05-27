import type { LedgerState } from '../types';

export const categories = ['식비', '교통', '쇼핑', '구독', '병원', '공부', '기타'] as const;

export const initialLedgerState: LedgerState = {
  totalAssets: 0,
  onboardingCompleted: false,
  dashboardOverrides: {},
  transactions: [],
  fixedExpenses: [],
  savingsGoals: [],
  monthlySummaries: [],
  monthlySettings: {},
  allowanceSettings: {
    enabled: false,
    cycleType: 'monthly',
    customDays: null,
    allowanceAmount: 0,
    startDate: '2026-01-01',
  },
  appSettings: {
    currency: 'KRW',
    selectedTheme: 'green',
  },
};
