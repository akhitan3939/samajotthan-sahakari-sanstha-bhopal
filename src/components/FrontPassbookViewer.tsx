import React from 'react';
import { LoanRecord, SocietyInfo, EmiInstallment } from '../types';
import { formatINR, calculateInstallmentTotals } from '../utils/loanCalculations';
import {
  X,
  CreditCard,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Building,
  ShieldCheck,
  Printer,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Award
} from 'lucide-react';
import { SocietyEmblem } from './SocietyEmblem';

interface FrontPassbookViewerProps {
  loan: LoanRecord;
  societyInfo: SocietyInfo;
  onClose: () => void;
  onViewLedger?: (loan: LoanRecord) => void;
  onPrintReceipt?: (loan: LoanRecord, emi: EmiInstallment) => void;
}

export const FrontPassbookViewer: React.FC<FrontPassbookViewerProps> = ({
  loan,
  societyInfo,
  onClose,
  onViewLedger,
  onPrintReceipt,
}) => {
  const totals = calculateInstallmentTotals(loan.installments);
  const remainingPrincipal = Math.max(0, loan.loanAmount - totals.totalPaidPrincipal);
  const nextUnpaid = loan.installments.find(
    (inst) => inst.status === 'PENDING' || inst.status === 'OVERDUE'
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-rose-300 shadow-xl shadow-rose-900/10 overflow-hidden animate-fadeIn">
      {/* 1. Official Header Bar */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white p-5 sm:p-6 border-b border-rose-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SocietyEmblem size="sm" showText={false} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-rose-300 font-mono font-bold">
                  खाता क्र.: {loan.accountNo}
                </span>
                <span className="text-xs text-pink-300 font-mono">
                  • सदस्यता #{loan.membershipNo}
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  🟢 ऑनलाइन पासबुक सक्रिय
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                {loan.borrowerName} की डिजिटल पासबुक
              </h2>
              <p className="text-xs text-rose-200/80">
                {societyInfo.name} • पंजीयन क्र. {societyInfo.regNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              title="पासबुक प्रिंट करें"
            >
              <Printer className="w-3.5 h-3.5 text-pink-300" />
              <span>प्रिंट करें</span>
            </button>

            {onViewLedger && (
              <button
                onClick={() => onViewLedger(loan)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>विस्तृत लेजर बही</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-bold transition-colors cursor-pointer border border-rose-700"
              title="पासबुक बंद करें"
            >
              <X className="w-4 h-4" />
              <span>बंद करें ✕</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* 2. Member Identification & Loan Profile Card */}
        <div className="bg-gradient-to-br from-rose-50/80 via-white to-pink-50/60 rounded-2xl p-5 border border-rose-200 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[11px] font-bold text-rose-900/70 block">ऋणी सदस्य का नाम:</span>
              <p className="text-base font-black text-slate-900 mt-0.5">{loan.borrowerName}</p>
              {loan.fatherOrHusbandName && (
                <p className="text-xs text-rose-950 font-medium">आत्मज/पति: {loan.fatherOrHusbandName}</p>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold text-rose-900/70 block">सदस्यता व खाता क्रमांक:</span>
              <p className="text-sm font-mono font-bold text-rose-950 mt-0.5">
                खाता: {loan.accountNo}
              </p>
              <p className="text-xs text-slate-600 font-mono">सदस्यता क्र.: #{loan.membershipNo}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-rose-900/70 block">सम्पर्क मोबाइल व पता:</span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{loan.phone || 'उपलब्ध नहीं'}</span>
              </p>
              <p className="text-xs text-slate-600 mt-0.5 truncate flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{loan.address || 'भोपाल (म.प्र.)'}</span>
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-rose-900/70 block">ऋण स्वीकृति तिथि व स्थिति:</span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{loan.sanctionDate}</span>
              </p>
              <span
                className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  loan.status === 'DEFAULTER'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : loan.status === 'CLOSED'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
              >
                {loan.status === 'DEFAULTER'
                  ? '⚠️ डिफ़ॉल्टर खाता'
                  : loan.status === 'CLOSED'
                  ? '✓ ऋण पूर्ण चुकता'
                  : '🟢 नियमित सक्रिय ऋण'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Financial Summary KPI Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="bg-white rounded-2xl p-4 border-2 border-rose-200 shadow-xs">
            <span className="text-[11px] font-bold text-rose-900/80 block">स्वीकृत ऋण राशि:</span>
            <p className="text-lg sm:text-xl font-black font-mono text-slate-950 mt-1">
              {formatINR(loan.loanAmount)}
            </p>
            <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
              {loan.tenureMonths} माह • 14% घटता ब्याज
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border-2 border-emerald-200 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-900/80 block">कुल जमा राशि:</span>
            <p className="text-lg sm:text-xl font-black font-mono text-emerald-700 mt-1">
              {formatINR(totals.totalPaidAmount)}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              मूलधन जमा: {formatINR(totals.totalPaidPrincipal)}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-900/80 block">वर्तमान शेष मूलधन:</span>
            <p className="text-lg sm:text-xl font-black font-mono text-amber-700 mt-1">
              {formatINR(remainingPrincipal)}
            </p>
            <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">
              14% घटती ब्याज दर अनुसार
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-700 block">मासिक किस्त (EMI):</span>
            <p className="text-lg sm:text-xl font-black font-mono text-slate-950 mt-1">
              {loan.installments[0] ? `₹ ${loan.installments[0].totalDue.toFixed(0)}` : '—'}
            </p>
            <span className="text-[10px] text-slate-600 font-semibold block mt-0.5">
              {nextUnpaid ? `अगली देय: ${nextUnpaid.dueDate}` : 'पूर्ण चुकता'}
            </span>
          </div>
        </div>

        {/* 4. Complete Installment & Transaction Schedule (The Passbook Table) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200 pb-2">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-rose-700" />
                <span>मासिक किस्त भुगतान व जमा लेजर बही ({loan.tenureMonths} माह)</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                14% घटती दर से प्रत्येक माह का मूलधन, ब्याज, कुल किस्त तथा पावती रसीद विवरण
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                जमा किस्त: {loan.installments.filter((i) => i.status === 'PAID' || i.status === 'DELAYED_PAID' || i.totalPaid > 0).length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px]">
                शेष किस्त: {loan.installments.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE').length}
              </span>
            </div>
          </div>

          <div className="border border-rose-200 rounded-2xl overflow-x-auto bg-white shadow-xs">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-rose-100/80 font-bold text-rose-950 border-b border-rose-200">
                <tr>
                  <th className="p-3 text-center">किस्त #</th>
                  <th className="p-3">देय तिथि</th>
                  <th className="p-3 text-right">देय मूलधन</th>
                  <th className="p-3 text-right">देय ब्याज (14%)</th>
                  <th className="p-3 text-right">कुल देय किस्त</th>
                  <th className="p-3 text-center">जमा दिनांक</th>
                  <th className="p-3 text-right">जमा राशि</th>
                  <th className="p-3 text-right">शेष मूलधन</th>
                  <th className="p-3 text-center">स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 font-mono text-[11px]">
                {loan.installments.map((inst) => {
                  const isPaid =
                    inst.status === 'PAID' ||
                    inst.status === 'DELAYED_PAID' ||
                    inst.totalPaid > 0;
                  return (
                    <tr
                      key={inst.emiNo}
                      className={`hover:bg-rose-50/50 transition-colors ${
                        isPaid ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="p-2.5 text-center font-bold text-slate-900">
                        #{inst.emiNo}
                      </td>
                      <td className="p-2.5 text-slate-700">{inst.dueDate}</td>
                      <td className="p-2.5 text-right text-slate-800">
                        ₹ {inst.duePrincipal.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right text-rose-900">
                        ₹ {inst.dueInterest.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-950">
                        ₹ {inst.totalDue.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-center text-slate-700">
                        {inst.depositDate || '—'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">
                        {inst.totalPaid > 0 ? `₹ ${inst.totalPaid.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-2.5 text-right text-slate-700">
                        ₹ {inst.balancePrincipal.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-center font-sans">
                        {inst.status === 'PAID' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            जमा ✓
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            आगामी
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Official Society Certification Seal & Disclaimer */}
        <div className="p-4 bg-gradient-to-r from-rose-50 via-[#ffeef2] to-rose-50 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-[11px] text-rose-950 font-medium">
              यह ऑनलाइन पासबुक <strong>{societyInfo.name}</strong> के आधिकारिक बहीखाता रिकॉर्ड अनुसार प्रमाणित है। किसी भी विसंगति हेतु मुख्य शाखा कार्यालय से संपर्क करें।
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
          >
            पासबुक बंद करें ✕
          </button>
        </div>
      </div>
    </div>
  );
};
