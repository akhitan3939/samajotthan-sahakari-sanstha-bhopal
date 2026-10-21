import React, { useState, useMemo } from 'react';
import {
  formatINR,
  generateSchedule,
  calculateInstallmentTotals,
  exportToCSV,
  getStandardPreEmi,
} from '../utils/loanCalculations';
import { INITIAL_LOAN_SLABS } from '../data/initialData';
import {
  Calculator,
  Calendar,
  Percent,
  ShieldCheck,
  ArrowRight,
  X,
  Coins,
  Receipt,
  Download,
  Printer,
  TrendingDown,
  Building2,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface EmiCalculatorProps {
  initialAmount?: number;
  initialTenure?: number;
  onClose?: () => void;
  onApplyLoan?: (amount: number, tenure: number) => void;
  isInline?: boolean;
}

export const EmiCalculator: React.FC<EmiCalculatorProps> = ({
  initialAmount = 50000,
  initialTenure = 24,
  onClose,
  onApplyLoan,
  isInline = false,
}) => {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [tenure, setTenure] = useState<number>(initialTenure);
  const [rate, setRate] = useState<number>(14);

  // Preset Slabs handler
  const handleSelectPreset = (presetAmount: number, presetTenure: number) => {
    setAmount(presetAmount);
    setTenure(presetTenure);
  };

  // Generate full 24 or 36 month reducing schedule matching Image 3
  const schedule = useMemo(() => {
    return generateSchedule(amount, rate, tenure);
  }, [amount, rate, tenure]);

  const totals = useMemo(() => {
    return calculateInstallmentTotals(schedule);
  }, [schedule]);

  const firstEmi = schedule[0];
  const lastEmi = schedule[schedule.length - 1];

  // Upfront Pre-EMI & Cheque Deductions: 50k->2500, 100k->5000, 150k->7500, 200k->10000, 300k->15000, 350k->17500, 400k->20000
  const preEmi = getStandardPreEmi(amount);
  const processingFee = 500;
  const buildingFund = 300;
  const totalUpfrontDeductions = preEmi + processingFee + buildingFund;
  const netInHandCheque = Math.max(0, amount - totalUpfrontDeductions);

  // Export calculated schedule to CSV
  const handleExportScheduleCSV = () => {
    const headers = [
      'ईएमआई क्र.',
      'देय तिथि',
      'देय मूलधन (₹)',
      'देय ब्याज 14% घटता हुआ (₹)',
      'कुल देय किस्त (₹)',
      'शेष ऋण मूलधन (₹)',
    ];
    const rows = schedule.map((r) => [
      r.emiNo,
      r.dueDate,
      r.duePrincipal,
      r.dueInterest,
      r.totalDue,
      r.remainingPrincipal,
    ]);
    exportToCSV(`samajotthan-emi-chart-${amount}-${tenure}m.csv`, [headers, ...rows]);
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <div
      id="loan-calculator"
      className={`bg-white rounded-3xl border border-rose-200/90 shadow-xl shadow-rose-100/50 overflow-hidden w-full ${
        isInline ? 'my-4' : 'max-w-5xl mx-auto'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white px-6 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-pink-500 rounded-xl text-white font-bold shadow-md">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                संस्था ऋण स्लैब एवं ईएमआई कैलकुलेटर (घटते ब्याज क्रम - Reducing Balance)
              </h3>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-pink-300 border border-rose-500/40">
                14% वार्षिक
              </span>
            </div>
            <p className="text-xs text-rose-200/80 mt-0.5">
              प्री-ईएमआई, ₹500 प्रोसेसिंग फीस व ₹300 भवन निधि के बाद निवल देय चेक राशि का पूर्ण विवरण
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* 1. PRESET LOAN SLABS SELECTION (50k, 1L, 1.5L, 2L, 3.5L, 4L) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-rose-600" />
              <span>संस्था के अधिकृत ऋण स्लैब चुनें:</span>
            </span>
            <span className="text-xs text-rose-800/80 font-medium">
              3.5L व 4L स्लैब 36 माह, शेष 24 माह की योजना
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {INITIAL_LOAN_SLABS.map((slab) => {
              const isSelected = amount === slab.amount && tenure === slab.tenureMonths;
              return (
                <button
                  key={slab.amount}
                  onClick={() => handleSelectPreset(slab.amount, slab.tenureMonths)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-rose-700 to-pink-700 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                      : 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-100/60 text-slate-800'
                  }`}
                >
                  <span className="text-xs font-extrabold block">{formatINR(slab.amount)}</span>
                  <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-pink-200' : 'text-slate-500'}`}>
                    {slab.tenureMonths} माह अवधि
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. CUSTOM AMOUNT & TENURE SLIDERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-rose-50/40 p-5 rounded-2xl border border-rose-200/80">
          {/* Custom Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">ऋण राशि (Loan Amount):</span>
              <span className="font-mono font-extrabold text-rose-800 text-base">
                {formatINR(amount)}
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="500000"
              step="5000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-rose-700 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>₹20,000</span>
              <span>₹5,00,000</span>
            </div>
          </div>

          {/* Tenure Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">किस्त अवधि (Tenure):</span>
              <span className="font-mono font-extrabold text-slate-900 text-base">
                {tenure} माह ({tenure / 12} वर्ष)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTenure(24)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tenure === 24
                    ? 'bg-rose-900 text-white shadow-sm'
                    : 'bg-white border border-rose-200 text-slate-700 hover:bg-rose-50'
                }`}
              >
                24 माह (2 वर्ष)
              </button>
              <button
                type="button"
                onClick={() => setTenure(36)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tenure === 36
                    ? 'bg-rose-900 text-white shadow-sm'
                    : 'bg-white border border-rose-200 text-slate-700 hover:bg-rose-50'
                }`}
              >
                36 माह (3 वर्ष)
              </button>
            </div>
          </div>

          {/* Fixed Cooperative Rate */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-slate-700 block">वार्षिक ब्याज दर (Annual Rate):</span>
            <div className="p-2.5 bg-white border border-rose-200 rounded-xl flex items-center justify-between">
              <span className="font-extrabold text-rose-800 font-mono text-base">14.0% p.a.</span>
              <span className="text-[11px] text-slate-500">घटता ब्याज नियम</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              प्रति माह ब्याज वास्तविक शेष मूलधन पर ही लगता है, जिससे किश्तें निरंतर घटती जाती हैं।
            </p>
          </div>
        </div>

        {/* 3. CORE EMI METRICS (First EMI, Last EMI, Interest, Principal) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">मासिक स्थिर मूलधन:</span>
            <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
              {formatINR(firstEmi?.duePrincipal || 0)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{tenure} माह तक समान</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">प्रथम माह की किश्त (उच्चतम):</span>
            <div className="text-xl font-extrabold font-mono text-amber-700 mt-1">
              {formatINR(firstEmi?.totalDue || 0)}
            </div>
            <span className="text-[10px] text-amber-800 mt-0.5 block">
              मूल {formatINR(firstEmi?.duePrincipal || 0)} + ब्याज {formatINR(firstEmi?.dueInterest || 0)}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">अंतिम माह की किश्त (न्यूनतम):</span>
            <div className="text-xl font-extrabold font-mono text-emerald-700 mt-1">
              {formatINR(lastEmi?.totalDue || 0)}
            </div>
            <span className="text-[10px] text-emerald-800 mt-0.5 block">
              ब्याज घटकर मात्र {formatINR(lastEmi?.dueInterest || 0)}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">कुल देय ब्याज ({tenure} माह):</span>
            <div className="text-xl font-extrabold font-mono text-blue-700 mt-1">
              {formatINR(totals.totalDueInterest)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">संस्था ब्याज आय</span>
          </div>
        </div>

        {/* 4. CHEQUE DISBURSAL & UPFRONT DEDUCTIONS BOX (As explicitly requested by user) */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Receipt className="w-3.5 h-3.5" />
                चेक वितरण समय निवल प्राप्त राशि (Net Cheque in Hand)
              </span>
              <h4 className="text-xl sm:text-2xl font-extrabold text-white">
                ऋणी को देय चेक: <span className="text-emerald-400 font-mono">{formatINR(netInHandCheque)}</span>
              </h4>
              <p className="text-xs text-slate-300">
                स्वीकृत ऋण ₹ {amount.toLocaleString('en-IN')} में से प्री-ईएमआई + ₹500 प्रोसेसिंग शुल्क + ₹300 भवन निधि की अग्रिम कटौती उपरांत।
              </p>
            </div>

            {/* Deduction Breakdown Grid */}
            <div className="w-full lg:w-auto bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-mono space-y-1.5 min-w-[300px]">
              <div className="flex justify-between text-slate-300">
                <span>स्वीकृत कुल ऋण राशि:</span>
                <span className="font-bold text-white">{formatINR(amount)}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>(-) प्री-ईएमआई (अग्रिम कटौती):</span>
                <span className="font-bold">- {formatINR(preEmi)}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>(-) प्रोसेसिंग शुल्क:</span>
                <span>- ₹ 500</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>(-) भवन निधि (Building Fund):</span>
                <span>- ₹ 300</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-extrabold border-t border-white/20 pt-1.5 text-sm">
                <span className="font-sans">निवल चेक राशि (हाथ में देय):</span>
                <span>{formatINR(netInHandCheque)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. FULL 24/36 MONTH SCHEDULE CHART (Exactly as requested by user) */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>घटते क्रम का पूर्ण {tenure} माह किस्त चार्ट (Full 24/36 Month Schedule):</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Image 3 के अनुसार प्रत्येक माह की देय तिथि, मूलधन, 14% घटता ब्याज, कुल किस्त एवं शेष मूलधन
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportScheduleCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>चार्ट CSV डाउनलोड</span>
              </button>
              <button
                onClick={handlePrintSchedule}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>प्रिंट चार्ट</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#b30000] text-white text-center font-bold sticky top-0 text-[11px] z-10">
                  <tr>
                    <th className="p-3 border border-red-800">ईएमआई क्र.</th>
                    <th className="p-3 border border-red-800">ईएमआई देय तिथि</th>
                    <th className="p-3 border border-red-800">देय मूलधन (₹)</th>
                    <th className="p-3 border border-red-800">देय ब्याज (14% घटता हुआ)</th>
                    <th className="p-3 border border-red-800">कुल देय राशि (₹)</th>
                    <th className="p-3 border border-red-800">शेष ऋण मूलधन (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {schedule.map((row) => (
                    <tr key={row.emiNo} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-900">{row.emiNo}</td>
                      <td className="p-2.5 text-center">{row.dueDate}</td>
                      <td className="p-2.5 text-right font-medium">₹ {Math.round(row.duePrincipal).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right text-amber-700 font-bold">
                        ₹ {Math.round(row.dueInterest).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        ₹ {Math.round(row.totalDue).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right text-slate-600">
                        ₹ {Math.round(row.remainingPrincipal).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* SUMMARY FOOTER ROW */}
                <tfoot className="bg-slate-900 text-white font-mono font-bold text-[11px] sticky bottom-0">
                  <tr>
                    <td colSpan={2} className="p-3 text-center font-sans">
                      कुल योग ({tenure} माह)
                    </td>
                    <td className="p-3 text-right">
                      ₹ {Math.round(totals.totalDuePrincipal).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right text-amber-300">
                      ₹ {Math.round(totals.totalDueInterest).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right text-emerald-400">
                      ₹ {Math.round(totals.totalDueAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right text-slate-400">
                      ₹ 0
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Action Button to Open Loan Form */}
        {onApplyLoan && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onApplyLoan(amount, tenure)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md shadow-amber-500/20"
            >
              <span>इस स्लैब ({formatINR(amount)}) में नया ऋण स्वीकृत करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
