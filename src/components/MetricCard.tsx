import type { ReactNode } from 'react';
import { Card } from './Card';

interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: 'mint' | 'peach' | 'sky' | 'lavender';
}

const toneClass = {
  mint: 'bg-mint/60 text-emerald-700',
  peach: 'bg-peach/70 text-orange-700',
  sky: 'bg-sky/70 text-blue-700',
  lavender: 'bg-lavender/70 text-violet-700',
};

export function MetricCard({ label, value, detail, icon, tone = 'mint' }: MetricCardProps) {
  return (
    <Card className="min-h-36">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">{label}</p>
          <strong className="mt-3 block text-2xl font-black leading-tight text-ink sm:text-3xl">{value}</strong>
        </div>
        {icon && <div className={`rounded-lg p-3 ${toneClass[tone]}`}>{icon}</div>}
      </div>
      {detail && <p className="mt-4 text-sm text-muted">{detail}</p>}
    </Card>
  );
}
