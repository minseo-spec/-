import type { CurrencyCode } from '../types';

export const currencyOptions: Record<CurrencyCode, { code: CurrencyCode; symbol: string; locale: string; label: string }> = {
  KRW: { code: 'KRW', symbol: '₩', locale: 'ko-KR', label: '원화 KRW ₩' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', label: '달러 USD $' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', label: '엔 JPY ¥' },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN', label: '위안 CNY ¥' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', label: '유로 EUR €' },
};

export function formatMoney(value: number, currency = currencyOptions[getCurrentCurrency()]) {
  const amount = new Intl.NumberFormat(currency.locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
  return `${currency.symbol}${amount}`;
}

export const formatCurrency = (value: number) => formatMoney(value);

export const formatNumber = (value: number, digits = 1) =>
  Number.isFinite(value) ? value.toFixed(digits) : '0.0';

export const percent = (value: number) => `${Math.round(value)}%`;

function getCurrentCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'KRW';
  try {
    const legacyKey = ['finance', 'survival', 'ledger'].join('-');
    const saved = window.localStorage.getItem('remain-ledger') ?? window.localStorage.getItem(legacyKey);
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed?.appSettings?.currency ?? 'KRW';
  } catch {
    return 'KRW';
  }
}
