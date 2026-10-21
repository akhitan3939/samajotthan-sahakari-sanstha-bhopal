import React from 'react';
import { INITIAL_LOAN_SLABS } from '../data/initialData';
import { formatINR, generateSchedule } from '../utils/loanCalculations';
import { LoanSlab } from '../types';
import { Calculator, ArrowRight, CheckCircle2, Shield, Calendar, Percent } from 'lucide-react';

interface LoanSlabsProps {
  onSelectSlab: (slab: LoanSlab) => void;
  onOpenApply: (slab?: LoanSlab) => void;
}

export const LoanSlabs: React.FC<LoanSlabsProps> = ({ onSelectSlab, onOpenApply }) => {
  return (
    <section id="loan-slabs" className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-3">
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span>अधिकृत साख योजनाएं</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          संस्था के निर्धारित ऋण स्लैब एवं कटौती नियम
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          सभी ऋण 14% वार्षिक घटते क्रम (Reducing Balance) में स्वीकृत होते हैं। चेक देते समय प्री-ईएमआई + ₹500 प्रोसेसिंग शुल्क + ₹300 भवन निधि अग्रिम काटी जाती है।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_LOAN_SLABS.map((slab) => {
          const sampleSchedule = generateSchedule(slab.amount, slab.interestRate, slab.tenureMonths);
          const firstEmi = sampleSchedule[0];
          const lastEmi = sampleSchedule[sampleSchedule.length - 1];
          const totalPreDeductions = slab.estimatedPreEmi + slab.processingFee + slab.buildingFund;
          const netDisbursed = slab.amount - totalPreDeductions;

          return (
            <div
              key={slab.amount}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-amber-700 font-mono">
                      स्लैब योजना
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {formatINR(slab.amount)}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      slab.tenureMonths === 36
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {slab.tenureMonths} माह अवधि
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4">{slab.description}</p>

                {/* Key Financial Parameters */}
                <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 mb-4 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-600" />
                      ब्याज दर:
                    </span>
                    <span className="font-bold text-slate-900 font-mono">14% p.a. (घटते क्रम)</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      किस्त रेंज (Reducing):
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatINR(firstEmi.totalDue)} से {formatINR(lastEmi.totalDue)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/60 pt-2">
                    <span>मासिक मूलधन (Fixed):</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {formatINR(firstEmi.duePrincipal)}
                    </span>
                  </div>
                </div>

                {/* Pre-Disbursement Deductions Table */}
                <div className="border border-amber-200/70 rounded-xl p-3 bg-amber-50/40 mb-4">
                  <span className="text-[11px] font-bold text-amber-900 block mb-1.5 uppercase tracking-wide">
                    चेक वितरण पर अग्रिम कटौतियां:
                  </span>
                  <div className="space-y-1 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>• प्री-ईएमआई (अग्रिम कटौती):</span>
                      <span className="font-mono font-bold">{formatINR(slab.estimatedPreEmi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• प्रोसेसिंग शुल्क:</span>
                      <span className="font-mono">₹ 500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• भवन निधि (Building Fund):</span>
                      <span className="font-mono">₹ 300</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-amber-300 pt-1 text-slate-900">
                      <span>निवल प्राप्त चेक राशि:</span>
                      <span className="font-mono text-emerald-700">{formatINR(netDisbursed)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onSelectSlab(slab)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>ईएमआई अनुसूची</span>
                </button>

                <button
                  onClick={() => onOpenApply(slab)}
                  className="inline-flex items-center justify-center py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  title="ऋण प्रविष्टि करें"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
