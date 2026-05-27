import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, Coins, PiggyBank, ShieldCheck, Wallet } from 'lucide-react';
import { Card } from '../components/Card';
import { EditableMoneyCard, formatNumberInput, stripNumberFormatting } from '../components/EditableMoneyCard';
import { QuickExpense } from '../components/QuickExpense';
import type { AllowanceCycleType, AllowanceSettings, DashboardOverrideKey, LedgerState, SpendingRiskLevel, Transaction } from '../types';
import { getAllowanceMetrics } from '../utils/allowance';
import {
  calculateRecentAverageExpense,
  getCategoryTotals,
  getDashboardMetrics,
  getSpendingRiskLevel,
  getSpendingRiskMessage,
  getTopExpenseCategory,
} from '../utils/calculations';
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
  const monthDate = new Date();
  const topCategory = getTopExpenseCategory(state.transactions, monthDate.getFullYear(), monthDate.getMonth() + 1);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const startEdit = (id: DashboardEditableKey, value: number) => {
    setEditingId(id);
    setDraftValue(formatNumberInput(String(value)));
    setError('');
  };

  const saveEdit = (id: DashboardEditableKey, rawValue: string) => {
    const parsedValue = parseMoneyInput(stripNumberFormatting(rawValue));
    if (parsedValue === null) {
      setError('0 이상의 숫자와 소수점 둘째 자리까지만 저장할 수 있어요.');
      return;
    }
    if (id === 'totalAssets') setTotalAssets(parsedValue);
    else if (id === 'allowanceAmount') updateAllowanceSettings({ allowanceAmount: parsedValue });
    else setDashboardOverride(id, parsedValue);
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-black text-[rgb(var(--theme-text))]">Dashboard</p>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">
            {allowanceMode ? '오늘 얼마까지 써도 괜찮을까요?' : '지금 가진 돈으로 얼마나 여유롭게 생활할 수 있는지 확인해보세요.'}
          </h2>
        </div>
        {notice && <div className="rounded-lg bg-[rgb(var(--theme-soft))] px-4 py-3 text-sm font-black text-[rgb(var(--theme-text))]">{notice}</div>}
      </header>

      {allowanceMode && (
        <AllowanceSettingsCard settings={state.allowanceSettings} updateAllowanceSettings={updateAllowanceSettings} onSaveIncome={() => {
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
        }} />
      )}

      {allowanceMode ? (
        <AllowanceHero
          state={state}
          metrics={metrics}
          editingId={editingId}
          draftValue={draftValue}
          startEdit={startEdit}
          setDraftValue={setDraftValue}
          cancelEdit={cancelEdit}
          saveEdit={saveEdit}
        />
      ) : (
        <DefaultHero
          state={state}
          metrics={metrics}
          editingId={editingId}
          draftValue={draftValue}
          startEdit={startEdit}
          setDraftValue={setDraftValue}
          cancelEdit={cancelEdit}
          saveEdit={saveEdit}
        />
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-black">빠른 지출 입력</h3>
          <p className="text-sm font-semibold text-muted">첫 지출도 여기서 바로 추가할 수 있어요.</p>
        </div>
        <QuickExpense onAdd={addTransaction} />
      </Card>

      {error && <p className="rounded-lg bg-peach/70 px-4 py-3 text-sm font-black text-orange-800">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!allowanceMode && <EditableMoneyCard id="monthlyIncome" label="이번 달 수입" value={metrics.monthlyIncome} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<Coins size={22} />} editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />}
        {!allowanceMode && <EditableMoneyCard id="monthlyLivingBudget" label="이번 달 생활비 예산" value={metrics.monthlyLivingBudget} draftValue={draftValue} currencyCode={state.appSettings.currency} detail="고정지출을 제외한 생활비" icon={<CalendarDays size={22} />} tone="peach" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />}
        {!allowanceMode && <EditableMoneyCard id="averageMonthlyLivingCost" label="월 평균 생활비" value={metrics.averageMonthlyLivingCost} draftValue={draftValue} currencyCode={state.appSettings.currency} detail="예상 유지 기간 계산 기준" icon={<ShieldCheck size={22} />} tone="sky" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />}
        <ReadOnlyMetric label={allowanceMode ? '정기적으로 나가는 돈' : '고정지출'} value={formatCurrency(metrics.fixedExpenses)} detail="고정지출 탭의 합계가 자동 반영됩니다." />
        <ReadOnlyMetric label={allowanceMode ? '이번 주 사용 금액' : '이번 달 총 지출'} value={allowanceMode ? formatCurrency(getAllowanceMetrics(state.allowanceSettings, state.totalAssets, state.transactions).weeklyExpenses) : formatCurrency(metrics.monthlyExpenses)} detail={allowanceMode ? '최근 이번 주 지출 합계' : '생활비 예산 + 고정지출'} />
        <TopCategoryCard topCategory={topCategory} />
      </div>
    </div>
  );
}

