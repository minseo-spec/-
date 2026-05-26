import type { ReactNode } from 'react';
import { BarChart3, CalendarDays, Coins, Home, PiggyBank, ReceiptText, Repeat, Settings, Sparkles, Table2 } from 'lucide-react';
import type { ThemeName } from '../types';

export type Page = 'dashboard' | 'expenses' | 'calendar' | 'month' | 'day' | 'year' | 'fixed' | 'goals' | 'analysis' | 'settings';

interface LayoutProps {
  children: ReactNode;
  page: Page;
  allowanceMode: boolean;
  selectedTheme: ThemeName;
  onNavigate: (page: Page) => void;
  onToggleAllowanceMode: (enabled: boolean) => void;
}

const navItems = [
  { page: 'dashboard', label: '대시보드', allowanceLabel: '대시보드', icon: Home },
  { page: 'expenses', label: '지출', allowanceLabel: '사용 내역', icon: ReceiptText },
  { page: 'calendar', label: '달력', allowanceLabel: '달력', icon: CalendarDays },
  { page: 'year', label: '12개월', allowanceLabel: '12개월', icon: Table2 },
  { page: 'fixed', label: '고정지출', allowanceLabel: '정기 지출', icon: Repeat },
  { page: 'goals', label: '저축목표', allowanceLabel: '모으기 목표', icon: PiggyBank },
  { page: 'analysis', label: '분석예측', allowanceLabel: '사용 분석', icon: BarChart3 },
  { page: 'settings', label: '설정', allowanceLabel: '설정', icon: Settings },
] as const;

export function Layout({ children, page, allowanceMode, selectedTheme, onNavigate, onToggleAllowanceMode }: LayoutProps) {
  return (
    <div className={`theme-${selectedTheme} min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(var(--theme-mid),.30),transparent_34%),linear-gradient(135deg,rgba(var(--theme-soft),.95),rgba(var(--theme-soft),.72))] text-ink`}>
      <aside className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-white/92 px-2 py-2 backdrop-blur lg:bottom-auto lg:right-auto lg:top-0 lg:h-screen lg:w-64 lg:border-r lg:border-t-0 lg:p-5">
        <div className="mb-8 hidden items-center gap-3 lg:flex">
          <div className="rounded-lg bg-[rgb(var(--theme-soft))] p-3 text-[rgb(var(--theme-mid))]"><Coins size={24} /></div>
          <div>
            <h1 className="text-lg font-black text-[rgb(var(--theme-mid))]">Remain</h1>
            <p className="text-xs font-semibold text-muted">{allowanceMode ? '용돈 플래너' : '생활비 플래너'}</p>
          </div>
        </div>
        <nav className="flex justify-around gap-1 lg:flex-col lg:justify-start">
          {navItems.map(({ page: itemPage, label, allowanceLabel, icon: Icon }) => {
            const active = page === itemPage;
            return (
              <button
                key={itemPage}
                className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-xs font-bold transition lg:flex-none lg:justify-start lg:px-4 lg:text-sm ${
                  active ? 'bg-[rgb(var(--theme-strong))] text-white' : 'text-muted hover:bg-white'
                }`}
                onClick={() => onNavigate(itemPage)}
                type="button"
                title={allowanceMode ? allowanceLabel : label}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{allowanceMode ? allowanceLabel : label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-8 lg:pb-10">{children}</main>
      <div className="fixed right-4 top-4 z-30 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-muted shadow-soft backdrop-blur">
        <Sparkles className={allowanceMode ? 'text-emerald-500' : 'text-slate-400'} size={15} />
        <span>용돈 모드 {allowanceMode ? 'ON' : 'OFF'}</span>
        <button
          className={`h-6 w-11 rounded-full p-1 transition ${allowanceMode ? 'bg-[rgb(var(--theme-mid))]' : 'bg-slate-200'}`}
          type="button"
          onClick={() => onToggleAllowanceMode(!allowanceMode)}
          aria-label="용돈 모드 토글"
        >
          <span className={`block h-4 w-4 rounded-full bg-white shadow transition ${allowanceMode ? 'translate-x-5' : ''}`} />
        </button>
      </div>
    </div>
  );
}
