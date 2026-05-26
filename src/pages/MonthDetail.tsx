import { Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { MetricCard } from '../components/MetricCard';
import { TransactionForm } from '../components/TransactionForm';
import type { LedgerState, Transaction } from '../types';
import { currentMonthKey, formatMonthLabel } from '../utils/date';
import { formatCurrency } from '../utils/format';
import {
  getFixedExpenseTotal,
  getMonthlyExpenses,
  getMonthlyIncome,
  getTransactionsByMonth,
  getVariableMonthlyExpenses,
} from '../utils/calculations';

interface MonthDetailProps {
  state: LedgerState;
  month: string;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

export function MonthDetail({ state, month, addTransaction, deleteTransaction }: MonthDetailProps) {
  const isCurrentMonth = month === currentMonthKey();
  const transactions = getTransactionsByMonth(state.transactions, month);
  const income = getMonthlyIncome(state.transactions, month, isCurrentMonth ? state.dashboardOverrides.monthlyIncome : undefined);
  const variableExpenses = getVariableMonthlyExpenses(state.transactions, month, isCurrentMonth ? state.dashboardOverrides.monthlyLivingBudget : undefined);
  const fixedTotal = getFixedExpenseTotal(state.fixedExpenses, isCurrentMonth ? state.dashboardOverrides.fixedExpenses : undefined);
  const expenses = getMonthlyExpenses(
    state.transactions,
    state.fixedExpenses,
    month,
    isCurrentMonth ? state.dashboardOverrides.monthlyLivingBudget : undefined,
    isCurrentMonth ? state.dashboardOverrides.fixedExpenses : undefined,
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-black text-emerald-700">Month Detail</p>
        <h2 className="mt-2 text-3xl font-black">{formatMonthLabel(month)} Remain 기록</h2>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="수입" value={formatCurrency(income)} tone="sky" />
        <MetricCard label="지출" value={formatCurrency(expenses)} tone="peach" />
        <MetricCard label="저축" value={formatCurrency(income - expenses)} tone="mint" />
        <MetricCard label="고정지출" value={formatCurrency(fixedTotal)} tone="lavender" />
      </div>
      <Card>
        <h3 className="mb-4 text-xl font-black">항목 추가</h3>
        <TransactionForm defaultDate={`${month}-01`} onAdd={addTransaction} />
      </Card>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black">이번 달 내역</h3>
          <p className="text-sm font-bold text-muted">생활비 {formatCurrency(variableExpenses)}</p>
        </div>
        <div className="space-y-2">
          {transactions.length === 0 && (
            <div className="rounded-lg border border-dashed border-line bg-slate-50/80 p-4 text-sm font-bold text-muted">
              <span className="text-slate-400">예: 식비</span>
              <p className="mt-1 text-xs font-semibold text-slate-400">아직 저장된 내역이 없어요. 위 입력창에 직접 추가한 항목만 여기에 표시됩니다.</p>
            </div>
          )}
          {transactions.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-cream/70 p-3">
              <div>
                <p className="font-black">{item.title || item.memo || item.category}</p>
                <p className="text-sm text-muted">{item.date} · {item.category} · {item.type === 'income' ? '수입' : '지출'}</p>
              </div>
              <div className="flex items-center gap-3">
                <strong className={item.type === 'income' ? 'text-emerald-700' : 'text-orange-700'}>{formatCurrency(item.amount)}</strong>
                <button className="icon-btn" onClick={() => deleteTransaction(item.id)} title="삭제" type="button"><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
