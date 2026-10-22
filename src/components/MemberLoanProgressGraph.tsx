import React from 'react';
import { LoanRecord } from '../types';
import { calculateInstallmentTotals, formatINR } from '../utils/loanCalculations';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Coins,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

interface MemberLoanProgressGraphProps {
  loan: LoanRecord;
  compact?: boolean;
}

export const MemberLoanProgressGraph: React.FC<MemberLoanProgressGraphProps> = ({
  loan,
  compact = false,
}) => {
  const totals = calculateInstallmentTotals(loan.installments);
  const sanctioned = loan.loanAmount;
  const paidPrincipal = totals.totalPaidPrincipal;
  const paidInterest = totals.totalPaidInterest;
  const outstanding = Math.max(0, sanctioned - paidPrincipal);

  const paidPercentage = Math.min(100, Math.max(0, (paidPrincipal / (sanctioned || 1)) * 100));
  const outstandingPercentage = Math.max(0, 100 - paidPercentage);

  const paidCount = loan.installments.filter(
    (i) => i.status === 'PAID' || i.status === 'DELAYED_PAID' || (i.totalPaid || 0) > 0
  ).length;
  const totalCount = loan.installments.length;
  const remainingCount = Math.max(0, totalCount - paidCount);

  const isFullyPaid = outstanding <= 0.01;

  return (
    <div className="bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 rounded-3xl border-2 border-rose-200/90 p-5 sm:p-6 shadow-md shadow-rose-950/5 space-y-5">
      {/* Header with Title and Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/80 pb-3.5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-black mb-1">
            <Coins className="w-3.5 h-3.5 text-rose-700" />
            <span>सदस्य ऋण स्थिति एवं भुगतान विश्लेषण ग्राफ</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <span>ऋण प्रगति: इतना लिया था, इतना दिया, अब इतना बचा</span>
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            14% वार्षिक घटती ब्याज दर अनुसार ऋणी सदस्य की वास्तविक देनदारी व जमा का स्पष्ट दृश्य
          </p>
        </div>

        {/* Repayment Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border flex items-center gap-1.5 shadow-xs ${
              isFullyPaid
                ? 'bg-emerald-600 text-white border-emerald-700'
                : paidPercentage >= 50
                ? 'bg-amber-100 text-amber-950 border-amber-300'
                : 'bg-rose-100 text-rose-950 border-rose-300'
            }`}
          >
            {isFullyPaid ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>100% पूर्ण चुकता (No Dues)</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-rose-700" />
                <span>{paidPercentage.toFixed(1)}% मूलधन चुकता</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 3 Prominent Stat Pillars: इतना लिया, इतना दिया, इतना बचा */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Pillar 1: इतना लिया था (स्वीकृत ऋण) */}
        <div className="bg-white rounded-2xl p-4 border-2 border-slate-300/80 shadow-xs relative overflow-hidden group hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              1. इतना लिया था (स्वीकृत ऋण)
            </span>
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
              1
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-950 tracking-tight">
            {formatINR(sanctioned)}
          </div>
          <div className="mt-2 text-[11px] text-slate-600 font-semibold space-y-0.5 border-t border-slate-100 pt-2">
            <div className="flex justify-between">
              <span>कुल अवधि:</span>
              <strong className="text-slate-900 font-mono">{loan.tenureMonths} माह</strong>
            </div>
            <div className="flex justify-between">
              <span>ब्याज दर:</span>
              <strong className="text-slate-900 font-mono">14% वार्षिक घटती</strong>
            </div>
          </div>
        </div>

        {/* Pillar 2: इतना दिया (जमा मूलधन) */}
        <div className="bg-gradient-to-br from-emerald-50/90 to-white rounded-2xl p-4 border-2 border-emerald-400 shadow-xs relative overflow-hidden group hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. इतना दिया (जमा मूलधन)</span>
            </span>
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              2
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 tracking-tight">
            {formatINR(paidPrincipal)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-900 font-semibold space-y-0.5 border-t border-emerald-200/60 pt-2">
            <div className="flex justify-between">
              <span>जमा किश्तें:</span>
              <strong className="text-emerald-950 font-mono">
                {paidCount} / {totalCount} किश्त
              </strong>
            </div>
            <div className="flex justify-between">
              <span>कुल ब्याज जमा:</span>
              <strong className="text-emerald-950 font-mono">{formatINR(paidInterest)}</strong>
            </div>
          </div>
        </div>

        {/* Pillar 3: अब इतना बचा (शेष बकाया) */}
        <div
          className={`rounded-2xl p-4 border-2 shadow-xs relative overflow-hidden group transition-colors ${
            isFullyPaid
              ? 'bg-gradient-to-br from-purple-50 to-white border-purple-300'
              : 'bg-gradient-to-br from-amber-50 to-rose-50/60 border-amber-400 hover:border-amber-500'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1 ${
                isFullyPaid ? 'text-purple-900' : 'text-amber-950'
              }`}
            >
              {isFullyPaid ? (
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              )}
              <span>3. अब इतना बचा (शेष देनदारी)</span>
            </span>
            <span
              className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shadow-xs ${
                isFullyPaid
                  ? 'bg-purple-700 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              3
            </span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
              isFullyPaid ? 'text-purple-700' : 'text-amber-800'
            }`}
          >
            {formatINR(outstanding)}
          </div>
          <div className="mt-2 text-[11px] text-slate-700 font-semibold space-y-0.5 border-t border-amber-200/60 pt-2">
            <div className="flex justify-between">
              <span>शेष किश्तें:</span>
              <strong className="text-slate-900 font-mono">
                {isFullyPaid ? '0 (शून्य)' : `${remainingCount} किश्त शेष`}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>खाता स्थिति:</span>
              <strong className="text-slate-900 font-mono">
                {isFullyPaid ? '✅ अदेय (No Dues)' : `${outstandingPercentage.toFixed(1)}% बकाया`}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar (The Dual-Colored Progress Track) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-black">
          <span className="text-emerald-800 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>जमा मूलधन: {paidPercentage.toFixed(1)}% ({formatINR(paidPrincipal)})</span>
          </span>
          <span className="text-amber-900 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span>शेष मूलधन: {outstandingPercentage.toFixed(1)}% ({formatINR(outstanding)})</span>
          </span>
        </div>

        {/* High-Definition Multi-segment Bar */}
        <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-300 shadow-inner flex">
          {/* Green paid segment */}
          <div
            style={{ width: `${paidPercentage}%` }}
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700 relative flex items-center justify-center text-[10px] font-black text-white shadow-xs"
          >
            {paidPercentage >= 15 && (
              <span className="truncate px-1 font-mono">
                {paidPercentage.toFixed(0)}% जमा
              </span>
            )}
          </div>

          {/* Amber/Rose remaining segment */}
          <div
            style={{ width: `${outstandingPercentage}%` }}
            className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full transition-all duration-700 flex items-center justify-center text-[10px] font-black text-slate-950"
          >
            {outstandingPercentage >= 15 && (
              <span className="truncate px-1 font-mono">
                {outstandingPercentage.toFixed(0)}% शेष
              </span>
            )}
          </div>
        </div>

        {/* 3 Proportional Comparative Bars */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          {/* Bar 1: Total Sanctioned */}
          <div className="flex items-center gap-3">
            <span className="w-28 text-[11px] font-bold text-slate-600 shrink-0">
              कुल स्वीकृत ऋण:
            </span>
            <div className="flex-1 bg-slate-100 rounded-lg h-3 overflow-hidden">
              <div className="bg-slate-700 h-full rounded-lg w-full"></div>
            </div>
            <span className="w-24 text-right font-mono font-bold text-slate-900 text-xs shrink-0">
              {formatINR(sanctioned)}
            </span>
          </div>

          {/* Bar 2: Paid Principal */}
          <div className="flex items-center gap-3">
            <span className="w-28 text-[11px] font-bold text-emerald-800 shrink-0">
              जमा मूलधन:
            </span>
            <div className="flex-1 bg-slate-100 rounded-lg h-3 overflow-hidden">
              <div
                style={{ width: `${paidPercentage}%` }}
                className="bg-emerald-600 h-full rounded-lg transition-all duration-500"
              ></div>
            </div>
            <span className="w-24 text-right font-mono font-bold text-emerald-700 text-xs shrink-0">
              {formatINR(paidPrincipal)}
            </span>
          </div>

          {/* Bar 3: Remaining Principal */}
          <div className="flex items-center gap-3">
            <span className="w-28 text-[11px] font-bold text-amber-900 shrink-0">
              शेष मूलधन:
            </span>
            <div className="flex-1 bg-slate-100 rounded-lg h-3 overflow-hidden">
              <div
                style={{ width: `${outstandingPercentage}%` }}
                className="bg-amber-500 h-full rounded-lg transition-all duration-500"
              ></div>
            </div>
            <span className="w-24 text-right font-mono font-bold text-amber-700 text-xs shrink-0">
              {formatINR(outstanding)}
            </span>
          </div>
        </div>
      </div>

      {/* Insight Summary Banner */}
      <div
        className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
          isFullyPaid
            ? 'bg-purple-50 border-purple-200 text-purple-950 font-bold'
            : 'bg-rose-50/80 border-rose-200 text-rose-950'
        }`}
      >
        {isFullyPaid ? (
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        )}
        <div className="leading-relaxed">
          {isFullyPaid ? (
            <span>
              🎉 <strong>ऋण पूर्ण चुकता:</strong> सदस्य <strong>{loan.borrowerName}</strong> द्वारा लिया गया संपूर्ण ऋण ₹{formatINR(sanctioned)} पूर्ण रूप से चुकता हो चुका है। संस्था द्वारा कोई देनदारी शेष नहीं है।
            </span>
          ) : (
            <span>
              💡 <strong>भुगतान सारांश:</strong> सदस्य <strong>{loan.borrowerName}</strong> (खाता क्र. {loan.accountNo}) ने स्वीकृत ऋण <strong>{formatINR(sanctioned)}</strong> में से <strong>{formatINR(paidPrincipal)}</strong> मूलधन तथा <strong>{formatINR(paidInterest)}</strong> ब्याज संस्था में जमा कर दिया है। वर्तमान में केवल <strong>{formatINR(outstanding)}</strong> मूलधन शेष बकाया बचा है।
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
