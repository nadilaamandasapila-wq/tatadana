'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

interface PeriodFilterProps {
  currentPeriod: PeriodType;
  onChange: (period: PeriodType) => void;
}

export function PeriodFilter({ currentPeriod, onChange }: PeriodFilterProps) {
  const options: Array<{ label: string; value: PeriodType }> = [
    { label: 'Harian', value: 'daily' },
    { label: 'Mingguan', value: 'weekly' },
    { label: 'Bulanan', value: 'monthly' },
    { label: 'Tahunan', value: 'yearly' },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              currentPeriod === opt.value
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
