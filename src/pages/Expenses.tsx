import { useMemo, useState, type FormEvent } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import { Card } from '../components/Card';
import { categories } from '../data/mockData';
import type { Category, Transaction } from '../types';
import { currentDateKey, currentMonthKey } from '../utils/date';
import { formatCurrency } from '../utils/format';
import { parseMoneyInput } from '../utils/moneyInput';

interface ExpensesProps {
  transactions: Transaction[];
  allowanceMode: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

interface ExpenseFormState {
  date: string;
  title: string;
  category: Category;
  amount: string;
  memo: string;
}

const emptyForm = (): ExpenseFormState => ({
  date: currentDateKey(),
  title: '',
  category: '',
  amount: '',
  memo: '',
});

export function Expenses({ transactions, allowanceMode, addTransaction, updateTransaction, deleteTransaction }: ExpensesProps) {
  const [form, setForm] = useState<ExpenseFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState(currentMonthKey());
  const [categoryFilter, setCategoryFilter] = useState('all');

  const expenses = useMemo(() => (
    transactions
      .filter((item) => item.type === 'expense')
      .filter((item) => !monthFilter || item.date.startsWith(monthFilter))
      .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
      .sort((a, b) => b.date.localeCompare(a.date))
  ), [transactions, monthFilter, categoryFilter]);

  const categoryOptions = Array.from(new Set([...categories, ...transactions.map((item) => item.category).filter(Boolean)]));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const amount = parseMoneyInput(form.amount);
    if (!form.date || !form.title.trim() || !form.category.trim() || amount === null || amount <= 0) return;

    const payload: Omit<Transaction, 'id'> = {
      type: 'expense',
      date: form.date,
      title: form.title.trim(),
      category: form.category.trim(),
      amount,
      memo: form.memo.trim(),
    };

    if (editingId) {
      updateTransaction(editingId, payload);
    } else {
      addTransaction(payload);
    }
    setForm(emptyForm());
    setEditingId(null);
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setForm({
      date: transaction.date,
      title: transaction.title || transaction.memo || transaction.category,
      category: transaction.category,
      amount: String(transaction.amount),
      memo: transaction.memo,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-black text-emerald-700">Expenses</p>
        <h2 className="mt-2 text-3xl font-black">{allowanceMode ? '사용 내역 기록' : '지출 기록'}</h2>
        <p className="mt-2 text-sm font-bold text-muted">여기서 입력한 {allowanceMode ? '사용 내역' : '지출'}이 대시보드, 달력, 12개월, 분석에 함께 반영됩니다.</p>
      </header>

      <Card>
        <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[150px_1fr_160px_160px_1fr_110px]">
          <input className="input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <input className="input" placeholder={allowanceMode ? '사용한 것/내용' : '지출 이름/내용'} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <div>
            <input className="input" list="expense-categories" placeholder="예: 식비" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            <datalist id="expense-categories">
              {categoryOptions.map((item) => <option key={item} value={item} />)}
            </datalist>
          </div>
          <input className="input" type="number" min="0" step="0.01" placeholder="금액" value={form.amount} onChange={(event) => {
            if (event.target.value === '' || parseMoneyInput(event.target.value) !== null) setForm({ ...form, amount: event.target.value });
          }} />
          <input className="input" placeholder="메모" value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} />
          <div className="flex gap-2">
            <button className="btn-primary flex-1" type="submit">{editingId ? '저장' : '추가'}</button>
            {editingId && <button className="icon-btn" type="button" title="취소" onClick={cancelEdit}><X size={17} /></button>}
          </div>
        </form>
      </Card>

      <Card>
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          <input className="input" type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} />
          <select className="input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">전체 카테고리</option>
            {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-black">{allowanceMode ? '사용 내역' : '지출 내역'}</h3>
          <p className="text-sm font-bold text-muted">{expenses.length}건</p>
        </div>
        <div className="space-y-2">
          {expenses.length === 0 && <p className="rounded-lg border border-dashed border-line bg-slate-50/80 p-4 text-sm font-bold text-slate-400">아직 기록된 {allowanceMode ? '사용 내역' : '지출'}이 없어요.</p>}
          {expenses.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-lg bg-cream/70 p-3 md:grid-cols-[130px_120px_1fr_130px_1fr_88px] md:items-center">
              <p className="font-bold text-muted">{item.date}</p>
              <p className="font-black">{item.category}</p>
              <p className="font-black">{item.title || item.memo || item.category}</p>
              <p className="font-black text-orange-700">{formatCurrency(item.amount)}</p>
              <p className="text-sm font-semibold text-muted">{item.memo || '-'}</p>
              <div className="flex gap-2">
                <button className="icon-btn" type="button" title="수정" onClick={() => startEdit(item)}><Pencil size={16} /></button>
                <button className="icon-btn" type="button" title="삭제" onClick={() => deleteTransaction(item.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
