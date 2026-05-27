import type { Category, DashboardMetrics, FixedExpense, HeatmapLevel, LedgerState, MonthlySummary, SpendingLevel, SpendingRiskLevel, ThemeName, Transaction } from '../types';
import { currentMonthKey, getMonthDays, getRemainingDaysInMonth } from './date';

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const getTransactionsByMonth = (transactions: Transaction[], monthKey: string) =>
  transactions.filter((transaction) => transaction.date.startsWith(monthKey));

export const getTransactionsByDate = (transactions: Transaction[], dateKey: string) =>
  transactions.filter((transaction) => transaction.date === dateKey);

export const getActiveFixedExpenses = (fixedExpenses: FixedExpense[]) =>
  fixedExpenses.filter((expense) => expense.active);

export const getFixedExpenseTotal = (fixedExpenses: FixedExpense[], override?: number) =>
  override ?? sum(getActiveFixedExpenses(fixedExpenses).map((expense) => expense.amount));

export const getMonthlyIncome = (transactions: Transaction[], monthKey: string, override?: number) =>
  override ?? sum(getTransactionsByMonth(transactions, monthKey).filter((item) => item.type === 'income').map((item) => item.amount));

export const getVariableMonthlyExpenses = (transactions: Transaction[], monthKey: string, override?: number) =>
  override ?? sum(getTransactionsByMonth(transactions, monthKey).filter((item) => item.type === 'expense').map((item) => item.amount));

export const getMonthlyExpenses = (
  transactions: Transaction[],
  fixedExpenses: FixedExpense[],
  monthKey: string,
  livingBudgetOverride?: number,
  fixedExpenseOverride?: number,
) => getVariableMonthlyExpenses(transactions, monthKey, livingBudgetOverride) + getFixedExpenseTotal(fixedExpenses, fixedExpenseOverride);

export const calculateAverageMonthlyExpense = (monthlySummaries: MonthlySummary[]) => {
  if (monthlySummaries.length === 0) return 0;
  return sum(monthlySummaries.map((summary) => summary.expenses)) / monthlySummaries.length;
};

export const getHighestSpendingMonth = (monthlySummaries: MonthlySummary[]) =>
  monthlySummaries.reduce<MonthlySummary | undefined>((highest, summary) =>
    !highest || summary.expenses > highest.expenses ? summary : highest, undefined);

export const getLowestSpendingMonth = (monthlySummaries: MonthlySummary[]) =>
  monthlySummaries.reduce<MonthlySummary | undefined>((lowest, summary) =>
    !lowest || summary.expenses < lowest.expenses ? summary : lowest, undefined);

export const getMonthlySpendingLevel = (
  monthExpense: number,
  averageExpense: number,
  highestExpense: number,
  lowestExpense: number,
): SpendingLevel => {
  if (highestExpense === lowestExpense) return 'average';
  if (monthExpense === highestExpense) return 'highest';
  if (monthExpense === lowestExpense) return 'lowest';
  if (monthExpense < averageExpense * 0.92) return 'low';
  if (monthExpense > averageExpense * 1.08) return 'high';
  return 'average';
};

export const getDashboardMetrics = (state: LedgerState, date = new Date()): DashboardMetrics => {
  const monthKey = currentMonthKey(date);
  const fixedExpenses = getFixedExpenseTotal(state.fixedExpenses);
  const monthlyIncome = getMonthlyIncome(state.transactions, monthKey, state.dashboardOverrides.monthlyIncome);
  const monthlyLivingBudget = getVariableMonthlyExpenses(state.transactions, monthKey, state.dashboardOverrides.monthlyLivingBudget);
  const monthlyExpenses = monthlyLivingBudget + fixedExpenses;
  const possibleSavings = monthlyIncome - monthlyExpenses;
  const monthlySavingsGoal = state.dashboardOverrides.monthlySavingsGoal ?? Math.max(possibleSavings, 0);
  const remainingLivingBudget = Math.max(monthlyIncome - monthlyExpenses, 0);
  const calculatedFreeMoney = state.totalAssets + monthlyIncome - monthlyExpenses;
  const freeMoney = state.dashboardOverrides.freeMoney ?? calculatedFreeMoney;
  const averageMonthlyLivingCost = state.dashboardOverrides.averageMonthlyLivingCost ?? monthlyExpenses;

  return {
    totalAssets: state.totalAssets,
    monthlyIncome,
    monthlyLivingBudget,
    fixedExpenses,
    monthlyExpenses,
    monthlySavingsGoal,
    possibleSavings,
    remainingLivingBudget,
    freeMoney,
    averageMonthlyLivingCost,
    survivalMonths: averageMonthlyLivingCost > 0 ? state.totalAssets / averageMonthlyLivingCost : 0,
    safeDailyBudget: remainingLivingBudget / getRemainingDaysInMonth(date),
  };
};

export const getCategoryTotals = (transactions: Transaction[], monthKey: string) => {
  const totals = new Map<Category, number>();
  getTransactionsByMonth(transactions, monthKey)
    .filter((item) => item.type === 'expense')
    .forEach((item) => totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount));
  return totals;
};

