import type { Page } from '../components/Layout';
import { Card } from '../components/Card';
import type { LedgerState } from '../types';
import { getDailyCalendarCells, getTransactionsByDate } from '../utils/calculations';
import { currentMonthKey, formatMonthLabel } from '../utils/date';
import { formatCurrency } from '../utils/format';

interface CalendarPageProps {
  state: LedgerState;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onSelectDate: (date: string) => void;
  onNavigate: (page: Page) => void;
}

export function CalendarPage({ state, selectedMonth, onSelectMonth, onSelectDate, onNavigate }: CalendarPageProps) {
  const cells = getDailyCalendarCells(selectedMonth);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black text-emerald-700">Calendar</p>
          <h2 className="mt-2 text-3xl font-black">{formatMonthLabel(selectedMonth)}</h2>
        </div>
        <div className="flex gap-2">
          <input className="input" type="month" value={selectedMonth} onChange={(event) => onSelectMonth(event.target.value)} />
          <button className="btn-secondary" onClick={() => onNavigate('month')} type="button">월 상세</button>
        </div>
      </header>

      <Card>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-muted">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => <div key={day}>{day}</div>)}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {cells.map((date, index) => {
            const items = date ? getTransactionsByDate(state.transactions, date) : [];
            const spending = items.filter((item) => item.type === 'expense').reduce((total, item) => total + item.amount, 0);
            return (
              <button
                key={`${date}-${index}`}
                className={`min-h-24 rounded-lg border p-2 text-left transition ${date ? 'border-line bg-white hover:border-emerald-300 hover:bg-mint/30' : 'border-transparent'}`}
                onClick={() => {
                  if (!date) return;
                  onSelectDate(date);
                  onNavigate('day');
                }}
                type="button"
              >
                {date && <><p className="font-black">{Number(date.slice(-2))}</p>{spending > 0 && <p className="mt-3 text-xs font-bold text-orange-700">{formatCurrency(spending)}</p>}</>}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
