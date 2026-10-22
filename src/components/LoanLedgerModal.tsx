import React, { useState } from 'react';
import { EmiInstallment, LoanRecord } from '../types';
import { calculateInstallmentTotals, formatINR } from '../utils/loanCalculations';
import { useSociety } from '../context/SocietyContext';
import { MemberLoanProgressGraph } from './MemberLoanProgressGraph';
import { SocietyEmblem } from './SocietyEmblem';
import {
  X,
  Printer,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck,
  User,
  Phone,
  CreditCard,
  Lock,
  Unlock,
  PlusCircle,
  Save,
  RotateCcw
} from 'lucide-react';

interface LoanLedgerModalProps {
  loan: LoanRecord;
  onClose: () => void;
  onOpenPaymentEntry?: (loan: LoanRecord, emiNo: number) => void;
  onPrintReceipt?: (loan: LoanRecord, emi: EmiInstallment) => void;
}

export const LoanLedgerModal: React.FC<LoanLedgerModalProps> = ({
  loan,
  onClose,
  onOpenPaymentEntry,
  onPrintReceipt,
}) => {
  const {
    manualOverrideInstallment,
    toggleLockLoan,
    toggleInstallmentLock,
    setLoanDefaulterStatus,
    societyInfo,
    boardMembers,
  } = useSociety();
  const [editingEmiNo, setEditingEmiNo] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<EmiInstallment>>({});
  const [overrideReason, setOverrideReason] = useState('');

  // Dynamically resolve designated manager from live boardMembers
  const manager =
    boardMembers?.find(
      (b) =>
        b.role === 'PRABANDHAK' ||
        b.designationHindi?.includes('प्रबंधक')
    ) || {
      name: 'श्रीमति तन्‍मयी कोरसने',
      designationHindi: 'प्रबंधक',
    };

  const totals = calculateInstallmentTotals(loan.installments);

  const startEdit = (inst: EmiInstallment) => {
    if (inst.isLocked) {
      alert(`⚠️ किश्त #${inst.emiNo} लॉक्ड (सुरक्षित) है! संशोधन करने हेतु पहले 🔓 अनलॉक बटन दबाएं।`);
      return;
    }
    setEditingEmiNo(inst.emiNo);
    setEditFormData({
      dueDate: inst.dueDate,
      duePrincipal: inst.duePrincipal,
      dueInterest: inst.dueInterest,
      totalDue: inst.totalDue,
      depositDate: inst.depositDate || '',
      delayDays: inst.delayDays,
      paymentMode: inst.paymentMode || 'नकद (Cash)',
      totalPaid: inst.totalPaid,
      paidPrincipal: inst.paidPrincipal,
      paidInterest: inst.paidInterest,
      penaltyCalculated: inst.penaltyCalculated,
      penaltyCollected: inst.penaltyCollected,
      remainingPrincipal: inst.remainingPrincipal,
      status: inst.status,
    });
    setOverrideReason(inst.overrideReason || 'प्रशासक द्वारा मैन्युअल समायोजन');
  };

  const handleSaveOverride = (emiNo: number) => {
    manualOverrideInstallment(loan.id, emiNo, editFormData, overrideReason);
    setEditingEmiNo(null);
  };

  const handlePrint = () => {
    document.body.classList.add('is-printing-modal');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('is-printing-modal');
    }, 1000);
  };

  return (
    <div className="printable-modal fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="printable-modal-card bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0 no-print">
          <div className="flex items-center gap-3">
            <SocietyEmblem size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  ऋण खाता लेजर - {loan.borrowerName}
                </h2>
                {loan.isDummy && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    [डमी प्रविष्टि]
                  </span>
                )}
                {loan.isLocked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    <Lock className="w-3 h-3" />
                    लाइव डेटा लॉक्ड
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                खाता क्र.: <span className="text-amber-300 font-mono">{loan.accountNo}</span> • सदस्यता क्र.: <span className="text-amber-300 font-mono">{loan.membershipNo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLockLoan(loan.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
              title={loan.isLocked ? 'डेटा अनलॉक करें' : 'डेटा सुरक्षित लॉक करें'}
            >
              {loan.isLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span>अनलॉक करें</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>लॉक करें</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट लेजर</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Print Letterhead (Only visible during print) */}
          <div className="hidden print-only text-center border-b pb-4 mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <SocietyEmblem size="sm" showText={false} />
              <div>
                <h1 className="text-xl font-bold">{societyInfo.name}</h1>
                <p className="text-xs">पंजीयन क्र. {societyInfo.regNo} • पता: {societyInfo.address}</p>
              </div>
            </div>
            <h2 className="text-base font-semibold mt-1">व्यक्तिगत ऋण खाता बही (Loan Ledger Sheet)</h2>
          </div>

          {/* BORROWER & GUARANTOR DETAILS HEADER TABLE (EXACT REPLICA OF IMAGE 2) */}
          <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                ऋणी एवं जमानतदार विवरण (Borrower & Guarantor Card)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  स्थिति:{' '}
                  {loan.status === 'DEFAULTER' ? (
                    <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                      डिफ़ॉल्टर (Defaulter) {loan.isDefaulterByAdmin ? '• एडमिन निर्णय' : ''}
                    </span>
                  ) : loan.status === 'CLOSED' ? (
                    <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      पूर्ण चुकता (Closed)
                    </span>
                  ) : (
                    <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded border border-blue-300">
                      सक्रिय (Active)
                    </span>
                  )}
                </span>

                {loan.status !== 'CLOSED' && (
                  <button
                    onClick={() => {
                      const willBeDefaulter = loan.status !== 'DEFAULTER';
                      setLoanDefaulterStatus(
                        loan.id,
                        willBeDefaulter,
                        willBeDefaulter ? 'एडमिन द्वारा लेजर से डिफ़ॉल्टर घोषित' : 'एडमिन द्वारा डिफ़ॉल्टर सूची से बाहर'
                      );
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      loan.status === 'DEFAULTER'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                    }`}
                    title="एडमिन द्वारा डिफ़ॉल्टर स्थिति बदलने का अधिकार"
                  >
                    {loan.status === 'DEFAULTER' ? '✓ डिफ़ॉल्टर से हटाएं (Admin)' : '⚠ डिफ़ॉल्टर घोषित करें (Admin)'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-300 text-xs sm:text-sm">
              {/* Column 1 */}
              <div className="divide-y divide-slate-200">
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">ऋणी का नाम:</span>
                  <span className="flex-1 p-2.5 font-bold text-slate-900">{loan.borrowerName}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">ऋण की तिथि:</span>
                  <span className="flex-1 p-2.5 font-mono text-slate-900">{loan.loanDate}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">अग्रिम चेक क्र.:</span>
                  <span className="flex-1 p-2.5 font-mono text-slate-900">{loan.advanceChequeNo || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">मोबाइल / पता:</span>
                  <span className="flex-1 p-2.5 text-slate-700">{loan.phone} | {loan.address}</span>
                </div>
              </div>

              {/* Column 2 */}
              <div className="divide-y divide-slate-200">
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">सदस्यता क्र.:</span>
                  <span className="flex-1 p-2.5 font-mono font-bold text-slate-900">{loan.membershipNo}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">ऋण की राशि:</span>
                  <span className="flex-1 p-2.5 font-mono font-bold text-emerald-700 text-base">
                    {formatINR(loan.loanAmount)}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">जमानतदार 1:</span>
                  <span className="flex-1 p-2.5 text-slate-900">
                    <strong>{loan.guarantor1?.name || '—'}</strong> ({loan.guarantor1?.phone})
                  </span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">जमानतदार 2:</span>
                  <span className="flex-1 p-2.5 text-slate-900">
                    <strong>{loan.guarantor2?.name || '—'}</strong> ({loan.guarantor2?.phone})
                  </span>
                </div>
              </div>

              {/* Column 3 */}
              <div className="divide-y divide-slate-200">
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">ब्याज दर:</span>
                  <span className="flex-1 p-2.5 font-bold font-mono text-slate-900">{loan.interestRate}% p.a. (घटते क्रम)</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">लेट फीस दर:</span>
                  <span className="flex-1 p-2.5 font-bold font-mono text-rose-700">
                    Rs {loan.lateFeeRatePerDay}/Day
                  </span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">जमानतदार 1 चेक:</span>
                  <span className="flex-1 p-2.5 font-mono text-slate-800">{loan.guarantor1?.chequeNo || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold bg-slate-50 p-2.5 text-slate-700">जमानतदार 2 चेक:</span>
                  <span className="flex-1 p-2.5 font-mono text-slate-800">{loan.guarantor2?.chequeNo || '—'}</span>
                </div>
              </div>
            </div>

            {/* Pre-EMI Deductions Audit Strip */}
            <div className="bg-amber-50/70 border-t border-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-amber-900">
                वितरण पूर्व कटौती समायोजन:
              </span>
              <div className="flex flex-wrap items-center gap-4 text-slate-700">
                <span>
                  प्री-ईएमआई:{' '}
                  <strong className="font-mono">{formatINR(loan.preEmiDeductions?.preEmiAmount || 0)}</strong>
                </span>
                <span>•</span>
                <span>
                  प्रोसेसिंग फीस:{' '}
                  <strong className="font-mono">₹{loan.preEmiDeductions?.processingFee || 500}.00</strong>
                </span>
                <span>•</span>
                <span>
                  भवन निधि:{' '}
                  <strong className="font-mono">₹{loan.preEmiDeductions?.buildingFund || 300}.00</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-800 font-bold">
                  निवल भुगतान किया गया चेक:{' '}
                  <strong className="font-mono text-sm">
                    {formatINR(loan.preEmiDeductions?.netDisbursed || (loan.loanAmount - 3466.66))}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* MEMBER LOAN PROGRESS GRAPH: इतना लिया था, इतना दिया, अब इतना बचा */}
          <div className="no-print">
            <MemberLoanProgressGraph loan={loan} />
          </div>

          {/* MAIN LOAN LEDGER TABLE (EXACT COLOR CODING OF IMAGE 1) */}
          <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-white text-center font-bold text-[11px] leading-tight select-none">
                  {/* RED HEADER SECTION (देय अनुसूची) */}
                  <th className="bg-[#b30000] border border-red-800 px-2.5 py-3 whitespace-nowrap">
                    ईएमआई क्र.
                  </th>
                  <th className="bg-[#b30000] border border-red-800 px-3 py-3 whitespace-nowrap">
                    ईएमआई देय तिथि
                  </th>
                  <th className="bg-[#b30000] border border-red-800 px-3 py-3 whitespace-nowrap">
                    देय मूलधन
                  </th>
                  <th className="bg-[#b30000] border border-red-800 px-3 py-3 whitespace-nowrap">
                    देय ब्याज
                  </th>
                  <th className="bg-[#b30000] border border-red-800 px-3 py-3 whitespace-nowrap">
                    कुल देय राशि
                  </th>

                  {/* BLUE HEADER SECTION (जमा विवरण) */}
                  <th className="bg-[#0070ba] border border-blue-700 px-3 py-3 whitespace-nowrap">
                    जमा दिनांक
                  </th>
                  <th className="bg-[#0070ba] border border-blue-700 px-2.5 py-3 whitespace-nowrap">
                    विलंब दिन (ऑटो)
                  </th>
                  <th className="bg-[#0070ba] border border-blue-700 px-3 py-3 whitespace-nowrap">
                    जमा का माध्यम
                  </th>
                  <th className="bg-[#0070ba] border border-blue-700 px-3 py-3 whitespace-nowrap">
                    कुल जमा राशि
                  </th>
                  <th className="bg-[#0070ba] border border-blue-700 px-3 py-3 whitespace-nowrap">
                    जमा मूलधन
                  </th>

                  {/* GREEN HEADER SECTION (जमा ब्याज ऑटो) */}
                  <th className="bg-[#008a28] border border-emerald-700 px-3 py-3 whitespace-nowrap">
                    जमा ब्याज (ऑटो)
                  </th>

                  {/* RED HEADER SECTION (पेनल्टी) */}
                  <th className="bg-[#b30000] border border-red-800 px-2.5 py-3 whitespace-nowrap">
                    पेनल्टी
                  </th>

                  {/* GREEN HEADER SECTION (ली गई पेनल्टी) */}
                  <th className="bg-[#008a28] border border-emerald-700 px-2.5 py-3 whitespace-nowrap">
                    ली गई पेनल्टी
                  </th>

                  {/* RED HEADER SECTION (लेट फीस & शेष ऋण) */}
                  <th className="bg-[#b30000] border border-red-800 px-2.5 py-3 whitespace-nowrap">
                    लेट फीस
                  </th>
                  <th className="bg-[#b30000] border border-red-800 px-3 py-3 whitespace-nowrap">
                    शेष ऋण (मूलधन)
                  </th>

                  <th className="bg-slate-800 border border-slate-700 px-3 py-3 whitespace-nowrap no-print">
                    स्थिति / क्रिया
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-mono text-slate-800 text-[11px]">
                {loan.installments.map((inst) => {
                  const isEditing = editingEmiNo === inst.emiNo;
                  const isPaid = inst.status === 'PAID' || inst.status === 'DELAYED_PAID' || inst.totalPaid >= inst.totalDue;
                  const isOverdue = inst.status === 'OVERDUE' || (!isPaid && inst.delayDays > 0);

                  // Row background styling based on payment timing
                  let rowBg = 'hover:bg-slate-50';
                  if (inst.status === 'PAID') rowBg = 'bg-emerald-50/30 hover:bg-emerald-50/50';
                  else if (inst.status === 'DELAYED_PAID') rowBg = 'bg-amber-50/40 hover:bg-amber-50/60';
                  else if (isOverdue) rowBg = 'bg-rose-50/40 hover:bg-rose-50/60';

                  return (
                    <tr key={inst.emiNo} className={`${rowBg} transition-colors`}>
                      {/* 1. ईएमआई क्र. */}
                      <td className="px-2.5 py-2.5 text-center font-bold text-slate-900 border-r border-slate-200">
                        {inst.emiNo}
                      </td>

                      {/* 2. ईएमआई देय तिथि */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap border-r border-slate-200">
                        {inst.dueDate}
                      </td>

                      {/* 3. देय मूलधन */}
                      <td className="px-3 py-2.5 text-right font-medium border-r border-slate-200">
                        ₹ {Math.round(inst.duePrincipal).toLocaleString('en-IN')}
                      </td>

                      {/* 4. देय ब्याज (घटता हुआ क्रम) */}
                      <td className="px-3 py-2.5 text-right font-medium border-r border-slate-200 text-amber-800">
                        ₹ {Math.round(inst.dueInterest).toLocaleString('en-IN')}
                      </td>

                      {/* 5. कुल देय राशि */}
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900 border-r border-slate-200">
                        ₹ {Math.round(inst.totalDue).toLocaleString('en-IN')}
                      </td>

                      {/* 6. जमा दिनांक */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap border-r border-slate-200">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.depositDate || ''}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, depositDate: e.target.value })
                            }
                            placeholder="DD/MM/YYYY"
                            className="w-24 text-center text-xs border rounded p-1 bg-white font-mono"
                          />
                        ) : (
                          inst.depositDate || <span className="text-slate-400 font-sans">—</span>
                        )}
                      </td>

                      {/* 7. विलंब दिन (ऑटो) */}
                      <td className="px-2.5 py-2.5 text-center border-r border-slate-200">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFormData.delayDays ?? 0}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                delayDays: Number(e.target.value),
                                penaltyCalculated: Number(e.target.value) * (loan.lateFeeRatePerDay || 2.6),
                              })
                            }
                            className="w-14 text-center text-xs border rounded p-1 font-mono"
                          />
                        ) : inst.delayDays > 0 ? (
                          <span className="font-bold text-rose-700">{inst.delayDays} दिन</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      {/* 8. जमा का माध्यम */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap border-r border-slate-200 font-sans">
                        {isEditing ? (
                          <select
                            value={editFormData.paymentMode || 'नकद (Cash)'}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, paymentMode: e.target.value })
                            }
                            className="text-xs border rounded p-1 bg-white"
                          >
                            <option value="नकद (Cash)">नकद (Cash)</option>
                            <option value="चेक (Cheque)">चेक (Cheque)</option>
                            <option value="यूपीआई (UPI)">यूपीआई (UPI)</option>
                            <option value="बैंक ट्रांसफर (NEFT)">बैंक ट्रांसफर (NEFT)</option>
                          </select>
                        ) : (
                          inst.paymentMode || <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* 9. कुल जमा राशि */}
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-800 border-r border-slate-200">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.totalPaid ?? 0}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                totalPaid: Number(e.target.value),
                              })
                            }
                            className="w-20 text-right text-xs border rounded p-1 font-mono"
                          />
                        ) : inst.totalPaid > 0 ? (
                          `₹ ${Math.round(inst.totalPaid).toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-slate-400 font-sans">₹ 0</span>
                        )}
                      </td>

                      {/* 10. जमा मूलधन */}
                      <td className="px-3 py-2.5 text-right border-r border-slate-200">
                        {isEditing ? (
                          <input
                            type="number"
                            step="1"
                            value={editFormData.paidPrincipal ?? 0}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                paidPrincipal: Number(e.target.value),
                              })
                            }
                            className="w-20 text-right text-xs border rounded p-1 font-mono"
                          />
                        ) : inst.paidPrincipal > 0 ? (
                          `₹ ${Math.round(inst.paidPrincipal).toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-slate-400 font-sans">—</span>
                        )}
                      </td>

                      {/* 11. जमा ब्याज (ऑटो) */}
                      <td className="px-3 py-2.5 text-right border-r border-slate-200 text-amber-900 font-medium">
                        {isEditing ? (
                          <input
                            type="number"
                            step="1"
                            value={editFormData.paidInterest ?? 0}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                paidInterest: Number(e.target.value),
                              })
                            }
                            className="w-20 text-right text-xs border rounded p-1 font-mono"
                          />
                        ) : inst.paidInterest > 0 ? (
                          `₹ ${Math.round(inst.paidInterest).toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-slate-400 font-sans">—</span>
                        )}
                      </td>

                      {/* 12. पेनल्टी (ऑटो @ ₹2.6/दिन) */}
                      <td className="px-2.5 py-2.5 text-right border-r border-slate-200 text-rose-700">
                        {isEditing ? (
                          <input
                            type="number"
                            step="1"
                            value={editFormData.penaltyCalculated ?? 0}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                penaltyCalculated: Number(e.target.value),
                              })
                            }
                            className="w-16 text-right text-xs border rounded p-1 font-mono"
                          />
                        ) : inst.penaltyCalculated > 0 ? (
                          `₹ ${Math.round(inst.penaltyCalculated).toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-slate-400 font-sans">0</span>
                        )}
                      </td>

                      {/* 13. ली गई पेनल्टी */}
                      <td className="px-2.5 py-2.5 text-right border-r border-slate-200 font-semibold text-emerald-700">
                        {isEditing ? (
                          <input
                            type="number"
                            step="1"
                            value={editFormData.penaltyCollected ?? 0}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                penaltyCollected: Number(e.target.value),
                              })
                            }
                            className="w-16 text-right text-xs border rounded p-1 font-mono"
                          />
                        ) : inst.penaltyCollected > 0 ? (
                          `₹ ${Math.round(inst.penaltyCollected).toLocaleString('en-IN')}`
                        ) : (
                          <span className="text-slate-400 font-sans">0</span>
                        )}
                      </td>

                      {/* 14. लेट फीस दर */}
                      <td className="px-2.5 py-2.5 text-center border-r border-slate-200 text-slate-600">
                        Rs {inst.lateFee || loan.lateFeeRatePerDay}/D
                      </td>

                      {/* 15. शेष ऋण (मूलधन) */}
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900 border-r border-slate-200">
                        ₹ {Math.round(inst.remainingPrincipal).toLocaleString('en-IN')}
                      </td>

                      {/* 16. Action / Status Tag */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap no-print font-sans">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSaveOverride(inst.emiNo)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                              title="सहेजें (Save)"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingEmiNo(null)}
                              className="p-1 rounded bg-slate-400 hover:bg-slate-500 text-white"
                              title="रद्द करें (Cancel)"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Color Combination Status Tags as requested */}
                            {inst.status === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                समय पर जमा
                              </span>
                            ) : inst.status === 'DELAYED_PAID' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" />
                                विलंबित जमा
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                बकाया / डिले
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
                                देय प्रतीक्षारत
                              </span>
                            )}

                            {/* Payment Entry Button if unpaid */}
                            {!isPaid && onOpenPaymentEntry && (
                              <button
                                onClick={() => onOpenPaymentEntry(loan, inst.emiNo)}
                                className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] transition-colors"
                                title="किश्त जमा करें"
                              >
                                जमा
                              </button>
                            )}

                            {/* Receipt Button if paid */}
                            {isPaid && onPrintReceipt && (
                              <button
                                onClick={() => onPrintReceipt(loan, inst)}
                                className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium text-[10px] transition-colors"
                                title="रसीद प्रिंट करें"
                              >
                                रसीद
                              </button>
                            )}

                            {/* Per-Entry Lock / Unlock Button */}
                            <button
                              onClick={() => toggleInstallmentLock(loan.id, inst.emiNo)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                inst.isLocked
                                  ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300'
                                  : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
                              }`}
                              title={inst.isLocked ? 'किश्त प्रविष्टि लॉक्ड है - अनलॉक करने के लिए क्लिक करें' : 'किश्त प्रविष्टि खुली है - सुरक्षित लॉक करने के लिए क्लिक करें'}
                            >
                              {inst.isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>

                            {/* Manual Admin Override Edit Icon */}
                            <button
                              onClick={() => startEdit(inst)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                inst.isLocked
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                              }`}
                              title={inst.isLocked ? 'लॉक्ड है - संशोधन से पहले अनलॉक करें' : 'प्रशासक द्वारा मैन्युअल संशोधन'}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* MANDATORY TOTAL ROW FOR EVERY REPORT AS REQUESTED */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-mono font-bold text-[11px] border-t-2 border-slate-400">
                  <td className="px-2.5 py-3 text-center" colSpan={2}>
                    कुल योग (TOTAL)
                  </td>
                  <td className="px-3 py-3 text-right">
                    ₹ {totals.totalDuePrincipal.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right text-amber-300">
                    ₹ {totals.totalDueInterest.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right text-amber-300">
                    ₹ {totals.totalDueAmount.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-center font-sans text-slate-300">
                    —
                  </td>
                  <td className="px-2.5 py-3 text-center text-rose-300">
                    {totals.totalDelayDays} दिन
                  </td>
                  <td className="px-3 py-3 text-center font-sans text-slate-300">
                    —
                  </td>
                  <td className="px-3 py-3 text-right text-emerald-400">
                    ₹ {totals.totalPaidAmount.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right text-emerald-400">
                    ₹ {totals.totalPaidPrincipal.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right text-emerald-400">
                    ₹ {totals.totalPaidInterest.toFixed(2)}
                  </td>
                  <td className="px-2.5 py-3 text-right text-rose-400">
                    ₹ {totals.totalPenaltyCalculated.toFixed(2)}
                  </td>
                  <td className="px-2.5 py-3 text-right text-emerald-300">
                    ₹ {totals.totalPenaltyCollected.toFixed(2)}
                  </td>
                  <td className="px-2.5 py-3 text-center text-slate-400">
                    —
                  </td>
                  <td className="px-3 py-3 text-right text-amber-300">
                    ₹ {Math.max(0, loan.loanAmount - totals.totalPaidPrincipal).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-center text-slate-400 font-sans no-print">
                    —
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes & Authority Signature box for print */}
          <div className="hidden print-only pt-8 grid grid-cols-3 gap-8 text-center text-xs">
            <div className="border-t border-black pt-2 font-medium">ऋणी के हस्ताक्षर</div>
            <div className="border-t border-black pt-2 font-medium">लेखापाल / लिपिक</div>
            <div className="border-t border-black pt-2 font-medium">
              {manager.name} ({manager.designationHindi || 'प्रबंधक'}), {societyInfo.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
