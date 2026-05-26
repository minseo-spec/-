import { Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { TransactionForm } from '../components/TransactionForm';
import type { LedgerState, Transaction } from '../types';
import { getTransactionsByDate } from '../utils/calculations';
import { formatCurrency } from '../utils/format';

interface DayDetailProps {
  state: LedgerState;
  date: string;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

export function DayDetail({ state, date, addTransaction, deleteTransaction }: DayDetailProps) {
  const transactions = getTransactionsByDate(state.transactions, date);
  const income = transactions.filter((item) => item.type === 'income').reduce((total, item) => total + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === 'expense').reduce((total, item) => total + item.amount, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-black text-emerald-700">Day Detail</p>
        <h2 className="mt-2 text-3xl font-black">{date} 기록</h2>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><p className="text-sm font-bold text-muted">오늘 수입</p><p className="mt-2 text-3xl font-black text-emerald-700">{formatCurrency(income)}</p></Card>
        <Card><p className="text-sm font-bold text-muted">오늘 지출</p><p className="mt-2 text-3xl font-black text-orange-700">{formatCurrency(expenses)}</p></Card>
      </div>
      <Card>
        <h3 className="mb-4 text-xl font-black">수입/지출 추가</h3>
        <TransactionForm defaultDate={date} onAdd={addTransaction} />
      </Card>
      <Card>
        <h3 className="mb-4 text-xl font-black">오늘의 내역</h3>
        <div className="space-y-2">
          {transactions.length === 0 && (
            <div className="rounded-lg border border-dashed border-line bg-slate-50/80 p-4 text-sm font-bold text-muted">
              <span className="text-slate-400">예: 카페</span>
              <p className="mt-1 text-xs font-semibold text-slate-400">placeholder일 뿐 저장되지 않아요. 직접 입력한 내용만 표에 남습니다.</p>
            </div>
          )}
          {transactions.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-cream/70 p-3">
              <div>
                <p className="font-black">{item.title || item.memo || item.category}</p>
                <p className="text-sm text-muted">{item.category} · {item.type === 'income' ? '수입' : '지출'}</p>
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
