import { useEffect, useMemo, useState } from 'react';
import { initialLedgerState } from '../data/mockData';
import type { AllowanceSettings, AppSettings, DashboardOverrideKey, FixedExpense, LedgerState, MonthlySetting, SavingsGoal, Transaction } from '../types';

const STORAGE_KEY = 'remain-ledger';
const LEGACY_STORAGE_KEY = ['finance', 'survival', 'ledger'].join('-');

export function useLedger() {
  const [state, setState] = useState<LedgerState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) as LedgerState : initialLedgerState;
    return stripSeedData({
      ...parsed,
      dashboardOverrides: parsed.dashboardOverrides ?? {},
      monthlySettings: parsed.monthlySettings ?? {},
      allowanceSettings: parsed.allowanceSettings ?? initialLedgerState.allowanceSettings,
      appSettings: parsed.appSettings ?? initialLedgerState.appSettings,
    });
  });

  // Keep the mock frontend app persistent until a real backend is connected.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [state]);

  const actions = useMemo(() => ({
    setTotalAssets: (totalAssets: number) => setState((current) => ({ ...current, totalAssets })),
    setDashboardOverride: (key: DashboardOverrideKey, value: number) =>
      setState((current) => ({
        ...current,
        dashboardOverrides: { ...current.dashboardOverrides, [key]: value },
      })),
    addTransaction: (transaction: Omit<Transaction, 'id'>) =>
      setState((current) => ({
        ...current,
        transactions: [{ ...transaction, id: crypto.randomUUID() }, ...current.transactions],
      })),
    deleteTransaction: (id: string) =>
      setState((current) => ({
        ...current,
        transactions: current.transactions.filter((transaction) => transaction.id !== id),
      })),
    updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) =>
      setState((current) => ({
        ...current,
        transactions: current.transactions.map((item) =>
          item.id === id ? { ...transaction, id } : item,
        ),
      })),
    updateMonthlySetting: (monthKey: string, setting: MonthlySetting) =>
      setState((current) => ({
        ...current,
        monthlySettings: {
          ...current.monthlySettings,
          [monthKey]: {
            ...current.monthlySettings[monthKey],
            ...setting,
          },
        },
      })),
    updateAllowanceSettings: (settings: Partial<AllowanceSettings>) =>
      setState((current) => ({
        ...current,
        allowanceSettings: { ...current.allowanceSettings, ...settings },
      })),
    updateAppSettings: (settings: Partial<AppSettings>) =>
      setState((current) => {
        const next = {
          ...current,
          appSettings: { ...current.appSettings, ...settings },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      }),
    addFixedExpense: (expense: Omit<FixedExpense, 'id'>) =>
      setState((current) => ({
        ...current,
        fixedExpenses: [{ ...expense, id: crypto.randomUUID() }, ...current.fixedExpenses],
      })),
    toggleFixedExpense: (id: string) =>
      setState((current) => ({
        ...current,
        fixedExpenses: current.fixedExpenses.map((expense) =>
          expense.id === id ? { ...expense, active: !expense.active } : expense,
        ),
      })),
    deleteFixedExpense: (id: string) =>
      setState((current) => ({
        ...current,
        fixedExpenses: current.fixedExpenses.filter((expense) => expense.id !== id),
      })),
    addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) =>
      setState((current) => ({
        ...current,
        savingsGoals: [{ ...goal, id: crypto.randomUUID() }, ...current.savingsGoals],
      })),
    updateSavingsGoal: (id: string, currentAmount: number) =>
      setState((current) => ({
        ...current,
        savingsGoals: current.savingsGoals.map((goal) =>
          goal.id === id ? { ...goal, currentAmount } : goal,
        ),
      })),
    reset: () => setState(initialLedgerState),
  }), []);

  return { state, actions };
}

function stripSeedData(state: LedgerState): LedgerState {
  const transactions = state.transactions
    .filter((item) => !item.id.startsWith('t-'))
    .map((item) => ({ ...item, title: item.title ?? item.memo ?? item.category }));
  const fixedExpenses = state.fixedExpenses
    .filter((item) => !item.id.startsWith('f-'))
    .map((item) => ({ ...item, paymentDay: item.paymentDay ?? 1 }));
  const savingsGoals = state.savingsGoals.filter((item) => !item.id.startsWith('g-'));
  const monthlySummaries = state.monthlySummaries.filter((item) => !['2026-01', '2026-02', '2026-03', '2026-04'].includes(item.month));
  const hasUserData = transactions.length > 0 || fixedExpenses.length > 0 || savingsGoals.length > 0 || monthlySummaries.length > 0;
  const dashboardOverrides = { ...state.dashboardOverrides };
  delete dashboardOverrides.fixedExpenses;
  const hasOverrides = Object.keys(dashboardOverrides).length > 0;

  return {
    ...state,
    dashboardOverrides,
    monthlySettings: state.monthlySettings ?? {},
    allowanceSettings: state.allowanceSettings ?? initialLedgerState.allowanceSettings,
    appSettings: state.appSettings ?? initialLedgerState.appSettings,
    totalAssets: !hasUserData && !hasOverrides && state.totalAssets === 8420000 ? 0 : state.totalAssets,
    transactions,
    fixedExpenses,
    savingsGoals,
    monthlySummaries,
  };
}
