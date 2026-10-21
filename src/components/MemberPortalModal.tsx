import React, { useState, useEffect } from 'react';
import { useSociety } from '../context/SocietyContext';
import { LoanRecord, EmiInstallment } from '../types';
import { formatINR, calculateInstallmentTotals } from '../utils/loanCalculations';
import {
  X,
  Search,
  User,
  CreditCard,
  AlertCircle,
  FileText,
  Lock,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Building,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface MemberPortalModalProps {
  onClose: () => void;
  onViewLedger: (loan: LoanRecord) => void;
  onPrintReceipt: (loan: LoanRecord, emi: EmiInstallment) => void;
  initialAccountNo?: string;
}

export const MemberPortalModal: React.FC<MemberPortalModalProps> = ({
  onClose,
  onViewLedger,
  onPrintReceipt,
  initialAccountNo = '',
}) => {
  const { loans, societyInfo } = useSociety();

  // Filter ONLY loans authorized/enabled by admin for front passbook viewing
  const enabledLoans = loans.filter((l) => l.passbookEnabled === true);

  const [searchAccountNo, setSearchAccountNo] = useState(initialAccountNo);
  const [selectedLoanId, setSelectedLoanId] = useState<string>(() => {
    if (initialAccountNo) {
      const match = enabledLoans.find(
        (l) => l.accountNo.toLowerCase() === initialAccountNo.trim().toLowerCase()
      );
      if (match) return match.id;
    }
    return enabledLoans[0]?.id || '';
  });

  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(() => {
    if (initialAccountNo) {
      const match = enabledLoans.find(
        (l) => l.accountNo.toLowerCase() === initialAccountNo.trim().toLowerCase()
      );
      if (match) return match;
    }
    return enabledLoans[0] || null;
  });

  const [errorMessage, setErrorMessage] = useState<{
    type: 'NOT_FOUND' | 'DISABLED';
    message: string;
    details?: string;
  } | null>(null);

  // Sync when selectedLoanId changes from dropdown
  const handleDropdownSelect = (loanId: string) => {
    setSelectedLoanId(loanId);
    setErrorMessage(null);
    if (!loanId) {
      setSelectedLoan(null);
      return;
    }
    const found = enabledLoans.find((l) => l.id === loanId);
    if (found) {
      setSelectedLoan(found);
      setSearchAccountNo(found.accountNo);
    }
  };

  // Search by Khata Kramank (Account Number) or Membership No
  const handleAccountSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchAccountNo.trim().toLowerCase();
    if (!query) {
      setErrorMessage({
        type: 'NOT_FOUND',
        message: 'कृपया खाता क्रमांक दर्ज करें।',
      });
      return;
    }

    // 1. Check if loan exists anywhere in database
    const anyMatchingLoan = loans.find(
      (l) =>
        l.accountNo.toLowerCase() === query ||
        l.accountNo.toLowerCase().replace(/[^a-z0-9]/g, '').includes(query.replace(/[^a-z0-9]/g, '')) ||
        l.membershipNo.toLowerCase() === query
    );

    if (!anyMatchingLoan) {
      setSelectedLoan(null);
      setSelectedLoanId('');
      setErrorMessage({
        type: 'NOT_FOUND',
        message: `खाता क्रमांक '${searchAccountNo}' संस्था के रिकॉर्ड में नहीं मिला।`,
        details: 'कृपया सही खाता क्रमांक (उदा. SB-2023-0213) दर्ज करें अथवा ऊपर दिए गए ड्रॉपडाउन से सदस्य का नाम चुनें।',
      });
      return;
    }

    // 2. Check if admin has enabled passbook for this member
    if (!anyMatchingLoan.passbookEnabled) {
      setSelectedLoan(null);
      setSelectedLoanId('');
      setErrorMessage({
        type: 'DISABLED',
        message: `खाता क्रमांक ${anyMatchingLoan.accountNo} (${anyMatchingLoan.borrowerName}) की ऑनलाइन पासबुक वर्तमान में अधिकृत नहीं है।`,
        details: 'संस्था प्रशासन द्वारा इस खाते की सार्वजनिक ऑनलाइन पासबुक अभी सक्षम नहीं की गई है। कृपया संस्था कार्यालय से संपर्क करें या व्यवस्थापक से पासबुक सक्रिय कराएं।',
      });
      return;
    }

    // 3. Success: Passbook is enabled
    setSelectedLoan(anyMatchingLoan);
    setSelectedLoanId(anyMatchingLoan.id);
    setSearchAccountNo(anyMatchingLoan.accountNo);
    setErrorMessage(null);
  };

  const totals = selectedLoan ? calculateInstallmentTotals(selectedLoan.installments) : null;
  const nextUnpaid = selectedLoan?.installments.find(
    (i) => i.status === 'PENDING' || i.status === 'OVERDUE'
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#fff8f9] via-white to-[#fff8f9] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col border border-rose-200 overflow-hidden text-slate-900">
        {/* Light Pinkish Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white shrink-0 border-b border-rose-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600/30 border border-rose-500/40 rounded-xl text-pink-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  सदस्य ऑनलाइन पासबुक एवं लेजर विवरण
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  प्रशासन अधिकृत
                </span>
              </div>
              <p className="text-xs text-rose-200/80">
                {societyInfo.name} • पंजीयन: {societyInfo.regNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-rose-300 hover:text-white hover:bg-rose-900/60 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Member Selection & Search Box (Light Pinkish Combination) */}
          <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/60 to-rose-100/70 p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Feature 1: Name Dropdown */}
              <div className="flex-1">
                <label className="block text-xs font-extrabold text-rose-950 mb-1.5">
                  1. अधिकृत सदस्य नाम चुनें (ड्रॉपडाउन):
                </label>
                <div className="relative">
                  <select
                    value={selectedLoanId}
                    onChange={(e) => handleDropdownSelect(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-rose-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer shadow-xs"
                  >
                    <option value="">-- ड्रॉपडाउन से सदस्य चुनें ({enabledLoans.length} अधिकृत खाते) --</option>
                    {enabledLoans.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.borrowerName} • खाता क्र.: {l.accountNo} (सदस्यता #{l.membershipNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Separator */}
              <div className="hidden md:flex items-center text-xs font-bold text-rose-400 px-1 pt-5">
                अथवा
              </div>

              {/* Feature 2: Khata Kramank Search */}
              <div className="flex-1">
                <label className="block text-xs font-extrabold text-rose-950 mb-1.5">
                  2. खाता क्रमांक से खोजें:
                </label>
                <form onSubmit={handleAccountSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-rose-400" />
                    <input
                      type="text"
                      placeholder="खाता क्रमांक (उदा. SB-2023-0213)..."
                      value={searchAccountNo}
                      onChange={(e) => setSearchAccountNo(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-rose-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-800 to-pink-700 hover:from-rose-900 hover:to-pink-800 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm shadow-rose-900/10"
                  >
                    खोजें
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Helper Links */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-rose-900 font-medium">
              <span className="font-bold">त्वरित उपलब्ध अधिकृत खाते:</span>
              {enabledLoans.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleDropdownSelect(l.id)}
                  className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-colors cursor-pointer ${
                    selectedLoan?.id === l.id
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-white text-rose-900 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {l.borrowerName} ({l.accountNo})
                </button>
              ))}
            </div>
          </div>

          {/* Error / Unauthorized State */}
          {errorMessage && (
            <div
              className={`p-4 rounded-2xl border ${
                errorMessage.type === 'DISABLED'
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : 'bg-rose-50/90 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-3">
                {errorMessage.type === 'DISABLED' ? (
                  <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold">{errorMessage.message}</h4>
                  {errorMessage.details && (
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {errorMessage.details}
                    </p>
                  )}
                  {errorMessage.type === 'DISABLED' && (
                    <div className="pt-2 text-[11px] font-semibold text-amber-900">
                      💡 यदि आप व्यवस्थापक हैं, तो <strong>प्रशासक डैशबोर्ड</strong> में जाकर इस खाते के सामने 'वेबसाइट पासबुक सक्षम' बटन पर क्लिक करके इसे चालू कर सकते हैं।
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PASSBOOK VIEW (Only when loan is selected & enabled) */}
          {selectedLoan && totals && (
            <div className="space-y-6">
              {/* Profile Card (Royal Rose / Slate Gradient) */}
              <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 text-white rounded-3xl p-5 sm:p-6 shadow-lg shadow-rose-950/20 border border-rose-800/60">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-300 font-mono font-bold">
                        खाता क्र.: {selectedLoan.accountNo}
                      </span>
                      <span className="text-xs text-pink-300 font-mono">
                        • सदस्यता #{selectedLoan.membershipNo}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ऑनलाइन पासबुक सक्रिय
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {selectedLoan.borrowerName}
                    </h3>
                    <p className="text-xs text-rose-200/80 mt-0.5">
                      {selectedLoan.fatherOrHusbandName && `आत्मज/पत्नी: ${selectedLoan.fatherOrHusbandName} • `}
                      {selectedLoan.address} • मो.: {selectedLoan.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        selectedLoan.status === 'DEFAULTER'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : selectedLoan.status === 'CLOSED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-pink-500/20 text-pink-200 border-pink-500/40'
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                      title="विस्तृत लेजर बही (Image 1, 2, 3 अनुसार)"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>विस्तृत लेजर बही</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                    <span className="text-rose-200/80 block text-[11px] font-semibold">स्वीकृत ऋण राशि:</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-white">
                      {formatINR(selectedLoan.loanAmount)}
                    </span>
                    <span className="text-[10px] text-pink-300 block mt-0.5">
                      {selectedLoan.tenureMonths} माह • 14% घटता ब्याज
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                    <span className="text-rose-200/80 block text-[11px] font-semibold">कुल जमा मूलधन:</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                      {formatINR(totals.totalPaidPrincipal)}
                    </span>
                    <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                      कुल जमा: {formatINR(totals.totalPaidAmount)}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                    <span className="text-rose-200/80 block text-[11px] font-semibold">वर्तमान शेष मूलधन:</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-amber-300">
                      {formatINR(Math.max(0, selectedLoan.loanAmount - totals.totalPaidPrincipal))}
                    </span>
                    <span className="text-[10px] text-amber-200/70 block mt-0.5">
                      घटती ब्याज दर अनुसार
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                    <span className="text-rose-200/80 block text-[11px] font-semibold">अगली किस्त देय तिथि:</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-white">
                      {nextUnpaid ? nextUnpaid.dueDate : 'पूर्ण चुकता'}
                    </span>
                    <span className="text-[10px] text-pink-300 block mt-0.5">
                      {nextUnpaid ? `किस्त राशि: ₹ ${nextUnpaid.totalDue.toFixed(2)}` : 'कोई देयता शेष नहीं'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Installments History (Light Pinkish Table) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-rose-950 uppercase tracking-wide">
                    मासिक किस्त जमा इतिहास एवं पावती रसीदें:
                  </h4>
                  <span className="text-[11px] text-rose-800 font-semibold">
                    अवधि: {selectedLoan.tenureMonths} माह
                  </span>
                </div>

                <div className="border border-rose-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-rose-100/70 font-bold text-rose-950 border-b border-rose-200">
                      <tr>
                        <th className="p-3 text-center">किस्त</th>
                        <th className="p-3">देय तिथि</th>
                        <th className="p-3 text-right">देय मूलधन</th>
                        <th className="p-3 text-right">देय ब्याज (14%)</th>
                        <th className="p-3 text-right">कुल देय किस्त</th>
                        <th className="p-3 text-center">जमा दिनांक</th>
                        <th className="p-3 text-right">जमा राशि</th>
                        <th className="p-3 text-center">स्थिति</th>
                        <th className="p-3 text-center">रसीद</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100 font-mono text-[11px]">
                      {selectedLoan.installments.map((inst) => {
                        const isPaid =
                          inst.status === 'PAID' ||
                          inst.status === 'DELAYED_PAID' ||
                          inst.totalPaid > 0;
                        return (
                          <tr key={inst.emiNo} className="hover:bg-rose-50/50 transition-colors">
                            <td className="p-2.5 text-center font-bold text-slate-900">#{inst.emiNo}</td>
                            <td className="p-2.5 text-slate-700">{inst.dueDate}</td>
                            <td className="p-2.5 text-right text-slate-800">₹ {inst.duePrincipal.toFixed(2)}</td>
                            <td className="p-2.5 text-right text-rose-900">₹ {inst.dueInterest.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-bold text-slate-950">₹ {inst.totalDue.toFixed(2)}</td>
                            <td className="p-2.5 text-center text-slate-700">{inst.depositDate || '—'}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-700">
                              {inst.totalPaid > 0 ? `₹ ${inst.totalPaid.toFixed(2)}` : '—'}
                            </td>
                            <td className="p-2.5 text-center font-sans">
                              {inst.status === 'PAID' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  जमा
                                </span>
                              ) : inst.status === 'DELAYED_PAID' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  विलंबित जमा
                                </span>
                              ) : inst.delayDays > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  बकाया ({inst.delayDays} दिन)
                                </span>
                              ) : (
                                <span className="text-slate-400">प्रतीक्षारत</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-sans">
                              {isPaid ? (
                                <button
                                  onClick={() => onPrintReceipt(selectedLoan, inst)}
                                  className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                                  title="पावती रसीद देखें व प्रिंट करें"
                                >
                                  रसीद
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
