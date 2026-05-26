import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, Coins, PiggyBank, ShieldCheck, Wallet } from 'lucide-react';
import { Card } from '../components/Card';
import { EditableMoneyCard, formatNumberInput, stripNumberFormatting } from '../components/EditableMoneyCard';
import { ProgressBar } from '../components/ProgressBar';
import type { AllowanceCycleType, AllowanceSettings, DashboardOverrideKey, LedgerState, Transaction } from '../types';
import { getAllowanceMetrics } from '../utils/allowance';
import { getCategoryTotals, getDashboardMetrics } from '../utils/calculations';
import { currentDateKey, currentMonthKey } from '../utils/date';
import { formatCurrency, formatNumber } from '../utils/format';
import { parseMoneyInput } from '../utils/moneyInput';

type EditableKey = 'totalAssets' | 'allowanceAmount' | DashboardOverrideKey;
type DashboardEditableKey = Exclude<EditableKey, 'fixedExpenses'>;

interface DashboardProps {
  state: LedgerState;
  setTotalAssets: (value: number) => void;
  setDashboardOverride: (key: DashboardOverrideKey, value: number) => void;
  updateAllowanceSettings: (settings: Partial<AllowanceSettings>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const cycleOptions: Array<{ value: AllowanceCycleType; label: string }> = [
  { value: 'weekly', label: '7일 용돈' },
  { value: 'biweekly', label: '14일 용돈' },
  { value: 'monthly', label: '한 달 용돈' },
  { value: 'quarterly', label: '3개월 용돈' },
  { value: 'yearly', label: '12개월 용돈' },
  { value: 'custom', label: '직접 설정' },
];

export function Dashboard({ state, setTotalAssets, setDashboardOverride, updateAllowanceSettings, addTransaction }: DashboardProps) {
  const metrics = getDashboardMetrics(state);
  const allowanceMode = state.allowanceSettings.enabled;
  const [editingId, setEditingId] = useState<DashboardEditableKey | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const categoryTotals = [...getCategoryTotals(state.transactions, currentMonthKey()).entries()].sort((a, b) => b[1] - a[1]);
  const topCategory = categoryTotals[0];

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const startEdit = (id: DashboardEditableKey, value: number) => {
    setEditingId(id);
    setDraftValue(formatNumberInput(String(Math.round(value))));
    setError('');
  };

  const saveEdit = (id: DashboardEditableKey, rawValue: string) => {
    const parsedValue = parseMoneyInput(stripNumberFormatting(rawValue));
    if (parsedValue === null) {
      setError('0 이상의 숫자와 소수점 둘째 자리까지만 저장할 수 있어요.');
      return;
    }

    if (id === 'totalAssets') {
      setTotalAssets(parsedValue);
    } else if (id === 'allowanceAmount') {
      updateAllowanceSettings({ allowanceAmount: parsedValue });
    } else {
      setDashboardOverride(id, parsedValue);
    }
    setEditingId(null);
    setDraftValue('');
    setError('');
    setNotice('저장 완료');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftValue('');
    setError('');
  };

  if (allowanceMode) {
    return (
      <AllowanceDashboard
        state={state}
        metrics={metrics}
        topCategory={topCategory}
        notice={notice}
        setNotice={setNotice}
        editingId={editingId}
        draftValue={draftValue}
        error={error}
        startEdit={startEdit}
        saveEdit={saveEdit}
        cancelEdit={cancelEdit}
        setDraftValue={setDraftValue}
        updateAllowanceSettings={updateAllowanceSettings}
        addTransaction={addTransaction}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-black text-emerald-700">Dashboard</p>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">지금 가진 돈으로 얼마나 여유롭게 생활할 수 있는지 확인해보세요.</h2>
        </div>
        {notice && <div className="rounded-lg bg-mint px-4 py-3 text-sm font-black text-emerald-800">{notice}</div>}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EditableMoneyCard id="totalAssets" label="현재 총 자산" value={metrics.totalAssets} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<Wallet size={22} />} tone="mint" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
        <EditableMoneyCard id="monthlyIncome" label="이번 달 수입" value={metrics.monthlyIncome} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<Coins size={22} />} tone="sky" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
        <EditableMoneyCard id="monthlyLivingBudget" label="이번 달 생활비 예산" value={metrics.monthlyLivingBudget} draftValue={draftValue} currencyCode={state.appSettings.currency} detail="고정지출을 제외한 생활비" icon={<CalendarDays size={22} />} tone="peach" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
        <EditableMoneyCard id="monthlySavingsGoal" label="이번 달 저축 목표" value={metrics.monthlySavingsGoal} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<PiggyBank size={22} />} tone="lavender" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
        <ReadOnlyMetric label="고정지출" value={formatCurrency(metrics.fixedExpenses)} detail="고정지출 탭의 합계가 자동 반영됩니다." />
        <EditableMoneyCard id="freeMoney" label="여윳돈" value={metrics.freeMoney} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<Wallet size={22} />} tone="mint" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
        <EditableMoneyCard id="averageMonthlyLivingCost" label="월 평균 생활비" value={metrics.averageMonthlyLivingCost} draftValue={draftValue} currencyCode={state.appSettings.currency} detail="생존 개월 수 계산 기준" icon={<ShieldCheck size={22} />} tone="sky" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
        <ReadOnlyMetric label="이번 달 총 지출" value={formatCurrency(metrics.monthlyExpenses)} detail="생활비 예산 + 고정지출" />
      </div>

