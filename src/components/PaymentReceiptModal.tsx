import React from 'react';
import { EmiInstallment, LoanRecord } from '../types';
import { formatINR } from '../utils/loanCalculations';
import { useSociety } from '../context/SocietyContext';
import { SocietyEmblem } from './SocietyEmblem';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface PaymentReceiptModalProps {
  loan: LoanRecord;
  installment: EmiInstallment;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  loan,
  installment,
  onClose,
}) => {
  const { societyInfo, boardMembers } = useSociety();
  const receiptNo = `REC-${new Date().getFullYear()}-${installment.emiNo}-${loan.membershipNo}`;

  // Dynamically resolve designated manager from live boardMembers
  const manager =
    boardMembers.find(
      (b) =>
        b.role === 'PRABANDHAK' ||
        b.designationHindi?.includes('प्रबंधक')
    ) || {
      name: 'श्रीमति तन्‍मयी कोरसने',
      designationHindi: 'प्रबंधक',
    };

  const handlePrint = () => {
    document.body.classList.add('is-printing-modal');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('is-printing-modal');
    }, 1000);
  };

  return (
    <div className="printable-modal fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="printable-modal-card bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white shrink-0 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">ईएमआई जमा पावती (Official Receipt)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट रसीद</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 overflow-y-auto text-slate-900" id="printable-receipt">
          {/* Organization Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <SocietyEmblem size="sm" showText={false} />
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  {societyInfo.name}
                </h1>
                <p className="text-[11px] font-semibold text-slate-600">
                  पंजीयन क्रमांक: {societyInfo.regNo}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              पता: {societyInfo.address} • फोन: {societyInfo.phone}
            </p>
            <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-300">
              मासिक ऋण किश्त जमा पावती (EMI Receipt)
            </div>
          </div>

          {/* Receipt & Member Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4 font-mono">
            <div className="space-y-1">
              <div>
                <span className="text-slate-500">रसीद क्रमांक: </span>
                <strong className="text-slate-900">{receiptNo}</strong>
              </div>
              <div>
                <span className="text-slate-500">खाता क्रमांक: </span>
                <strong className="text-slate-900">{loan.accountNo}</strong>
              </div>
              <div>
                <span className="text-slate-500">सदस्यता क्रमांक: </span>
                <strong className="text-slate-900">{loan.membershipNo}</strong>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="text-slate-500">जमा दिनांक: </span>
                <strong className="text-slate-900">{installment.depositDate || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500">किस्त संख्या: </span>
                <strong className="text-slate-900">
                  #{installment.emiNo} / {loan.tenureMonths}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">माध्यम: </span>
                <strong className="text-slate-900">{installment.paymentMode}</strong>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-4">
            <span className="text-slate-600">ऋणी का नाम: </span>
            <strong className="text-slate-900 text-sm font-sans">{loan.borrowerName}</strong>
            {loan.fatherOrHusbandName && (
              <span className="text-slate-600 font-sans"> (आत्मज/पत्नी: {loan.fatherOrHusbandName})</span>
            )}
          </div>

          {/* Amount Breakdown Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-5 text-xs font-mono">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                <tr>
                  <th className="p-2.5">मद (Description)</th>
                  <th className="p-2.5 text-right">देय राशि (Due)</th>
                  <th className="p-2.5 text-right">प्राप्त राशि (Paid)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-sans">मूलधन (Principal Installment)</td>
                  <td className="p-2.5 text-right">₹ {Math.round(installment.duePrincipal).toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right font-bold">₹ {Math.round(installment.paidPrincipal).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans">ब्याज (Monthly Reducing Interest @ 14%)</td>
                  <td className="p-2.5 text-right">₹ {Math.round(installment.dueInterest).toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right font-bold text-amber-800">
                    ₹ {Math.round(installment.paidInterest).toLocaleString('en-IN')}
                  </td>
                </tr>
                {installment.penaltyCollected > 0 && (
                  <tr className="bg-rose-50/50">
                    <td className="p-2.5 font-sans text-rose-800">
                      विलंब शुल्क / पेनल्टी ({installment.delayDays} दिन @ ₹2.6/दिन)
                    </td>
                    <td className="p-2.5 text-right text-rose-700">
                      ₹ {Math.round(installment.penaltyCalculated).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-bold text-rose-800">
                      ₹ {Math.round(installment.penaltyCollected).toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
                {installment.penaltyWaived !== undefined && installment.penaltyWaived > 0 && (
                  <tr className="bg-emerald-50/50">
                    <td className="p-2.5 font-sans text-emerald-800">
                      संस्था द्वारा पेनल्टी छूट (Penalty Waived)
                    </td>
                    <td className="p-2.5 text-right text-slate-500">
                      ₹ {Math.round(installment.penaltyWaived).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">
                      ₹ 0 (छूट प्रदत्त)
                    </td>
                  </tr>
                )}
                {installment.pendingInterest !== undefined && installment.pendingInterest > 0 && (
                  <tr className="bg-amber-50/60">
                    <td className="p-2.5 font-sans text-amber-900 font-semibold">
                      शेष बकाया ब्याज (Pending Interest - बाद में देय)
                    </td>
                    <td className="p-2.5 text-right text-amber-800">
                      ₹ {Math.round(installment.pendingInterest).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-bold text-amber-900">
                      आगामी देय
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-900 text-white font-bold text-sm">
                  <td className="p-3 font-sans">कुल प्राप्त राशि (Total Received)</td>
                  <td className="p-3 text-right">₹ {Math.round(installment.totalDue).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right text-emerald-400">
                    {formatINR(installment.totalPaid)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remaining Balance Note */}
          <div className="flex justify-between items-center text-xs p-3 bg-amber-50/60 rounded-lg border border-amber-200 mb-8 font-mono">
            <span className="text-slate-700">इस किस्त के पश्चात शेष ऋण मूलधन:</span>
            <span className="font-bold text-amber-900 text-sm">
              {formatINR(installment.remainingPrincipal)}
            </span>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs pt-8 border-t border-slate-300">
            <div>
              <div className="h-10"></div>
              <span className="font-semibold text-slate-800 border-t border-slate-400 pt-1 block">
                प्राप्तकर्ता लिपिक / रोकड़िया के हस्ताक्षर
              </span>
            </div>
            <div>
              <div className="h-10"></div>
              <span className="font-semibold text-slate-800 border-t border-slate-400 pt-1 block">
                अधिकृत {manager.designationHindi || 'प्रबंधक'} ({manager.name}), {societyInfo.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
