import React, { useState } from 'react';
import { useSociety } from '../context/SocietyContext';
import { LoanRecord, EmiInstallment } from '../types';
import { formatINR, calculateInstallmentTotals } from '../utils/loanCalculations';
import {
  X,
  Search,
  User,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface MemberPortalModalProps {
  onClose: () => void;
  onViewLedger: (loan: LoanRecord) => void;
  onPrintReceipt: (loan: LoanRecord, emi: EmiInstallment) => void;
}

export const MemberPortalModal: React.FC<MemberPortalModalProps> = ({
  onClose,
  onViewLedger,
  onPrintReceipt,
}) => {
  const { loans } = useSociety();
  const [searchQuery, setSearchQuery] = useState('213'); // default with Kanta Dongre's membership no for immediate preview
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(() => {
    return loans.find((l) => l.membershipNo === '213') || loans[0] || null;
  });
  const [hasSearched, setHasSearched] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = loans.find(
      (l) =>
        l.membershipNo.toLowerCase() === query ||
        l.accountNo.toLowerCase() === query ||
        l.phone.includes(query) ||
        l.borrowerName.toLowerCase().includes(query)
    );

    setSelectedLoan(found || null);
    setHasSearched(true);
  };

  const totals = selectedLoan ? calculateInstallmentTotals(selectedLoan.installments) : null;
  const nextUnpaid = selectedLoan?.installments.find(
    (i) => i.status === 'PENDING' || i.status === 'OVERDUE'
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                सदस्य ऑनलाइन पोर्टल एवं डैशबोर्ड
              </h2>
              <p className="text-xs text-slate-400">
                समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Member Search Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="सदस्यता क्र. (उदा. 213), खाता क्र. या मोबाइल दर्ज करें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shrink-0"
              >
                खाता खोजें
              </button>
            </form>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span>त्वरित परीक्षण:</span>
              <button
                onClick={() => {
                  setSearchQuery('213');
                  const l = loans.find((x) => x.membershipNo === '213');
                  if (l) setSelectedLoan(l);
                }}
                className="text-blue-600 hover:underline font-mono"
              >
                सदस्यता #213 (कांता डोंगरे)
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setSearchQuery('214');
                  const l = loans.find((x) => x.membershipNo === '214');
                  if (l) setSelectedLoan(l);
                }}
                className="text-blue-600 hover:underline font-mono"
              >
                सदस्यता #214 (मोहनलाल)
              </button>
            </div>
          </div>

          {/* Search Result */}
          {hasSearched && !selectedLoan && (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">कोई खाता नहीं मिला</h3>
              <p className="text-xs text-slate-500 mt-1">
                कृपया सही सदस्यता क्रमांक (जैसे: 213) अथवा पंजीकृत मोबाइल नंबर दर्ज करें।
              </p>
            </div>
          )}

          {selectedLoan && totals && (
            <div className="space-y-6">
              {/* Member Profile Overview Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-xs text-amber-300 font-mono">
                      सदस्यता क्रमांक: #{selectedLoan.membershipNo} • खाता: {selectedLoan.accountNo}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {selectedLoan.borrowerName}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {selectedLoan.address} • मो.: {selectedLoan.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        selectedLoan.status === 'DEFAULTER'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : selectedLoan.status === 'CLOSED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {selectedLoan.status === 'DEFAULTER'
                        ? 'डिफॉल्टर खाता'
                        : selectedLoan.status === 'CLOSED'
                        ? 'ऋण पूर्ण चुकता'
                        : 'सक्रिय ऋण खाता'}
                    </span>

                    <button
                      onClick={() => onViewLedger(selectedLoan)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>विस्तृत लेजर देखें</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">स्वीकृत ऋण राशि:</span>
                    <span className="text-base font-bold font-mono text-white">
                      {formatINR(selectedLoan.loanAmount)}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">जमा किया गया मूलधन:</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {formatINR(totals.totalPaidPrincipal)}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">शेष ऋण मूलधन:</span>
                    <span className="text-base font-bold font-mono text-amber-300">
                      {formatINR(Math.max(0, selectedLoan.loanAmount - totals.totalPaidPrincipal))}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <span className="text-slate-400 block text-[11px]">अगली किस्त देय तिथि:</span>
                    <span className="text-base font-bold font-mono text-white">
                      {nextUnpaid ? nextUnpaid.dueDate : 'पूर्ण चुकता'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantors & Advance Cheques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-2 uppercase tracking-wide">
                    साख जमानतदार 1:
                  </span>
                  <div className="space-y-1 text-slate-600">
                    <p>नाम: <strong className="text-slate-900">{selectedLoan.guarantor1?.name}</strong></p>
                    <p>मोबाइल: <span className="font-mono">{selectedLoan.guarantor1?.phone}</span></p>
                    <p>चेक क्रमांक: <span className="font-mono text-slate-800">{selectedLoan.guarantor1?.chequeNo || '—'}</span></p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-2 uppercase tracking-wide">
                    साख जमानतदार 2:
                  </span>
                  <div className="space-y-1 text-slate-600">
                    <p>नाम: <strong className="text-slate-900">{selectedLoan.guarantor2?.name}</strong></p>
                    <p>मोबाइल: <span className="font-mono">{selectedLoan.guarantor2?.phone}</span></p>
                    <p>चेक क्रमांक: <span className="font-mono text-slate-800">{selectedLoan.guarantor2?.chequeNo || '—'}</span></p>
                  </div>
                </div>
              </div>

              {/* Installments History Quick Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  हालिया किश्त जमा इतिहास एवं रसीदें:
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5 text-center">किस्त</th>
                        <th className="p-2.5">देय तिथि</th>
                        <th className="p-2.5 text-right">कुल देय</th>
                        <th className="p-2.5 text-center">जमा दिनांक</th>
                        <th className="p-2.5 text-right">जमा राशि</th>
                        <th className="p-2.5 text-center">स्थिति</th>
                        <th className="p-2.5 text-center">पावती</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {selectedLoan.installments.map((inst) => {
                        const isPaid = inst.status === 'PAID' || inst.status === 'DELAYED_PAID' || inst.totalPaid > 0;
                        return (
                          <tr key={inst.emiNo} className="hover:bg-slate-50">
                            <td className="p-2 text-center font-bold">#{inst.emiNo}</td>
                            <td className="p-2">{inst.dueDate}</td>
                            <td className="p-2 text-right">₹ {inst.totalDue.toFixed(2)}</td>
                            <td className="p-2 text-center">{inst.depositDate || '—'}</td>
                            <td className="p-2 text-right font-bold text-emerald-700">
                              {inst.totalPaid > 0 ? `₹ ${inst.totalPaid.toFixed(2)}` : '—'}
                            </td>
                            <td className="p-2 text-center font-sans">
                              {inst.status === 'PAID' ? (
                                <span className="text-emerald-700 font-semibold">जमा</span>
                              ) : inst.status === 'DELAYED_PAID' ? (
                                <span className="text-amber-700 font-semibold">विलंबित जमा</span>
                              ) : inst.delayDays > 0 ? (
                                <span className="text-rose-700 font-bold">बकाया</span>
                              ) : (
                                <span className="text-slate-500">प्रतीक्षारत</span>
                              )}
                            </td>
                            <td className="p-2 text-center font-sans">
                              {isPaid ? (
                                <button
                                  onClick={() => onPrintReceipt(selectedLoan, inst)}
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                                >
                                  रसीद देखें
                                </button>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