      {error && <p className="rounded-lg bg-peach/70 px-4 py-3 text-sm font-black text-orange-800">{error}</p>}

      <DefaultDashboardBody metrics={metrics} topCategory={topCategory} />
    </div>
  );
}

function AllowanceDashboard({
  state,
  metrics,
  topCategory,
  notice,
  setNotice,
  editingId,
  draftValue,
  error,
  startEdit,
  saveEdit,
  cancelEdit,
  setDraftValue,
  updateAllowanceSettings,
  addTransaction,
}: {
  state: LedgerState;
  metrics: ReturnType<typeof getDashboardMetrics>;
  topCategory?: [string, number];
  notice: string;
  setNotice: (notice: string) => void;
  editingId: DashboardEditableKey | null;
  draftValue: string;
  error: string;
  startEdit: (id: DashboardEditableKey, value: number) => void;
  saveEdit: (id: DashboardEditableKey, value: string) => void;
  cancelEdit: () => void;
  setDraftValue: (value: string) => void;
  updateAllowanceSettings: (settings: Partial<AllowanceSettings>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}) {
  const allowance = getAllowanceMetrics(state.allowanceSettings, state.totalAssets, state.transactions);
  const warning = getAllowanceWarning(allowance.todayExpenses, allowance.safeDailyAllowance);

  const saveAllowanceIncome = () => {
    if (state.allowanceSettings.allowanceAmount <= 0) return;
    addTransaction({
      type: 'income',
      amount: state.allowanceSettings.allowanceAmount,
      category: '용돈',
      title: '받은 용돈',
      memo: `${cycleLabel(state.allowanceSettings.cycleType)} 시작`,
      date: state.allowanceSettings.startDate || currentDateKey(),
    });
    setNotice('용돈 기록 저장 완료');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-black text-emerald-700">Allowance Mode</p>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">오늘 얼마까지 써도 괜찮을까요?</h2>
        </div>
        {notice && <div className="rounded-lg bg-mint px-4 py-3 text-sm font-black text-emerald-800">{notice}</div>}
      </header>

      <AllowanceSettingsCard settings={state.allowanceSettings} updateAllowanceSettings={updateAllowanceSettings} onSaveIncome={saveAllowanceIncome} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EditableMoneyCard id="totalAssets" label="현재 남은 금액" value={metrics.totalAssets} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<Wallet size={22} />} tone="mint" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
        <EditableMoneyCard id="allowanceAmount" label="받은 용돈" value={state.allowanceSettings.allowanceAmount} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<Coins size={22} />} tone="sky" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
        <ReadOnlyMetric label="남은 기간" value={`${allowance.daysRemaining}일`} detail={`${allowance.cycleDays}일 주기 기준`} />
        <ReadOnlyMetric label="오늘 안전 사용 금액" value={formatCurrency(allowance.safeDailyAllowance)} detail="오늘부터 하루에 약 이만큼 쓸 수 있어요." />
        <ReadOnlyMetric label="이번 주 사용 금액" value={formatCurrency(allowance.weeklyExpenses)} detail="이번 주 지출 합계" />
        <ReadOnlyMetric label="이번 주 남은 사용 가능 금액" value={formatCurrency(allowance.weeklyRemaining)} detail="안전 사용 금액 기준" />
        <ReadOnlyMetric label="정기적으로 나가는 돈" value={formatCurrency(metrics.fixedExpenses)} detail="고정지출 탭과 연결됩니다." />
        <ReadOnlyMetric label="현재 속도로 사용 가능" value={`${formatNumber(allowance.sustainableDays, 0)}일`} detail="남은 금액 기준 예상" />
      </div>

      {error && <p className="rounded-lg bg-peach/70 px-4 py-3 text-sm font-black text-orange-800">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Card>
          <p className="text-sm font-bold text-muted">용돈 안전선</p>
          <strong className="mt-2 block text-4xl font-black">{formatCurrency(allowance.safeDailyAllowance)}</strong>
          <p className="mt-2 text-muted">오늘부터 하루에 약 {formatCurrency(allowance.safeDailyAllowance)}까지 쓸 수 있어요.</p>
          <p className="mt-3 rounded-lg bg-mint/50 p-3 text-sm font-black text-emerald-800">남은 기간: {allowance.daysRemaining}일</p>
          <p className={`mt-3 rounded-lg p-3 text-sm font-black ${warning.tone}`}>{warning.message}</p>
        </Card>
        <Card>
          <p className="text-sm font-bold text-muted">가장 많이 쓴 카테고리</p>
          <p className="mt-2 text-3xl font-black">{topCategory ? topCategory[0] : '아직 없음'}</p>
          <p className="mt-1 text-sm text-muted">{topCategory ? formatCurrency(topCategory[1]) : '사용 내역을 추가하면 보여요.'}</p>
        </Card>
      </div>
    </div>
  );
}

