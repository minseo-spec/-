export type TransactionType = 'income' | 'expense';

export type Category = string;

export type DashboardOverrideKey =
  | 'monthlyIncome'
  | 'monthlyLivingBudget'
  | 'monthlySavingsGoal'
  | 'fixedExpenses'
  | 'freeMoney'
  | 'averageMonthlyLivingCost';

export interface DashboardOverrides {
  monthlyIncome?: number;
  monthlyLivingBudget?: number;
  monthlySavingsGoal?: number;
  fixedExpenses?: number;
  freeMoney?: number;
  averageMonthlyLivingCost?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  title: string;
  memo: string;
  date: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  paymentDay: number;
  category: Category;
  startDate: string;
  active: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  fixedExpenses: number;
}

export interface MonthlySetting {
  possibleSavings?: number;
  freeMoney?: number;
}

export type AllowanceCycleType = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface AllowanceSettings {
  enabled: boolean;
  cycleType: AllowanceCycleType;
  customDays: number | null;
  allowanceAmount: number;
  startDate: string;
}

export type CurrencyCode = 'KRW' | 'USD' | 'JPY' | 'CNY' | 'EUR';
export type ThemeName = 'green' | 'blue' | 'pink' | 'yellow' | 'purple' | 'mint' | 'peach' | 'gray' | 'cream' | 'lavender';

export interface AppSettings {
  currency: CurrencyCode;
  selectedTheme: ThemeName;
}

export interface LedgerState {
  totalAssets: number;
  dashboardOverrides: DashboardOverrides;
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  savingsGoals: SavingsGoal[];
  monthlySummaries: MonthlySummary[];
  monthlySettings: Record<string, MonthlySetting>;
  allowanceSettings: AllowanceSettings;
  appSettings: AppSettings;
}

export interface DashboardMetrics {
  totalAssets: number;
  monthlyIncome: number;
  monthlyLivingBudget: number;
  fixedExpenses: number;
  monthlyExpenses: number;
  monthlySavingsGoal: number;
  possibleSavings: number;
  remainingLivingBudget: number;
  freeMoney: number;
  averageMonthlyLivingCost: number;
  survivalMonths: number;
  safeDailyBudget: number;
}

export type SpendingLevel = 'lowest' | 'low' | 'average' | 'high' | 'highest';
