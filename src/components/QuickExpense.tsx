import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Transaction } from '../types';
import { currentDateKey } from '../utils/date';
import { parseMoneyInput } from '../utils/moneyInput';

const quickCategories = ['식비', '카페', '교통', '쇼핑', '구독', '기타'];

interface QuickExpenseProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

export function QuickExpense({ onAdd }: QuickExpenseProps) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = parseMoneyInput(amount);
    if (!category || parsedAmount === null || parsedAmount <= 0) return;
    onAdd({
      type: 'expense',
      amount: parsedAmount,
      category,
      title: category,
      memo: memo.trim(),
      date: currentDateKey(),
    });
    setCategory('');
    setAmount('');
    setMemo('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {quickCategories.map((item) => (
          <button
            key={item}
            className={`rounded-lg px-3 py-2 text-sm font-black transition ${category === item ? 'bg-[rgb(var(--theme-strong))] text-white' : 'bg-white text-muted hover:bg-[rgb(var(--theme-soft))]'}`}
            type="button"
            onClick={() => setCategory(item)}
          >
            + {item}
          </button>
        ))}
      </div>
      {category && (
        <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input className="input" type="number" min="0" step="0.01" placeholder={`${category} 금액`} value={amount} onChange={(event) => {
            if (event.target.value === '' || parseMoneyInput(event.target.value) !== null) setAmount(event.target.value);
          }} />
          <input className="input" placeholder="메모" value={memo} onChange={(event) => setMemo(event.target.value)} />
          <div className="flex gap-2">
            <button className="btn-primary px-5" type="submit">저장</button>
            <button className="icon-btn" type="button" title="닫기" onClick={() => setCategory('')}><X size={17} /></button>
          </div>
        </form>
      )}
    </div>
  );
}