function AllowanceSettingsCard({
  settings,
  updateAllowanceSettings,
  onSaveIncome,
}: {
  settings: AllowanceSettings;
  updateAllowanceSettings: (settings: Partial<AllowanceSettings>) => void;
  onSaveIncome: () => void;
}) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSaveIncome();
  };

  return (
    <Card className="bg-mint/35">
      <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1fr_170px_160px_160px_130px]">
        <input className="input" type="number" min="0" step="0.01" placeholder="이번에 받은 용돈 금액" value={settings.allowanceAmount || ''} onChange={(event) => {
          const parsed = parseMoneyInput(event.target.value);
          if (event.target.value === '' || parsed !== null) updateAllowanceSettings({ allowanceAmount: parsed ?? 0 });
        }} />
        <input className="input" type="date" value={settings.startDate} onChange={(event) => updateAllowanceSettings({ startDate: event.target.value })} />
        <select className="input" value={settings.cycleType} onChange={(event) => updateAllowanceSettings({ cycleType: event.target.value as AllowanceCycleType })}>
          {cycleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        {settings.cycleType === 'custom' ? (
          <input className="input" type="number" min="1" placeholder="직접 일 수" value={settings.customDays ?? ''} onChange={(event) => updateAllowanceSettings({ customDays: Number(event.target.value) || null })} />
        ) : (
          <div className="grid min-h-12 place-items-center rounded-lg bg-white/70 px-4 text-sm font-black text-muted">{cycleLabel(settings.cycleType)}</div>
        )}
        <button className="btn-primary" type="submit">용돈 기록</button>
      </form>
    </Card>
  );
}

function DefaultDashboardBody({ metrics, topCategory }: { metrics: ReturnType<typeof getDashboardMetrics>; topCategory?: [string, number] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-muted">재정 생존 예측</p>
            <strong className="mt-2 block text-5xl font-black text-ink">{formatNumber(metrics.survivalMonths)}개월</strong>
            <p className="mt-2 text-muted">월 평균 생활비 기준으로 계산한 예상 유지 기간입니다.</p>
          </div>
          <div className="rounded-lg bg-mint/70 p-4 text-emerald-800">
            <ShieldCheck size={34} />
            <p className="mt-2 text-sm font-black">오늘 안전 지출</p>
            <p className="text-2xl font-black">{formatCurrency(metrics.safeDailyBudget)}</p>
          </div>
        </div>
        <ProgressBar className="mt-6" value={Math.min(metrics.survivalMonths / 12 * 100, 100)} />
      </Card>
      <Card>
        <p className="text-sm font-bold text-muted">이번 달 현금 흐름</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricMini label="남은 생활비" value={formatCurrency(metrics.remainingLivingBudget)} />
          <MetricMini label="저축 여력" value={formatCurrency(metrics.possibleSavings)} />
        </div>
        <div className="mt-5 rounded-lg bg-peach/45 p-4">
          <p className="text-sm font-bold text-muted">가장 많이 쓴 카테고리</p>
          <p className="mt-1 text-2xl font-black">{topCategory ? topCategory[0] : '아직 없음'}</p>
          <p className="text-sm text-muted">{topCategory ? formatCurrency(topCategory[1]) : '이번 달 지출을 추가해보세요.'}</p>
        </div>
      </Card>
    </div>
  );
}

function getAllowanceWarning(todayExpenses: number, safeDailyAllowance: number) {
  if (todayExpenses > safeDailyAllowance) {
    return { message: '오늘 안전 사용 금액을 초과했어요.', tone: 'bg-peach/70 text-orange-800' };
  }
  if (todayExpenses > safeDailyAllowance * 0.8) {
    return { message: '현재 속도라면 용돈이 예상보다 빨리 부족해질 수 있어요.', tone: 'bg-yellow-100 text-yellow-800' };
  }
  return { message: '좋아요! 현재 속도라면 용돈을 충분히 유지할 수 있어요.', tone: 'bg-mint/60 text-emerald-800' };
}

function cycleLabel(cycleType: AllowanceCycleType) {
  return cycleOptions.find((option) => option.value === cycleType)?.label ?? '한 달 용돈';
}

function ReadOnlyMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="min-h-40">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <strong className="mt-3 block text-2xl font-black leading-tight text-ink sm:text-3xl">{value}</strong>
      <p className="mt-4 text-sm text-muted">{detail}</p>
    </Card>
  );
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-sky/45 p-4">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
