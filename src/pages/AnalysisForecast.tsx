import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import type { LedgerState } from '../types';
import { forecastSurvival, getCategoryTotals, getDashboardMetrics } from '../utils/calculations';
import { currentMonthKey } from '../utils/date';
import { formatCurrency, formatNumber } from '../utils/format';

interface AnalysisForecastProps {
  state: LedgerState;
}

export function AnalysisForecast({ state }: AnalysisForecastProps) {
  const metrics = getDashboardMetrics(state);
  const categoryTotals = [...getCategoryTotals(state.transactions, currentMonthKey()).entries()].sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(...categoryTotals.map(([, amount]) => amount), 1);

  const scenarios = [
    { label: '현재 소비 패턴이면', value: metrics.survivalMonths, icon: TrendingUp },
    { label: '수입이 20% 줄면', value: forecastSurvival(state.totalAssets, metrics.averageMonthlyLivingCost, -0.2), icon: ArrowDown },
    { label: '생활비를 15% 줄이면', value: forecastSurvival(state.totalAssets, metrics.averageMonthlyLivingCost, 0, -0.15), icon: ArrowUp },
    { label: '고정지출이 20만원 늘면', value: forecastSurvival(state.totalAssets, metrics.averageMonthlyLivingCost, 0, 0, 200000), icon: ArrowDown },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-black text-emerald-700">Analysis / Forecast</p>
        <h2 className="mt-2 text-3xl font-black">소비 분석과 미래 예측</h2>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scenarios.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <Icon className="text-emerald-600" size={24} />
            <p className="mt-4 text-sm font-bold text-muted">{label}</p>
            <p className="mt-1 text-3xl font-black">{formatNumber(value)}개월</p>
            <p className="mt-2 text-sm text-muted">유지 가능</p>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="text-xl font-black">카테고리별 지출</h3>
        <div className="mt-5 space-y-4">
          {categoryTotals.length === 0 && <p className="rounded-lg bg-mint/40 p-4 text-muted">아직 분석할 지출이 없어요.</p>}
          {categoryTotals.map(([category, amount], index) => (
            <div key={category} className={`rounded-lg p-4 ${index === 0 ? 'bg-peach/60' : 'bg-cream/70'}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-black">{category}{index === 0 ? ' · 최다 지출' : ''}</p>
                <p className="font-black">{formatCurrency(amount)}</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${amount / maxCategory * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
