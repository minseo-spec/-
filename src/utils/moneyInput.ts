export const moneyInputPattern = '^\\d+(\\.\\d{0,2})?$';

export function isValidMoneyInput(value: string) {
  return /^\d+(\.\d{0,2})?$/.test(value.trim());
}

export function parseMoneyInput(value: string) {
  const normalized = value.replace(/,/g, '').trim();
  if (!isValidMoneyInput(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
