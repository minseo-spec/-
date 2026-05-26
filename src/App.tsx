import { useState } from 'react';
import { Layout, type Page } from './components/Layout';
import { useLedger } from './hooks/useLedger';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { CalendarPage } from './pages/CalendarPage';
import { MonthDetail } from './pages/MonthDetail';
import { DayDetail } from './pages/DayDetail';
import { YearView } from './pages/YearView';
import { FixedExpenses } from './pages/FixedExpenses';
import { SavingsGoals } from './pages/SavingsGoals';
import { AnalysisForecast } from './pages/AnalysisForecast';
import { Settings } from './pages/Settings';
import { getDashboardMetrics } from './utils/calculations';
import { currentDateKey, currentMonthKey } from './utils/date';

export default function App() {
  const { state, actions } = useLedger();
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [selectedDate, setSelectedDate] = useState(currentDateKey());
  const metrics = getDashboardMetrics(state);

  return (
    <Layout
      page={page}
      allowanceMode={state.allowanceSettings.enabled}
      selectedTheme={state.appSettings.selectedTheme}
      onNavigate={setPage}
      onToggleAllowanceMode={(enabled) => actions.updateAllowanceSettings({ enabled })}
    >
      {page === 'dashboard' && (
        <Dashboard
          state={state}
          setTotalAssets={actions.setTotalAssets}
          setDashboardOverride={actions.setDashboardOverride}
          updateAllowanceSettings={actions.updateAllowanceSettings}
          addTransaction={actions.addTransaction}
        />
      )}
      {page === 'expenses' && (
        <Expenses
          transactions={state.transactions}
          allowanceMode={state.allowanceSettings.enabled}
          addTransaction={actions.addTransaction}
          updateTransaction={actions.updateTransaction}
          deleteTransaction={actions.deleteTransaction}
        />
      )}
      {page === 'calendar' && (
        <CalendarPage
          state={state}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          onSelectDate={setSelectedDate}
          onNavigate={setPage}
        />
      )}
      {page === 'month' && (
        <MonthDetail
          state={state}
          month={selectedMonth}
          addTransaction={actions.addTransaction}
          deleteTransaction={actions.deleteTransaction}
        />
      )}
      {page === 'day' && (
        <DayDetail
          state={state}
          date={selectedDate}
          addTransaction={actions.addTransaction}
          deleteTransaction={actions.deleteTransaction}
        />
      )}
      {page === 'year' && (
        <YearView
          state={state}
          year={Number(selectedMonth.slice(0, 4))}
          onSelectMonth={setSelectedMonth}
          onNavigate={setPage}
          updateMonthlySetting={actions.updateMonthlySetting}
        />
      )}
      {page === 'fixed' && (
        <FixedExpenses
          expenses={state.fixedExpenses}
          addFixedExpense={actions.addFixedExpense}
          toggleFixedExpense={actions.toggleFixedExpense}
          deleteFixedExpense={actions.deleteFixedExpense}
        />
      )}
      {page === 'goals' && (
        <SavingsGoals
          goals={state.savingsGoals}
          addSavingsGoal={actions.addSavingsGoal}
          updateSavingsGoal={actions.updateSavingsGoal}
          possibleSavings={metrics.possibleSavings}
        />
      )}
      {page === 'analysis' && <AnalysisForecast state={state} />}
      {page === 'settings' && <Settings state={state} updateAppSettings={actions.updateAppSettings} reset={actions.reset} />}
    </Layout>
  );
}
