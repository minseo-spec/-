import { Check } from 'lucide-react';
import { Card } from '../components/Card';
import type { AppSettings, CurrencyCode, LedgerState, ThemeName } from '../types';
import { currencyOptions } from '../utils/format';
import { themeOptions } from '../utils/themes';

interface SettingsProps {
  state: LedgerState;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  restartOnboarding: () => void;
  reset: () => void;
}

export function Settings({ state, updateAppSettings, restartOnboarding, reset }: SettingsProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-black text-[rgb(var(--theme-text))]">Settings</p>
        <h2 className="mt-2 text-3xl font-black">설정</h2>
        <p className="mt-2 text-sm font-bold text-muted">Remain의 표시 방식과 환경을 관리합니다.</p>
      </header>

      <Card>
        <h3 className="text-xl font-black">통화 설정</h3>
        <p className="mt-2 text-sm font-semibold text-muted">환율 변환 없이 표시 기호와 형식만 바뀝니다.</p>
        <select
          className="input mt-4 max-w-sm"
          value={state.appSettings.currency}
          onChange={(event) => updateAppSettings({ currency: event.target.value as CurrencyCode })}
        >
          {Object.values(currencyOptions).map((currency) => (
            <option key={currency.code} value={currency.code}>{currency.label}</option>
          ))}
        </select>
      </Card>

      <Card>
        <h3 className="text-xl font-black">테마 색상</h3>
        <p className="mt-2 text-sm font-semibold text-muted">앱 전체 버튼, 탭, 포커스, 강조색에 적용됩니다.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {themeOptions.map((theme) => {
            const selected = state.appSettings.selectedTheme === theme.name;
            return (
              <button
                key={theme.name}
                className={`relative grid h-12 w-12 place-items-center rounded-full border-4 transition ${selected ? 'border-ink' : 'border-white shadow-soft'}`}
                style={{ background: `linear-gradient(135deg, ${theme.soft} 0 50%, ${theme.strong} 50% 100%)` }}
                type="button"
                title={theme.label}
                onClick={() => updateAppSettings({ selectedTheme: theme.name as ThemeName })}
              >
                {selected && <Check className="rounded-full bg-white/90 p-0.5 text-ink" size={22} />}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="font-black">데이터 관리</p>
        <p className="mt-2 text-sm text-muted">입력한 데이터와 앱 설정은 이 브라우저의 localStorage에 저장됩니다.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={restartOnboarding} type="button">온보딩 다시 보기</button>
          <button className="btn-muted" onClick={reset} type="button">초기화</button>
        </div>
      </Card>
    </div>
  );
}
