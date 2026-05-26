import { useState, type FormEvent } from 'react';
import { Repeat, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { categories } from '../data/mockData';
import type { Category, FixedExpense } from '../types';
import { currentDateKey } from '../utils/date';
import { getFixedExpenseTotal } from '../utils/calculations';
import { formatCurrency } from '../utils/format';
import { parseMoneyInput } from '../utils/moneyInput';

interface FixedExpensesProps {
  expenses: FixedExpense[];
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  toggleFixedExpense: (id: string) => void;
  deleteFixedExpense: (id: string) => void;
}

export function FixedExpenses({ expenses, addFixedExpense, toggleFixedExpense, deleteFixedExpense }: FixedExpensesProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [category, setCategory] = useState<Category>('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = parseMoneyInput(amount);
    const parsedPaymentDay = Number(paymentDay);
    if (!name || parsedAmount === null || parsedAmount <= 0 || !category.trim()) return;
    if (!Number.isInteger(parsedPaymentDay) || parsedPaymentDay < 1 || parsedPaymentDay > 31) return;
    addFixedExpense({ name, amount: parsedAmount, paymentDay: parsedPaymentDay, category: category.trim(), startDate: currentDateKey(), active: true });
    setName('');
    setAmount('');
    setPaymentDay('');
    setCategory('');
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-black text-emerald-700">Fixed Expenses</p>
        <h2 className="mt-2 text-3xl font-black">매달 자동 반영되는 고정지출</h2>
      </header>
      <Card className="bg-mint/40">
        <div className="flex items-center gap-4">
          <Repeat className="text-emerald-700" size={32} />
          <div>
            <p className="text-sm font-bold text-muted">고정지출 총액</p>
            <p className="text-4xl font-black">{formatCurrency(getFixedExpenseTotal(expenses))}</p>
          </div>
        </div>
      </Card>
      <Card>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_1fr_140px_160px_120px]">
          <input className="input" placeholder="예: 월세, 구독료" value={name} onChange={(event) => setName(event.target.value)} />
          <input className="input" type="number" min="0" step="0.01" placeholder="금액" value={amount} onChange={(event) => {
            if (event.target.value === '' || parseMoneyInput(event.target.value) !== null) setAmount(event.target.value);
          }} />
          <div className="flex overflow-hidden rounded-lg border border-line bg-white focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-100">
            <span className="grid min-h-12 place-items-center px-3 text-sm font-black text-muted">매월</span>
            <input
              className="min-h-12 w-full min-w-0 px-2 text-sm font-bold outline-none"
              type="number"
              min="1"
              max="31"
              placeholder="5"
              value={paymentDay}
              onChange={(event) => setPaymentDay(event.target.value)}
            />
            <span className="grid min-h-12 place-items-center px-3 text-sm font-black text-muted">일</span>
          </div>
          <div>
            <input className="input" list="fixed-categories" placeholder="예: 구독" value={category} onChange={(event) => setCategory(event.target.value as Category)} />
            <datalist id="fixed-categories">
              {categories.map((item) => <option key={item} value={item} />)}
            </datalist>
          </div>
          <button className="btn-primary" type="submit">등록</button>
        </form>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {expenses.length === 0 && (
          <Card className="border-dashed bg-slate-50/80">
            <p className="text-sm font-black text-slate-400">예: 월세</p>
            <p className="mt-2 text-sm font-semibold text-slate-400">고정지출을 등록하면 이 표에 실제 데이터로 표시됩니다.</p>
          </Card>
        )}
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xl font-black">{expense.name}</p>
                <p className="text-sm text-muted">{expense.category} · 매월 {expense.paymentDay}일 자동 반영</p>
                <p className="mt-3 text-2xl font-black">{formatCurrency(expense.amount)}</p>
              </div>
              <div className="flex gap-2">
                <button className={expense.active ? 'btn-secondary' : 'btn-muted'} onClick={() => toggleFixedExpense(expense.id)} type="button">
                  {expense.active ? '활성' : '중지'}
                </button>
                <button className="icon-btn" onClick={() => deleteFixedExpense(expense.id)} title="삭제" type="button"><Trash2 size={17} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
