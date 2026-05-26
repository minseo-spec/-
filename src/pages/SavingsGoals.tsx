import { useState, type FormEvent } from 'react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import type { SavingsGoal } from '../types';
import { getGoalMonthlyNeed } from '../utils/calculations';
import { formatCurrency, percent } from '../utils/format';
import { parseMoneyInput } from '../utils/moneyInput';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, currentAmount: number) => void;
  possibleSavings: number;
}

export function SavingsGoals({ goals, addSavingsGoal, updateSavingsGoal, possibleSavings }: SavingsGoalsProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const target = parseMoneyInput(targetAmount);
    const current = currentAmount ? parseMoneyInput(currentAmount) : 0;
    if (!name || target === null || target <= 0 || current === null) return;
    addSavingsGoal({ name, targetAmount: target, currentAmount: current, targetDate });
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-black text-emerald-700">Savings Goals</p>
        <h2 className="mt-2 text-3xl font-black">목표 저축</h2>
      </header>
      <Card>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-5">
          <input className="input" placeholder="목표 이름" value={name} onChange={(event) => setName(event.target.value)} />
          <input className="input" type="number" min="0" step="0.01" placeholder="목표 금액" value={targetAmount} onChange={(event) => {
            if (event.target.value === '' || parseMoneyInput(event.target.value) !== null) setTargetAmount(event.target.value);
          }} />
          <input className="input" type="number" min="0" step="0.01" placeholder="현재 금액" value={currentAmount} onChange={(event) => {
            if (event.target.value === '' || parseMoneyInput(event.target.value) !== null) setCurrentAmount(event.target.value);
          }} />
          <input className="input" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
          <button className="btn-primary" type="submit">추가</button>
        </form>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {goals.length === 0 && (
          <Card className="border-dashed bg-slate-50/80">
            <p className="text-sm font-black text-slate-400">예: 비상금</p>
            <p className="mt-2 text-sm font-semibold text-slate-400">목표를 추가하면 사용자가 입력한 목표만 여기에 나타납니다.</p>
          </Card>
        )}
        {goals.map((goal) => {
          const progress = goal.currentAmount / goal.targetAmount * 100;
          const monthlyNeed = getGoalMonthlyNeed(goal.targetAmount, goal.currentAmount, goal.targetDate);
          const canReach = possibleSavings >= monthlyNeed;
          return (
            <Card key={goal.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="text-xl font-black">{goal.name}</p>
                  <p className="mt-1 text-sm text-muted">목표일 {goal.targetDate}</p>
                  <ProgressBar className="mt-5" value={progress} />
                  <p className="mt-2 text-sm font-bold text-muted">{percent(progress)} · {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
                  <p className={`mt-4 rounded-lg p-3 text-sm font-black ${canReach ? 'bg-mint/60 text-emerald-800' : 'bg-peach/60 text-orange-800'}`}>
                    매달 {formatCurrency(monthlyNeed)} 필요 · {canReach ? '현재 흐름이면 가능해요' : '저축 여력을 조금 더 만들어야 해요'}
                  </p>
                </div>
                <input
                  className="input sm:w-40"
                  type="number"
                  min="0"
                  step="0.01"
                  value={goal.currentAmount}
                  onChange={(event) => {
                    const parsed = parseMoneyInput(event.target.value);
                    if (parsed !== null) updateSavingsGoal(goal.id, parsed);
                  }}
                  aria-label={`${goal.name} 현재 금액`}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