function AllowanceHero(props: HeroProps) {
  const { state, metrics, editingId, draftValue, startEdit, setDraftValue, cancelEdit, saveEdit } = props;
  const allowance = getAllowanceMetrics(state.allowanceSettings, state.totalAssets, state.transactions);
  const recentAverage = calculateRecentAverageExpense(state.transactions, 7);
  const risk = getSpendingRiskLevel(recentAverage, allowance.safeDailyAllowance);
  const remainingRatio = clampRatio(state.allowanceSettings.allowanceAmount > 0 ? state.totalAssets / state.allowanceSettings.allowanceAmount : 0);

  return (
    <Card className="mx-auto max-w-4xl border-2 border-[rgb(var(--theme-mid))]">
      <div className="grid gap-6 lg:grid-cols-[1fr_190px] lg:items-center">
        <div>
          <RiskBadge risk={risk} />
          <p className="mt-4 text-sm font-black text-muted">오늘 사용할 수 있는 금액</p>
          <strong className="mt-2 block text-5xl font-black sm:text-6xl">{formatCurrency(allowance.safeDailyAllowance)}</strong>
          <p className="mt-3 text-muted">남은 {allowance.daysRemaining}일 동안 안정적으로 쓰기 위한 하루 기준이에요.</p>
          <p className="mt-4 rounded-lg bg-[rgb(var(--theme-soft))] p-3 text-sm font-black text-[rgb(var(--theme-text))]">{getSpendingRiskMessage(risk)}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniStat label="남은 기간" value={`${allowance.daysRemaining}일`} />
            <MiniStat label="현재 남은 금액" value={formatCurrency(metrics.totalAssets)} />
            <MiniStat label="현재 속도로" value={`${formatNumber(allowance.sustainableDays, 0)}일`} />
          </div>
        </div>
        <CircularProgress ratio={remainingRatio} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <EditableMoneyCard id="totalAssets" label="현재 남은 금액" value={metrics.totalAssets} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<Wallet size={22} />} editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
        <EditableMoneyCard id="allowanceAmount" label="받은 용돈" value={state.allowanceSettings.allowanceAmount} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<Coins size={22} />} tone="sky" editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
      </div>
    </Card>
  );
}

function DefaultHero(props: HeroProps) {
  const { state, metrics, editingId, draftValue, startEdit, setDraftValue, cancelEdit, saveEdit } = props;
  const recentAverage = calculateRecentAverageExpense(state.transactions, 7);
  const risk = getSpendingRiskLevel(recentAverage, metrics.safeDailyBudget);

  return (
    <Card className="mx-auto max-w-4xl border-2 border-[rgb(var(--theme-mid))]">
      <RiskBadge risk={risk} />
      <p className="mt-4 text-sm font-black text-muted">오늘 안전 사용 금액</p>
      <strong className="mt-2 block text-5xl font-black sm:text-6xl">{formatCurrency(metrics.safeDailyBudget)}</strong>
      <p className="mt-3 text-muted">현재 자산과 지출 기준으로 계산한 하루 기준이에요.</p>
      <p className="mt-4 rounded-lg bg-[rgb(var(--theme-soft))] p-3 text-sm font-black text-[rgb(var(--theme-text))]">{getSpendingRiskMessage(risk)}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MiniStat label="현재 자산" value={formatCurrency(metrics.totalAssets)} />
        <MiniStat label="예상 유지 가능 기간" value={`${formatNumber(metrics.survivalMonths)}개월`} />
        <MiniStat label="최근 7일 평균" value={formatCurrency(recentAverage)} />
      </div>
      <div className="mt-5">
        <EditableMoneyCard id="totalAssets" label="현재 총 자산" value={metrics.totalAssets} draftValue={draftValue} currencyCode={state.appSettings.currency} icon={<Wallet size={22} />} editingId={editingId} onStartEdit={startEdit} onDraftChange={setDraftValue} onCancel={cancelEdit} onSave={saveEdit} />
      </div>
    </Card>
  );
}