export const buildMonthlySummaries = (state: LedgerState, year: number): MonthlySummary[] =>
  Array.from({ length: 12 }, (_, index) => {
    const monthKey = `${year}-${String(index + 1).padStart(2, '0')}`;
    const existing = state.monthlySummaries.find((summary) => summary.month === monthKey);
    const monthTransactions = getTransactionsByMonth(state.transactions, monthKey);
    const isCurrentMonth = monthKey === currentMonthKey();

    if (monthTransactions.length === 0 && existing && !isCurrentMonth) {
      return existing;
    }

    const income = getMonthlyIncome(
      state.transactions,
      monthKey,
      isCurrentMonth ? state.dashboardOverrides.monthlyIncome : undefined,
    ) || existing?.income || 0;
    const fixedExpenses = getFixedExpenseTotal(
      state.fixedExpenses,
      undefined,
    );
    const livingBudget = getVariableMonthlyExpenses(
      state.transactions,
      monthKey,
      isCurrentMonth ? state.dashboardOverrides.monthlyLivingBudget : undefined,
    );
    const expenses = livingBudget + fixedExpenses || existing?.expenses || fixedExpenses;

    return {
      month: monthKey,
      income,
      expenses,
      savings: income - expenses,
      fixedExpenses,
    };
  });

// Scenario knobs are intentionally small and explicit so later backend data can reuse the same math.
export const forecastSurvival = (assets: number, monthlyExpenses: number, incomeChangeRate = 0, expenseChangeRate = 0, fixedIncrease = 0) => {
  const adjustedExpenses = Math.max(monthlyExpenses * (1 + expenseChangeRate) + fixedIncrease, 1);
  const incomeStress = incomeChangeRate < 0 ? Math.abs(incomeChangeRate) * adjustedExpenses : 0;
  return assets / (adjustedExpenses + incomeStress);
};

export const getGoalMonthlyNeed = (targetAmount: number, currentAmount: number, targetDate: string, today = new Date()) => {
  const target = new Date(`${targetDate}T00:00:00`);
  const monthGap = Math.max((target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth(), 1);
  return Math.max(targetAmount - currentAmount, 0) / monthGap;
};

export const getDailyCalendarCells = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const days = getMonthDays(monthKey);
  return [
    ...Array.from({ length: firstDay }, () => ''),
    ...Array.from({ length: days }, (_, index) => `${monthKey}-${String(index + 1).padStart(2, '0')}`),
  ];
};

export const calculateRecentAverageExpense = (transactions: Transaction[], days = 7, today = new Date()) => {
  const start = new Date(today);
  start.setDate(today.getDate() - days + 1);
  const startKey = start.toISOString().slice(0, 10);
  const todayKey = today.toISOString().slice(0, 10);
  const total = transactions
    .filter((item) => item.type === 'expense' && item.date >= startKey && item.date <= todayKey)
    .reduce((sumValue, item) => sumValue + item.amount, 0);
  return total / Math.max(days, 1);
};

export const calculateDailySafeAmount = (totalRemaining: number, daysRemaining: number) =>
  totalRemaining / Math.max(daysRemaining, 1);

export const getSpendingRiskLevel = (recentAverageExpense: number, safeDailyAmount: number): SpendingRiskLevel => {
  if (safeDailyAmount <= 0) return 'danger';
  if (recentAverageExpense > safeDailyAmount * 1.25) return 'danger';
  if (recentAverageExpense > safeDailyAmount * 0.9) return 'caution';
  return 'safe';
};

export const getSpendingRiskMessage = (riskLevel: SpendingRiskLevel) => {
  if (riskLevel === 'danger') return '현재 속도라면 예상보다 빨리 부족해질 수 있어요.';
  if (riskLevel === 'caution') return '조금만 조절하면 더 안정적으로 유지할 수 있어요.';
  return '좋아요. 현재 속도라면 충분히 유지할 수 있어요.';
};

export const getTopExpenseCategory = (transactions: Transaction[], year: number, month: number) => {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const totals = getCategoryTotals(transactions, monthKey);
  const entries = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  return entries[0] ?? null;
};

export const getDailyExpenseMap = (transactions: Transaction[], year: number) => {
  const map = new Map<string, number>();
  transactions
    .filter((item) => item.type === 'expense' && item.date.startsWith(String(year)))
    .forEach((item) => map.set(item.date, (map.get(item.date) ?? 0) + item.amount));
  return map;
};

export const getDailyExpenseLevel = (dayExpense: number, dailyExpenseValues: number[]): HeatmapLevel => {
  if (dayExpense <= 0) return 'none';
  const max = Math.max(...dailyExpenseValues, 0);
  if (max <= 0) return 'none';
  const ratio = dayExpense / max;
  if (ratio <= 0.25) return 'low';
  if (ratio <= 0.5) return 'medium';
  if (ratio <= 0.75) return 'high';
  return 'veryHigh';
};

export const getHeatmapColor = (level: HeatmapLevel, _selectedTheme?: ThemeName) => {
  if (level === 'low') return 'bg-[rgba(var(--theme-mid),.28)] text-[rgb(var(--theme-text))]';
  if (level === 'medium') return 'bg-[rgba(var(--theme-mid),.48)] text-[rgb(var(--theme-text))]';
  if (level === 'high') return 'bg-[rgba(var(--theme-mid),.72)] text-white';
  if (level === 'veryHigh') return 'bg-[rgb(var(--theme-strong))] text-white';
  return 'bg-slate-100 text-muted';
};
