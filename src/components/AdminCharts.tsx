import React from 'react';
import { LoanRecord } from '../types';
import {
  calculateComprehensiveStats,
  calculateInstallmentTotals,
  classifyBorrower,
  formatINR,
} from '../utils/loanCalculations';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Coins,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

interface AdminChartsProps {
  loans: LoanRecord[];
}

export const AdminCharts: React.FC<AdminChartsProps> = ({ loans }) => {
  const stats = calculateComprehensiveStats(loans);

  // 1. Calculate Payer Category Percentages for Donut
  const totalCount = loans.length || 1;
  const regularPct = Math.round((stats.sahiSeDeneWale / totalCount) * 100);
  const watchlistPct = Math.round((stats.dikkatKarneWale / totalCount) * 100);
  const defaulterPct = Math.round((stats.defaultersCount / totalCount) * 100);
  const closedPct = Math.round((stats.closedCount / totalCount) * 100);

  // SVG Circular Donut Math
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89
  const strokeDash = (pct: number) => (pct / 100) * circumference;

  let offset = 0;
  const regularOffset = offset;
  offset += strokeDash(regularPct);
  const watchlistOffset = offset;
  offset += strokeDash(watchlistPct);
  const defaulterOffset = offset;
  offset += strokeDash(defaulterPct);
  const closedOffset = offset;

  // 2. Slab Distribution Analysis
  const slabs = [
    { label: '₹ 50,000', amount: 50000 },
    { label: '₹ 1,00,000', amount: 100000 },
    { label: '₹ 1,50,000', amount: 150000 },
    { label: '₹ 2,00,000', amount: 200000 },
    { label: '₹ 3,50,000', amount: 350000 },
    { label: '₹ 4,00,000', amount: 400000 },
  ];

  const maxSlabDisbursed = Math.max(
    ...slabs.map((s) => {
      const match = loans.filter((l) => l.loanAmount === s.amount);
      return match.reduce((a, b) => a + b.loanAmount, 0);
    }),
    1
  );

  // 3. Simulated Monthly Collection Performance (Last 6 months)
  const monthlyData = [
    { month: 'मई 23', principal: 41666, interest: 11666, collected: 53332 },
    { month: 'जून 23', principal: 45000, interest: 11200, collected: 56200 },
    { month: 'जुलाई 23', principal: 52000, interest: 10800, collected: 62800 },
    { month: 'अगस्त 23', principal: 48000, interest: 10400, collected: 58400 },
    { month: 'सितंबर 23', principal: 56000, interest: 9900, collected: 65900 },
    { month: 'अक्टूबर 23', principal: 62000, interest: 9400, collected: 71400 },
  ];
  const maxMonthly = Math.max(...monthlyData.map((m) => m.collected), 80000);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Overall Recovery Progress Ring & Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                वसूली प्रगति दर
              </span>
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-center justify-center my-4 relative">
              <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="url(#emeraldGradient)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (stats.recoveryPercentage / 100) * circumference}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {stats.recoveryPercentage}%
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                  मूलधन वसूली
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">कुल स्वीकृत ऋण:</span>
              <span className="font-bold font-mono text-slate-900">{formatINR(stats.kitnaDiya)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">वसूल मूलधन राशि:</span>
              <span className="font-bold font-mono text-emerald-700">
                {formatINR(stats.totalPaidPrincipal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">शेष बकाया मूलधन:</span>
              <span className="font-bold font-mono text-amber-700">{formatINR(stats.kitnaBacha)}</span>
            </div>
          </div>
        </div>

        {/* CHART 2: Payer Behavior Donut Breakdown (Kitne Log Sahi Se De Rahe / Dikkat) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ऋणी व्यवहार विश्लेषण (Payer Donut)
              </span>
              <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <PieIcon className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-center justify-center my-3 relative">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#F1F5F9" strokeWidth="14" />
                
                {/* Regular (Green) */}
                {regularPct > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="14"
                    strokeDasharray={`${strokeDash(regularPct)} ${circumference}`}
                    strokeDashoffset={-regularOffset}
                  />
                )}

                {/* Watchlist (Amber) */}
                {watchlistPct > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="14"
                    strokeDasharray={`${strokeDash(watchlistPct)} ${circumference}`}
                    strokeDashoffset={-watchlistOffset}
                  />
                )}

                {/* Defaulter (Red) */}
                {defaulterPct > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#EF4444"
                    strokeWidth="14"
                    strokeDasharray={`${strokeDash(defaulterPct)} ${circumference}`}
                    strokeDashoffset={-defaulterOffset}
                  />
                )}

                {/* Closed (Blue) */}
                {closedPct > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#3B82F6"
                    strokeWidth="14"
                    strokeDasharray={`${strokeDash(closedPct)} ${circumference}`}
                    strokeDashoffset={-closedOffset}
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {loans.length}
                </span>
                <span className="text-[10px] text-slate-500">कुल सदस्य</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-700">
                नियमित ({stats.sahiSeDeneWale}) - {regularPct}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-700">
                विलंबित ({stats.dikkatKarneWale}) - {watchlistPct}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-700 font-bold text-rose-800">
                डिफ़ॉल्टर ({stats.defaultersCount}) - {defaulterPct}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-slate-700">
                पूर्ण चुकता ({stats.closedCount}) - {closedPct}%
              </span>
            </div>
          </div>
        </div>

        {/* CHART 3: Monthly Collection Performance Trends */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                मासिक वसूली रुझान (Monthly Trends)
              </span>
              <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </span>
            </div>

            {/* Vertical Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-2 pt-4 px-1">
              {monthlyData.map((d, idx) => {
                const heightPct = Math.round((d.collected / maxMonthly) * 100);
                const principalPct = Math.round((d.principal / d.collected) * 100);
                const interestPct = 100 - principalPct;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] font-mono text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                      ₹{(d.collected / 1000).toFixed(0)}k
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col justify-end bg-slate-100 transition-all group-hover:scale-105"
                    >
                      <div
                        style={{ height: `${interestPct}%` }}
                        className="bg-amber-400 w-full"
                        title={`ब्याज: ₹${d.interest}`}
                      />
                      <div
                        style={{ height: `${principalPct}%` }}
                        className="bg-emerald-600 w-full"
                        title={`मूलधन: ₹${d.principal}`}
                      />
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono mt-2 truncate w-full text-center">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-100 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> मूलधन वसूली
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> 14% ब्याज आय
            </span>
          </div>
        </div>
      </div>

      {/* CHART 4: Slab-wise Exposure Horizontal Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              ऋण स्लैब पूंजी निवेश एवं खाता वितरण (Slab Exposure)
            </h4>
            <p className="text-xs text-slate-500">
              ₹50,000 से ₹4,00,000 तक विभिन्न स्लैब में संस्था की स्वीकृत पूंजी का वितरण
            </p>
          </div>
          <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
            कुल: {formatINR(stats.kitnaDiya)}
          </span>
        </div>

        <div className="space-y-3">
          {slabs.map((slab) => {
            const matches = loans.filter((l) => l.loanAmount === slab.amount);
            const totalDisbursedForSlab = matches.reduce((a, b) => a + b.loanAmount, 0);
            const barWidthPct = maxSlabDisbursed > 0 
              ? Math.max(4, Math.round((totalDisbursedForSlab / maxSlabDisbursed) * 100))
              : 0;

            return (
              <div key={slab.amount} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 font-mono">
                    {slab.label} <span className="font-sans font-normal text-slate-500">({matches.length} खाते)</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(totalDisbursedForSlab)}
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${barWidthPct}%` }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-700"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
