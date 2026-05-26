import { useEffect, useRef, type ReactNode } from 'react';
import { Edit3 } from 'lucide-react';
import { Card } from './Card';
import { currencyOptions, formatCurrency } from '../utils/format';
import type { CurrencyCode } from '../types';

export interface EditableMoneyCardProps<TId extends string> {
  id: TId;
  label: string;
  value: number;
  draftValue: string;
  currencyCode?: CurrencyCode;
  detail?: string;
  icon?: ReactNode;
  tone?: 'mint' | 'peach' | 'sky' | 'lavender';
  editingId: TId | null;
  onStartEdit: (id: TId, value: number) => void;
  onDraftChange: (value: string) => void;
  onCancel: () => void;
  onSave: (id: TId, value: string) => void;
}

const toneClass = {
  mint: 'bg-mint/60 text-emerald-700',
  peach: 'bg-peach/70 text-orange-700',
  sky: 'bg-sky/70 text-blue-700',
  lavender: 'bg-lavender/70 text-violet-700',
};

const numberFormatter = new Intl.NumberFormat('ko-KR');

export const stripNumberFormatting = (value: string) => value.replace(/[^\d.]/g, '');

export const formatNumberInput = (value: string) => {
  const cleanValue = stripNumberFormatting(value);
  if (!cleanValue) return '';
  const [integerPart, decimalPart] = cleanValue.split('.');
  if (cleanValue.split('.').length > 2) return value;
  const formattedInteger = numberFormatter.format(Number(integerPart || 0));
  return decimalPart === undefined ? formattedInteger : `${formattedInteger}.${decimalPart.slice(0, 2)}`;
};

export function EditableMoneyCard<TId extends string>({
  id,
  label,
  value,
  draftValue,
  currencyCode,
  detail,
  icon,
  tone = 'mint',
  editingId,
  onStartEdit,
  onDraftChange,
  onCancel,
  onSave,
}: EditableMoneyCardProps<TId>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = editingId === id;
  const currency = currencyOptions[currencyCode ?? getCurrentCurrencyCode()];

  useEffect(() => {
    if (!isEditing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSave(id, draftValue);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <Card className="min-h-40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-muted">{label}</p>
          {isEditing ? (
            <div className="mt-3 space-y-3">
              <div className="flex overflow-hidden rounded-lg border border-emerald-200 bg-white focus-within:ring-4 focus-within:ring-emerald-100">
                <span className="grid min-h-12 place-items-center bg-[rgb(var(--theme-soft))] px-3 text-sm font-black text-[rgb(var(--theme-text))]">{currency.symbol}</span>
                <input
                  ref={inputRef}
                  className="min-h-12 w-full px-3 text-lg font-black outline-none"
                  inputMode="decimal"
                  pattern="^\d+(\.\d{0,2})?$"
                  value={draftValue}
                  onChange={(event) => onDraftChange(formatNumberInput(event.target.value))}
                  onKeyDown={handleKeyDown}
                  aria-label={`${label} 수정`}
                />
              </div>
              <div className="flex gap-2">
                <button className="btn-primary min-h-10 px-3" type="button" onClick={() => onSave(id, draftValue)}>저장</button>
                <button className="btn-muted min-h-10 px-3" type="button" onClick={onCancel}>취소</button>
              </div>
            </div>
          ) : (
            <strong className="mt-3 block text-2xl font-black leading-tight text-ink sm:text-3xl">{formatCurrency(value)}</strong>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {icon && <div className={`rounded-lg p-3 ${toneClass[tone]}`}>{icon}</div>}
          {!isEditing && (
            <button className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-black text-muted transition hover:bg-mint hover:text-emerald-800" type="button" onClick={() => onStartEdit(id, value)}>
              <Edit3 size={14} />
              Edit
            </button>
          )}
        </div>
      </div>
      {detail && !isEditing && <p className="mt-4 text-sm text-muted">{detail}</p>}
    </Card>
  );
}

function getCurrentCurrencyCode(): CurrencyCode {
  try {
    const legacyKey = ['finance', 'survival', 'ledger'].join('-');
    const saved = window.localStorage.getItem('remain-ledger') ?? window.localStorage.getItem(legacyKey);
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed?.appSettings?.currency ?? 'KRW';
  } catch {
    return 'KRW';
  }
}
