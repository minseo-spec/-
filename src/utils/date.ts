export const currentMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const currentDateKey = (date = new Date()) =>
  `${currentMonthKey(date)}-${String(date.getDate()).padStart(2, '0')}`;

export const getMonthDays = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

export const getRemainingDaysInMonth = (date = new Date()) => {
  const totalDays = getMonthDays(currentMonthKey(date));
  return Math.max(totalDays - date.getDate() + 1, 1);
};

export const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  return `${year}년 ${Number(month)}월`;
};
