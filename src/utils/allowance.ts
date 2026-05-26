import type { AllowanceSettings, Transaction } from '../types';
import { currentDateKey } from './date';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getAllowanceCycleDays(settings: AllowanceSettings, today = new Date()) {
  if (settings.cycleType === 'weekly') return 7;
  if (settings.cycleType === 'biweekly') return 14;
  if (settings.cycleType === 'quarterly') return 90;
  if (settings.cycleType === 'yearly') return 365;
  if (settings.cycleType === 'custom') return Math.max(settings.customDays ?? 1, 1);
  return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
}

export function getAllowanceMetrics(settings: AllowanceSettings, totalAssets: number, transactions: Transaction[], today = new Date()) {
  const startDate = new Date(`${settings.startDate}T00:00:00`);
  const cycleDays = getAllowanceCycleDays(settings, today);
  const daysPassed = Math.max(Math.floor((stripTime(today).getTime() - stripTime(startDate).getTime()) / MS_PER_DAY), 0);
  const daysRemaining = Math.max(cycleDays - daysPassed, 1);
  const todayKey = currentDateKey(today);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartKey = currentDateKey(weekStart);
  const todayExpenses = transactions
    .filter((item) => item.type === 'expense' && item.date === todayKey)
    .reduce((total, item) => total + item.amount, 0);
  const weeklyExpenses = transactions
    .filter((item) => item.type === 'expense' && item.date >= weekStartKey && item.date <= todayKey)
    .reduce((total, item) => total + item.amount, 0);
  const safeDailyAllowance = totalAssets / daysRemaining;
  const weeklyAllowance = safeDailyAllowance * 7;

  return {
    cycleDays,
    daysPassed,
    daysRemaining,
    safeDailyAllowance,
    todayExpenses,
    weeklyExpenses,
    weeklyRemaining: Math.max(weeklyAllowance - weeklyExpenses, 0),
    sustainableDays: safeDailyAllowance > 0 ? totalAssets / safeDailyAllowance : 0,
  };
}

function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