interface HeroProps {
  state: LedgerState;
  metrics: ReturnType<typeof getDashboardMetrics>;
  editingId: DashboardEditableKey | null;
  draftValue: string;
  startEdit: (id: DashboardEditableKey, value: number) => void;
  setDraftValue: (value: string) => void;
  cancelEdit: () => void;
  saveEdit: (id: DashboardEditableKey, value: string) => void;
}

function AllowanceSettingsCard({ settings, updateAllowanceSettings, onSaveIncome }: { settings: AllowanceSettings; updateAllowanceSettings: (settings: Partial<AllowanceSettings>) => void; onSaveIncome: () => void }) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSaveIncome();
  };

  return (
    <Card className="bg-white/90">
      <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1fr_170px_160px_160px_130px]">
        <input className="input" type="number" min="0" step="0.01" placeholder="이번에 받은 용돈 금액" value={settings.allowanceAmount || ''} onChange={(event) => {
          const parsed = parseMoneyInput(event.target.value);
          if (event.target.value === '' || parsed !== null) updateAllowanceSettings({ allowanceAmount: parsed ?? 0 });
        }} />
        <input className="input" type="date" value={settings.startDate} onChange={(event) => updateAllowanceSettings({ startDate: event.target.value })} />
        <select className="input" value={settings.cycleType} onChange={(event) => updateAllowanceSettings({ cycleType: event.target.value as AllowanceCycleType })}>
          {cycleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        {settings.cycleType === 'custom'
          ? <input className="input" type="number" min="1" placeholder="직접 일 수" value={settings.customDays ?? ''} onChange={(event) => updateAllowanceSettings({ customDays: Number(event.target.value) || null })} />
          : <div className="grid min-h-12 place-items-center rounded-lg bg-white/70 px-4 text-sm font-black text-muted">{cycleLabel(settings.cycleType)}</div>}
        <button className="btn-primary" type="submit">용돈 기록</button>
      </form>
    </Card>
  );
}

function RiskBadge({ risk }: { risk: SpendingRiskLevel }) {
  const label = risk === 'safe' ? '안전' : risk === 'caution' ? '주의' : '위험';
  const tone = risk === 'safe' ? 'bg-[rgb(var(--theme-soft))] text-[rgb(var(--theme-text))]' : risk === 'caution' ? 'bg-yellow-100 text-yellow-800' : 'bg-peach/70 text-orange-800';
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${tone}`}>{label}</span>;
}

function CircularProgress({ ratio }: { ratio: number }) {
  const degrees = ratio * 360;
  return (
    <div className="mx-auto grid h-40 w-40 place-items-center rounded-full" style={{ background: `conic-gradient(rgb(var(--theme-strong)) ${degrees}deg, rgba(var(--theme-soft), .75) 0deg)` }}>
      <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
        <div>
          <p className="text-3xl font-black">{Math.round(ratio * 100)}%</p>
          <p className="text-xs font-bold text-muted">남음</p>
          <p className="text-xs text-muted">{Math.round((1 - ratio) * 100)}% 사용</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white/75 p-3"><p className="text-xs font-bold text-muted">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}

function TopCategoryCard({ topCategory }: { topCategory: [string, number] | null }) {
  return (
    <Card>
      <p className="text-sm font-bold text-muted">이번 달 최다 지출 카테고리</p>
      {topCategory ? (
        <>
          <p className="mt-2 text-xl font-black">이번 달에는 {topCategory[0]}에 가장 많이 사용했어요.</p>
          <p className="mt-1 text-sm font-bold text-muted">{topCategory[0]}: {formatCurrency(topCategory[1])}</p>
        </>
      ) : (
        <p className="mt-2 text-sm font-bold text-slate-400">아직 이번 달 지출 기록이 없어요.</p>
      )}
    </Card>
  );
}

function ReadOnlyMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <Card className="min-h-40"><p className="text-sm font-semibold text-muted">{label}</p><strong className="mt-3 block text-2xl font-black leading-tight text-ink sm:text-3xl">{value}</strong><p className="mt-4 text-sm text-muted">{detail}</p></Card>;
}

function cycleLabel(cycleType: AllowanceCycleType) {
  return cycleOptions.find((option) => option.value === cycleType)?.label ?? '한 달 용돈';
}

function clampRatio(value: number) {
  return Math.min(Math.max(value, 0), 1);
}
