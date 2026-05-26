import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { categories } from '../data/mockData';
import type { Category, TransactionType } from '../types';
import { currentDateKey } from '../utils/date';
import { parseMoneyInput } from '../utils/moneyInput';

interface TransactionFormProps {
  defaultDate?: string;
  onAdd: (transaction: { type: TransactionType; amount: number; category: Category; title: string; memo: string; date: string }) => void;
}

export function TransactionForm({ defaultDate = currentDateKey(), onAdd }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(defaultDate);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = parseMoneyInput(amount);
    if (parsedAmount === null || parsedAmount <= 0 || !category.trim()) return;
    onAdd({ type, amount: parsedAmount, category: category.trim(), title: memo.trim() || category.trim(), memo, date });
    setAmount('');
    setCategory('');
    setMemo('');
  };

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-[120px_1fr_150px_1fr_130px]">
      <select className="input" value={type} onChange={(event) => setType(event.target.value as TransactionType)}>
        <option value="expense">지출</option>
        <option value="income">수입</option>
      </select>
      <input className="input" type="number" min="0" step="0.01" placeholder="금액" value={amount} onChange={(event) => {
        if (event.target.value === '' || parseMoneyInput(event.target.value) !== null) setAmount(event.target.value);
      }} />
      <div>
        <input className="input" list="transaction-categories" placeholder="예: 식비" value={category} onChange={(event) => setCategory(event.target.value)} />
        <datalist id="transaction-categories">
          {categories.map((item) => <option key={item} value={item} />)}
        </datalist>
      </div>
      <input className="input" placeholder="예: 카페" value={memo} onChange={(event) => setMemo(event.target.value)} />
      <div className="flex gap-2 md:col-span-5">
        <input className="input flex-1" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <button className="btn-primary" type="submit" title="항목 추가">
          <Plus size={18} />
          추가
        </button>
      </div>
    </form>
  );
}
