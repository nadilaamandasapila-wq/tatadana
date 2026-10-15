'use client';

import React from 'react';
import { formatRupiah, formatCompactRupiah } from '@/lib/utils/currency';

interface CategoryPieData {
  name: string;
  amount: number;
  color: string;
}

export function DonutChart({ data }: { data: CategoryPieData[] }) {
  const total = data.reduce((acc, d) => acc + d.amount, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        Belum ada data pengeluaran
      </div>
    );
  }

  // Calculate SVG arc strokes
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="relative flex items-center justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
          {data.map((item, idx) => {
            const percent = item.amount / total;
            const strokeDashoffset = circumference - percent * circumference;
            const rotation = accumulatedPercent * 360;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={item.color || '#f97316'}
                strokeWidth="24"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation} 80 80)`}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute text-center">
          <div className="text-xs text-slate-400 font-medium">Total</div>
          <div className="text-sm font-bold text-slate-800">{formatCompactRupiah(total)}</div>
        </div>
      </div>

      <div className="flex-1 space-y-2 w-full">
        {data.slice(0, 5).map((item, idx) => {
          const pct = Math.round((item.amount / total) * 100);
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-slate-700 truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-slate-500 font-semibold">{pct}%</span>
                <span className="font-bold text-slate-900">{formatRupiah(item.amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MonthlyBarData {
  month: string;
  income: number;
  expense: number;
}

export function SixMonthBarChart({ data }: { data: MonthlyBarData[] }) {
  const total = data.reduce((sum, d) => sum + d.income + d.expense, 0);
  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        Belum ada catatan pemasukan atau pengeluaran 6 bulan terakhir
      </div>
    );
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1000000);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4 text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-slate-600">Pemasukan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-500" />
          <span className="text-slate-600">Pengeluaran</span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:gap-4 h-48 items-end border-b border-slate-100 pb-2">
        {data.map((item, idx) => {
          const incomeHeight = item.income > 0 ? Math.max(Math.round((item.income / maxVal) * 100), 6) : 0;
          const expenseHeight = item.expense > 0 ? Math.max(Math.round((item.expense / maxVal) * 100), 6) : 0;

          return (
            <div key={idx} className="flex flex-col items-center h-full justify-end group">
              <div className="flex items-end gap-1 sm:gap-2 w-full justify-center h-full">
                {/* Income Bar */}
                <div
                  className="w-3 sm:w-5 bg-emerald-500 rounded-t transition-all group-hover:brightness-110 relative"
                  style={{ height: `${incomeHeight}%` }}
                  title={`Pemasukan: ${formatRupiah(item.income)}`}
                />
                {/* Expense Bar */}
                <div
                  className="w-3 sm:w-5 bg-brand-500 rounded-t transition-all group-hover:brightness-110 relative"
                  style={{ height: `${expenseHeight}%` }}
                  title={`Pengeluaran: ${formatRupiah(item.expense)}`}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-2">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DailyTrendData {
  day: string;
  amount: number;
}

export function DailyTrendChart({ data }: { data: DailyTrendData[] }) {
  if (data.length === 0) return null;
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  if (total === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        Belum ada pengeluaran dalam 7 hari terakhir
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.amount), 100000);

  const points = data
    .map((d, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 100 - (d.amount / maxVal) * 80;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-2">
      <div className="relative h-32 w-full pt-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#trendGradient)"
          />
          {/* Line stroke */}
          <polyline
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
        <span>{data[0]?.day}</span>
        <span>{data[Math.floor(data.length / 2)]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}

