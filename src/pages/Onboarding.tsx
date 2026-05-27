import { useState } from 'react';
import { Card } from '../components/Card';
import type { AllowanceCycleType, AllowanceSettings, AppSettings, CurrencyCode, FixedExpense, Transaction } from '../types';
import { currentDateKey } from '../utils/date';
import { currencyOptions } from '../utils/format';
import { parseMoneyInput } from '../utils/moneyInput';

interface OnboardingProps {
  setTotalAssets: (value: number) => void;
  setDashboardOverride: (key: 'monthlyIncome', value: number) => void;
  updateAllowanceSettings: (settings: Partial<AllowanceSettings>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  completeOnboarding: () => void;
}

const cycles: Array<{ value: AllowanceCycleType; label: string }> = [
  { value: 'weekly', label: '7일' },
  { value: 'biweekly', label: '14일' },
  { value: 'monthly', label: '한 달' },
  { value: 'quarterly', label: '3개월' },
  { value: 'yearly', label: '12개월' },
  { value: 'custom', label: '직접 설정' },
];

export function Onboarding({ setTotalAssets, setDashboardOverride, updateAllowanceSettings, updateAppSettings, addTransaction, addFixedExpense, completeOnboarding }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [allowanceMode, setAllowanceMode] = useState(false);
  const [primaryAmount, setPrimaryAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [cycleType, setCycleType] = useState<AllowanceCycleType>('monthly');
  const [customDays, setCustomDays] = useState('');
  const [fixedName, setFixedName] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [addedFixedCount, setAddedFixedCount] = useState(0);
  const [currency, setCurrency] = useState<CurrencyCode>('KRW');

  const saveAmounts = () => {
    const first = parseMoneyInput(primaryAmount) ?? 0;
    const remaining = parseMoneyInput(remainingAmount) ?? 0;
    if (allowanceMode) {
      updateAllowanceSettings({ enabled: true, allowanceAmount: first, startDate: currentDateKey(), cycleType, customDays: cycleType === 'custom' ? Number(customDays) || null : null });
      setTotalAssets(remaining);
      if (first > 0) {
        addTransaction({ type: 'income', amount: first, category: '용돈', title: '이번에 받은 용돈', memo: '온보딩 입력', date: currentDateKey() });
      }
    } else {
      updateAllowanceSettings({ enabled: false });
      setDashboardOverride('monthlyIncome', first);
      setTotalAssets(remaining);
      if (first > 0) {
        addTransaction({ type: 'income', amount: first, category: '수입', title: '이번 달 수입', memo: '온보딩 입력', date: currentDateKey() });
      }
    }
  };

  const saveFixedExpense = () => {
    const amount = parseMoneyInput(fixedAmount);
    const day = Number(paymentDay);
    if (!fixedName || amount === null || amount <= 0 || !Number.isInteger(day) || day < 1 || day > 31) return;
    addFixedExpense({ name: fixedName, amount, paymentDay: day, category: allowanceMode ? '정기 지출' : '고정지출', startDate: currentDateKey(), active: true });
    setAddedFixedCount((count) => count + 1);
    setFixedName('');
    setFixedAmount('');
    setPaymentDay('');
  };

  const nextFromAmounts = () => {
    saveAmounts();
    setStep(allowanceMode ? 3 : 4);
  };

  return (
    <div className="theme-green min-h-screen bg-[linear-gradient(135deg,rgba(var(--theme-soft),.95),rgba(var(--theme-soft),.72))] px-4 py-8 text-ink">
      <main className="mx-auto max-w-2xl">
        <div className="mb-6">
          <p className="text-sm font-black text-[rgb(var(--theme-text))]">Remain 시작하기</p>
          <h1 className="mt-2 text-3xl font-black">처음 설정을 함께 해볼게요.</h1>
        </div>
        <Card>
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">용돈으로 관리할까요?</h2>
              <div className="rounded-lg bg-white/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-black">용돈 모드</p>
                    <p className="text-sm font-semibold text-muted">{allowanceMode ? 'ON' : 'OFF'}</p>
                  </div>
                  <button
                    className={`h-8 w-16 rounded-full p-1 transition ${allowanceMode ? 'bg-[rgb(var(--theme-mid))]' : 'bg-slate-200'}`}
                    type="button"
                    onClick={() => {
                      const next = !allowanceMode;
                      setAllowanceMode(next);
                      updateAllowanceSettings({ enabled: next });
                    }}
                    aria-label="용돈 모드 토글"
                  >
                    <span className={`block h-6 w-6 rounded-full bg-white shadow transition ${allowanceMode ? 'translate-x-8' : ''}`} />
                  </button>
                </div>
              </div>
              <button className="btn-primary w-full" type="button" onClick={() => setStep(2)}>다음</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">초기 금액을 입력해주세요.</h2>
              <select className="input" value={currency} onChange={(event) => {
                const nextCurrency = event.target.value as CurrencyCode;
                setCurrency(nextCurrency);
                updateAppSettings({ currency: nextCurrency });
              }}>
                {Object.values(currencyOptions).map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
              </select>
              <input className="input" type="number" min="0" step="0.01" placeholder={allowanceMode ? '이번에 받은 용돈' : '이번 달 수입'} value={primaryAmount} onChange={(event) => setPrimaryAmount(event.target.value)} />
              <input className="input" type="number" min="0" step="0.01" placeholder={allowanceMode ? '현재 남은 금액' : '현재 자산'} value={remainingAmount} onChange={(event) => setRemainingAmount(event.target.value)} />
              <button className="btn-primary w-full" type="button" onClick={nextFromAmounts}>다음</button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">용돈 주기를 선택해주세요.</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {cycles.map((cycle) => (
                  <button key={cycle.value} className={cycleType === cycle.value ? 'btn-primary' : 'btn-secondary'} type="button" onClick={() => setCycleType(cycle.value)}>{cycle.label}</button>
                ))}
              </div>
              {cycleType === 'custom' && <input className="input" type="number" min="1" placeholder="직접 일 수" value={customDays} onChange={(event) => setCustomDays(event.target.value)} />}
              <button className="btn-primary w-full" type="button" onClick={() => { updateAllowanceSettings({ cycleType, customDays: cycleType === 'custom' ? Number(customDays) || null : null }); setStep(4); }}>다음</button>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">정기적으로 나가는 돈이 있나요?</h2>
              <input className="input" placeholder="항목명" value={fixedName} onChange={(event) => setFixedName(event.target.value)} />
              <input className="input" type="number" min="0" step="0.01" placeholder="금액" value={fixedAmount} onChange={(event) => setFixedAmount(event.target.value)} />
              <input className="input" type="number" min="1" max="31" placeholder="매월 몇 일" value={paymentDay} onChange={(event) => setPaymentDay(event.target.value)} />
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="btn-secondary" type="button" onClick={() => setStep(5)}>나중에 입력하기</button>
                <button className="btn-primary" type="button" onClick={saveFixedExpense}>추가</button>
              </div>
              {addedFixedCount > 0 && (
                <button className="btn-primary w-full" type="button" onClick={() => setStep(5)}>
                  다음으로 넘어가기
                </button>
              )}
            </div>
          )}
          {step === 5 && (
            <div className="space-y-5 text-center">
              <h2 className="text-2xl font-black">준비가 끝났어요.</h2>
              <p className="font-semibold text-muted">이제 Remain에서 남은 금액과 하루 사용 가능 금액을 확인할 수 있어요.</p>
              <button className="btn-primary w-full" type="button" onClick={completeOnboarding}>시작하기</button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
