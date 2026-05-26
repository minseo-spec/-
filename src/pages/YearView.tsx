import { useMemo, useState } from 'react';
import { ArrowLeft, HelpCircle, Plus } from 'lucide-react';
import { Card } from '../components/Card';
import type { Page } from '../components/Layout';
import type { LedgerState, Transaction } from '../types';
import { getDailyCalendarCells, getTransactionsByMonth } from '../utils/calculations';
import { formatMonthLabel } from '../utils/date';
import { formatCurrency } from '../utils/format';

interface YearViewProps {
  state: LedgerState;
  year: number;
  onSelectMonth: (month: string) => void;
  onNavigate: (page: Page) => void;
  updateMonthlySetting: (monthKey: string, setting: { possibleSavings?: number; freeMoney?: number }) => void;
}

export function YearView({ state, year, onSelectMonth, onNavigate, updateMonthlySetting }: YearViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const yearTransactions = state.transactions.filter((transaction) => transaction.date.startsWith(String(year)));
  const hasTransactions = yearTransactions.length > 0;
  const selectedTransactions = selectedMonth ? getTransactionsByMonth(state.transactions, selectedMonth) : [];

  if (selectedMonth) {
    return (
      <MonthDetailScreen
        state={state}
        monthKey={selectedMonth}
        transactions={selectedTransactions}
        onBack={() => setSelectedMonth(null)}
        onAddTransaction={() => onNavigate('expenses')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-emerald-700">12-Month View</p>
          <h2 className="mt-2 text-3xl font-black">{year}년 연간 캘린더</h2>
          <p className="mt-2 text-sm font-bold text-muted">월을 클릭하면 상세 정보를 볼 수 있어요.</p>
        </div>
        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-muted shadow-soft transition hover:bg-mint hover:text-emerald-800"
          type="button"
          onClick={() => setShowHelp(true)}
          title="사용법"
        >
          <HelpCircle size={21} />
        </button>
      </header>

      {!hasTransactions ? (
        <Card className="border-dashed bg-slate-50/80 py-14 text-center">
          <p className="text-sm font-black text-slate-400">아직 기록된 수입/지출이 없어요. Remain에 지출 또는 수입을 추가하면 연간 캘린더에 표시됩니다.</p>
        </Card>
      ) : (
        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, index) => {
            const monthKey = `${year}-${String(index + 1).padStart(2, '0')}`;
            const monthTransactions = getTransactionsByMonth(state.transactions, monthKey);
            const hasMonthData = monthTransactions.length > 0;
            return (
              <button
                key={monthKey}
                className="h-full text-left"
                onClick={() => {
                  setSelectedMonth(monthKey);
                  onSelectMonth(monthKey);
                }}
                type="button"
              >
                <Card className={`flex h-full min-h-[300px] flex-col border p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 ${hasMonthData ? 'bg-white/85' : 'bg-white/55 opacity-70'}`}>
                  <div className="mb-3 flex h-14 items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-black">{index + 1}월</h3>
                      <p className="text-xs font-bold text-muted">{hasMonthData ? '기록 있음' : '기록 없음'}</p>
                    </div>
                  </div>
                  <MiniMonth monthKey={monthKey} transactions={monthTransactions} />
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

function MiniMonth({ monthKey, transactions }: { monthKey: string; transactions: Transaction[] }) {
  const cells = getDailyCalendarCells(monthKey);
  const dailyExpenseTotals = useMemo(() => {
    const totals = new Map<string, number>();
    transactions
      .filter((item) => item.type === 'expense')
      .forEach((item) => totals.set(item.date, (totals.get(item.date) ?? 0) + item.amount));
    return totals;
  }, [transactions]);
  const maxDailyExpense = Math.max(...dailyExpenseTotals.values(), 0);

  return (
    <div className="flex-1">
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-muted">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          const expenseTotal = date ? dailyExpenseTotals.get(date) ?? 0 : 0;
          return (
            <div key={`${date}-${index}`} className="grid aspect-square place-items-center rounded bg-white/70 text-[10px] font-bold text-muted">
              {date && (
                <span className={`grid h-5 w-5 place-items-center rounded-full ${expenseTotal > 0 ? getDailyExpenseTone(expenseTotal, maxDailyExpense) : 'bg-transparent'}`}>
                  {Number(date.slice(-2))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthDetailScreen({
  state,
  monthKey,
  transactions,
  onBack,
  onAddTransaction,
}: {
  state: LedgerState;
  monthKey: string;
  transactions: Transaction[];
  onBack: () => void;
  onAddTransaction: () => void;
}) {
  const incomeItems = transactions.filter((item) => item.type === 'income').sort((a, b) => b.date.localeCompare(a.date));
  const expenseItems = transactions.filter((item) => item.type === 'expense').sort((a, b) => b.date.localeCompare(a.date));
  const totalIncome = incomeItems.reduce((total, item) => total + item.amount, 0);
  const totalExpenses = expenseItems.reduce((total, item) => total + item.amount, 0);
  const hasMonthData = transactions.length > 0;

  return (
    <div className="space-y-6">
      <button className="btn-secondary" type="button" onClick={onBack}>
        연간 캘린더로 돌아가기
      </button>

      <header>
        <p className="text-sm font-black text-emerald-700">Month Detail</p>
        <h2 className="mt-2 text-3xl font-black">{formatMonthLabel(monthKey)}</h2>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCell label="총 수입액" value={formatCurrency(totalIncome)} />
        <SummaryCell label="총 지출액" value={formatCurrency(totalExpenses)} />
      </div>

      {!hasMonthData && (
        <Card className="border-dashed bg-slate-50/80">
          <p className="text-sm font-black text-slate-400">이 달에는 아직 기록된 수입/지출이 없어요.</p>
          <button className="btn-primary mt-4" type="button" onClick={onAddTransaction}>
            <Plus size={18} />
            수입/지출 추가하기
          </button>
        </Card>
      )}

      <MonthlyList title="수입 내역" items={incomeItems} emptyText="아직 기록된 수입이 없어요." />
      <MonthlyList title="지출 내역" items={expenseItems} emptyText="아직 기록된 지출이 없어요." />
    </div>
  );
}

function MonthlyList({ title, items, emptyText }: { title: string; items: Transaction[]; emptyText: string }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-black">{title}</h3>
        <p className="text-sm font-bold text-muted">{items.length}건</p>
      </div>
      <div className="space-y-2">
        {items.length === 0 && <p className="rounded-lg border border-dashed border-line bg-slate-50/80 p-4 text-sm font-bold text-slate-400">{emptyText}</p>}
        {items.map((item) => item.type === 'income' ? <IncomeRow key={item.id} item={item} /> : <ExpenseRow key={item.id} item={item} />)}
      </div>
    </Card>
  );
}

function IncomeRow({ item }: { item: Transaction }) {
  return (
    <div className="grid gap-3 rounded-lg bg-mint/50 p-3 md:grid-cols-[150px_1fr_130px_1fr] md:items-center">
      <p className="font-bold text-muted">{formatDate(item.date)}</p>
      <p className="font-black">{item.title || item.memo || '수입'}</p>
      <p className="font-black text-emerald-700">{formatCurrency(item.amount)}</p>
      <p className="text-sm font-semibold text-muted">{item.memo || '-'}</p>
    </div>
  );
}

function ExpenseRow({ item }: { item: Transaction }) {
  return (
    <div className="grid gap-3 rounded-lg bg-cream/70 p-3 md:grid-cols-[150px_1fr_120px_130px_1fr] md:items-center">
      <p className="font-bold text-muted">{formatDate(item.date)}</p>
      <p className="font-black">{item.title || item.memo || item.category}</p>
      <p className="font-black">{item.category}</p>
      <p className="font-black text-orange-700">{formatCurrency(item.amount)}</p>
      <p className="text-sm font-semibold text-muted">{item.memo || '-'}</p>
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <h3 className="text-2xl font-black">12개월 캘린더 사용법</h3>
        <div className="mt-5 space-y-3 text-sm font-semibold text-muted">
          <p>색은 월 전체가 아니라 실제 지출이 있는 날짜에만 표시됩니다.</p>
          <p>수입만 있는 날짜는 지출 색상으로 표시되지 않습니다.</p>
          <p>지출이 많은 날짜일수록 더 진한 색으로 표시됩니다.</p>
          <p>Remain에서 월을 클릭하면 해당 월 상세 화면으로 전환됩니다.</p>
        </div>
        <button className="btn-primary mt-6 w-full" type="button" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </Card>
  );
}

function getDailyExpenseTone(expenseTotal: number, maxDailyExpense: number) {
  if (maxDailyExpense <= 0) return 'bg-transparent';
  const ratio = expenseTotal / maxDailyExpense;
  if (ratio < 0.35) return 'bg-orange-100 text-orange-800';
  if (ratio < 0.7) return 'bg-orange-200 text-orange-900';
  return 'bg-orange-300 text-orange-950';
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
}
