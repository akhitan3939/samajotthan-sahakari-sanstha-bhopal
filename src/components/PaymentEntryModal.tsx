import React, { useState, useMemo } from 'react';
import { useSociety, SingleEmiPayment } from '../context/SocietyContext';
import { EmiInstallment, LoanRecord, PaymentStatus } from '../types';
import {
  calculateDelayDays,
  calculatePenalty,
  formatDateToDisplay,
  formatINR,
} from '../utils/loanCalculations';
import { SocietyEmblem } from './SocietyEmblem';
import {
  X,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Coins,
  Lock,
  Unlock,
  Edit3,
  RotateCcw,
  Save,
  CheckSquare,
  Square,
  ShieldCheck,
  Filter,
  AlertTriangle,
  Receipt
} from 'lucide-react';

interface PaymentEntryModalProps {
  loan: LoanRecord;
  initialEmiNo?: number;
  onClose: () => void;
  onSuccessPrintReceipt?: (loan: LoanRecord, emi: EmiInstallment) => void;
}

export const PaymentEntryModal: React.FC<PaymentEntryModalProps> = ({
  loan,
  initialEmiNo,
  onClose,
  onSuccessPrintReceipt,
}) => {
  const {
    recordMultiPayment,
    recordLumpSumPayment,
    manualOverrideInstallment,
    toggleInstallmentLock,
    toggleAllInstallmentsLock,
  } = useSociety();

  const [paymentMode, setPaymentMode] = useState('नकद (Cash)');
  const [depositDate, setDepositDate] = useState(() => formatDateToDisplay(new Date()));
  const [chequeOrTxnNo, setChequeOrTxnNo] = useState('');

  // Table filter: ALL, UNPAID, PAID
  const [tableFilter, setTableFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('UNPAID');

  // Unpaid installments
  const unpaidInstallments = useMemo(() => {
    return loan.installments.filter(
      (i) => i.status !== 'PAID' && i.status !== 'DELAYED_PAID' && (i.totalPaid || 0) < i.totalDue
    );
  }, [loan.installments]);

  // Selected EMI numbers for multi-checkbox payment
  const [selectedEmiNos, setSelectedEmiNos] = useState<number[]>(() => {
    if (initialEmiNo) return [initialEmiNo];
    if (unpaidInstallments.length > 0) return [unpaidInstallments[0].emiNo];
    return [1];
  });

  // Lump-sum Quick Input
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(0);
  const [isLumpSumMode, setIsLumpSumMode] = useState(false);

  // Partial / Selective Payment Presets
  const [splitPreset, setSplitPreset] = useState<'FULL' | 'PRINCIPAL_ONLY' | 'INTEREST_ONLY' | 'WAIVE_PENALTY' | 'CUSTOM'>('FULL');
  const [principalOverrides, setPrincipalOverrides] = useState<Record<number, number>>({});
  const [interestOverrides, setInterestOverrides] = useState<Record<number, number>>({});
  const [penaltyOverrides, setPenaltyOverrides] = useState<Record<number, number>>({});
  const [paymentRemarks, setPaymentRemarks] = useState<string>('');

  // EDIT ENTRY STATE (For correcting mistaken data)
  const [editingInstallment, setEditingInstallment] = useState<EmiInstallment | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<EmiInstallment>>({});
  const [editReason, setEditReason] = useState<string>('');
  const [statusNotification, setStatusNotification] = useState<{ text: string; type: 'success' | 'warn' | 'info' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'warn' | 'info' = 'success') => {
    setStatusNotification({ text, type });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Checkbox Selection Handlers
  const toggleEmiSelection = (emiNo: number) => {
    if (selectedEmiNos.includes(emiNo)) {
      setSelectedEmiNos(selectedEmiNos.filter((n) => n !== emiNo));
    } else {
      setSelectedEmiNos([...selectedEmiNos, emiNo].sort((a, b) => a - b));
    }
  };

  const handleSelectAllPending = () => {
    const allPendingNos = unpaidInstallments.map((i) => i.emiNo);
    setSelectedEmiNos(allPendingNos);
    showNotification(`सभी ${allPendingNos.length} बकाया किश्तें चयनित की गईं`, 'info');
  };

  const handleDeselectAll = () => {
    setSelectedEmiNos([]);
  };

  const handleSelectCount = (count: number) => {
    const list = unpaidInstallments.slice(0, count).map((i) => i.emiNo);
    setSelectedEmiNos(list);
  };

  // Switch Preset Handler
  const handleApplyPreset = (preset: 'FULL' | 'PRINCIPAL_ONLY' | 'INTEREST_ONLY' | 'WAIVE_PENALTY' | 'CUSTOM') => {
    setSplitPreset(preset);
    const newPOverrides: Record<number, number> = {};
    const newIOverrides: Record<number, number> = {};
    const newPenOverrides: Record<number, number> = {};

    selectedEmiNos.forEach((emiNo) => {
      const inst = loan.installments.find((i) => i.emiNo === emiNo);
      if (!inst) return;
      const delay = calculateDelayDays(inst.dueDate, depositDate);
      const autoPen = calculatePenalty(delay, loan.lateFeeRatePerDay || 2.6);

      if (preset === 'FULL') {
        newPOverrides[emiNo] = inst.duePrincipal;
        newIOverrides[emiNo] = inst.dueInterest;
        newPenOverrides[emiNo] = autoPen;
        setPaymentRemarks('');
      } else if (preset === 'PRINCIPAL_ONLY') {
        newPOverrides[emiNo] = inst.duePrincipal;
        newIOverrides[emiNo] = 0;
        newPenOverrides[emiNo] = 0;
        setPaymentRemarks('केवल मूलधन जमा, शेष ब्याज बाद में देय होगा');
      } else if (preset === 'INTEREST_ONLY') {
        newPOverrides[emiNo] = 0;
        newIOverrides[emiNo] = inst.dueInterest;
        newPenOverrides[emiNo] = 0;
        setPaymentRemarks('केवल ब्याज जमा, मूलधन देयता यथावत');
      } else if (preset === 'WAIVE_PENALTY') {
        newPOverrides[emiNo] = inst.duePrincipal;
        newIOverrides[emiNo] = inst.dueInterest;
        newPenOverrides[emiNo] = 0;
        setPaymentRemarks('संस्था द्वारा लेट फीस पेनल्टी पूर्ण माफ़');
      }
    });

    setPrincipalOverrides(newPOverrides);
    setInterestOverrides(newIOverrides);
    setPenaltyOverrides(newPenOverrides);
  };

  // Calculate detailed items for selected EMIs
  const calculatedItems = useMemo(() => {
    return selectedEmiNos.map((emiNo) => {
      const inst = loan.installments.find((i) => i.emiNo === emiNo);
      if (!inst) {
        return {
          emiNo,
          duePrincipal: 0,
          dueInterest: 0,
          totalDue: 0,
          delayDays: 0,
          autoPenalty: 0,
          paidPrincipal: 0,
          paidInterest: 0,
          penaltyCollected: 0,
          penaltyWaived: 0,
          pendingInterest: 0,
          itemTotal: 0,
          paymentSplitType: 'FULL' as const,
        };
      }

      const delayDays = calculateDelayDays(inst.dueDate, depositDate);
      const autoPenalty = calculatePenalty(delayDays, loan.lateFeeRatePerDay || 2.6);

      const paidPrincipal = principalOverrides[emiNo] !== undefined
        ? principalOverrides[emiNo]
        : (splitPreset === 'INTEREST_ONLY' ? 0 : inst.duePrincipal);

      const paidInterest = interestOverrides[emiNo] !== undefined
        ? interestOverrides[emiNo]
        : (splitPreset === 'PRINCIPAL_ONLY' ? 0 : inst.dueInterest);

      const penaltyCollected = penaltyOverrides[emiNo] !== undefined
        ? penaltyOverrides[emiNo]
        : (splitPreset === 'WAIVE_PENALTY' || splitPreset === 'PRINCIPAL_ONLY' || splitPreset === 'INTEREST_ONLY' ? 0 : autoPenalty);

      const penaltyWaived = Math.max(0, autoPenalty - penaltyCollected);
      const pendingInterest = Math.max(0, inst.dueInterest - paidInterest);

      const itemTotal = paidPrincipal + paidInterest + penaltyCollected;

      let splitType: 'FULL' | 'PRINCIPAL_ONLY' | 'INTEREST_ONLY' | 'CUSTOM' = 'FULL';
      if (paidPrincipal > 0 && paidInterest === 0) splitType = 'PRINCIPAL_ONLY';
      else if (paidPrincipal === 0 && paidInterest > 0) splitType = 'INTEREST_ONLY';
      else if (paidPrincipal < inst.duePrincipal || paidInterest < inst.dueInterest || penaltyWaived > 0) splitType = 'CUSTOM';

      return {
        emiNo,
        duePrincipal: inst.duePrincipal,
        dueInterest: inst.dueInterest,
        totalDue: inst.totalDue,
        delayDays,
        autoPenalty,
        paidPrincipal,
        paidInterest,
        penaltyCollected,
        penaltyWaived,
        pendingInterest,
        itemTotal,
        paymentSplitType: splitType,
      };
    });
  }, [
    selectedEmiNos,
    loan.installments,
    depositDate,
    loan.lateFeeRatePerDay,
    principalOverrides,
    interestOverrides,
    penaltyOverrides,
    splitPreset,
  ]);

  const grandTotal = useMemo(() => {
    return calculatedItems.reduce((acc, item) => acc + item.itemTotal, 0);
  }, [calculatedItems]);

  const totalPendingInterest = useMemo(() => {
    return calculatedItems.reduce((acc, item) => acc + item.pendingInterest, 0);
  }, [calculatedItems]);

  const totalPenaltyWaived = useMemo(() => {
    return calculatedItems.reduce((acc, item) => acc + item.penaltyWaived, 0);
  }, [calculatedItems]);

  // START EDITING AN INSTALLMENT (to correct mistaken data)
  const handleStartEdit = (inst: EmiInstallment) => {
    if (inst.isLocked) {
      showNotification(`⚠️ किश्त #${inst.emiNo} लॉक्ड है! पहले 🔓 अनलॉक बटन दबाएं।`, 'warn');
      return;
    }
    setEditingInstallment(inst);
    setEditFormData({
      dueDate: inst.dueDate,
      duePrincipal: inst.duePrincipal,
      dueInterest: inst.dueInterest,
      totalDue: inst.totalDue,
      depositDate: inst.depositDate || formatDateToDisplay(new Date()),
      delayDays: inst.delayDays,
      paymentMode: inst.paymentMode || 'नकद (Cash)',
      chequeOrTxnNo: inst.chequeOrTxnNo || '',
      totalPaid: inst.totalPaid || 0,
      paidPrincipal: inst.paidPrincipal || 0,
      paidInterest: inst.paidInterest || 0,
      penaltyCalculated: inst.penaltyCalculated || 0,
      penaltyCollected: inst.penaltyCollected || 0,
      penaltyWaived: inst.penaltyWaived || 0,
      status: inst.status || 'PAID',
      paymentRemarks: inst.paymentRemarks || '',
    });
    setEditReason(inst.overrideReason || 'गलत प्रविष्टि में संशोधन / सुधार');
  };

  // SAVE EDITED INSTALLMENT
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstallment) return;

    const calcTotalPaid = Number(editFormData.paidPrincipal || 0) + Number(editFormData.paidInterest || 0) + Number(editFormData.penaltyCollected || 0);

    const payload: Partial<EmiInstallment> = {
      ...editFormData,
      totalPaid: calcTotalPaid,
      paidPrincipal: Number(editFormData.paidPrincipal || 0),
      paidInterest: Number(editFormData.paidInterest || 0),
      penaltyCollected: Number(editFormData.penaltyCollected || 0),
      penaltyWaived: Number(editFormData.penaltyWaived || 0),
      delayDays: Number(editFormData.delayDays || 0),
      depositDate: editFormData.depositDate || null,
      status: (editFormData.status as PaymentStatus) || (calcTotalPaid >= (editingInstallment.totalDue || 0) ? 'PAID' : 'PARTIAL'),
    };

    manualOverrideInstallment(loan.id, editingInstallment.emiNo, payload, editReason);
    showNotification(`✓ किश्त #${editingInstallment.emiNo} का डेटा सफलतापूर्वक संशोधित हुआ!`, 'success');
    setEditingInstallment(null);
  };

  // REVERT / RESET AN INSTALLMENT BACK TO PENDING
  const handleRevertToPending = (inst: EmiInstallment) => {
    if (inst.isLocked) {
      showNotification(`⚠️ किश्त #${inst.emiNo} लॉक्ड है! पहले 🔓 अनलॉक करें।`, 'warn');
      return;
    }
    const confirmRevert = window.confirm(`क्या आप किश्त #${inst.emiNo} का जमा डेटा रद्द कर इसे पुनः 'बकाया (Pending)' बनाना चाहते हैं?`);
    if (!confirmRevert) return;

    manualOverrideInstallment(
      loan.id,
      inst.emiNo,
      {
        depositDate: null,
        totalPaid: 0,
        paidPrincipal: 0,
        paidInterest: 0,
        penaltyCollected: 0,
        penaltyWaived: 0,
        pendingInterest: 0,
        delayDays: 0,
        status: 'PENDING',
        paymentRemarks: 'प्रशासक द्वारा गलत प्रविष्टि रद्द / पूर्ववत',
      },
      'गलत प्रविष्टि रद्द कर पुनः बकाया किया गया'
    );
    showNotification(`✓ किश्त #${inst.emiNo} को पुनः 'बकाया' घोषित किया गया`, 'info');
    if (editingInstallment?.emiNo === inst.emiNo) {
      setEditingInstallment(null);
    }
  };

  // SUBMIT MULTI-EMI PAYMENT
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLumpSumMode && lumpSumAmount > 0) {
      recordLumpSumPayment(
        loan.id,
        depositDate,
        lumpSumAmount,
        paymentMode,
        chequeOrTxnNo
      );
      onClose();
      return;
    }

    if (selectedEmiNos.length === 0) {
      alert('कृपया कम से कम एक किश्त का चेकबॉक्स चुनें!');
      return;
    }

    const payloadPayments: SingleEmiPayment[] = calculatedItems.map((item) => ({
      emiNo: item.emiNo,
      paidPrincipal: item.paidPrincipal,
      paidInterest: item.paidInterest,
      penaltyCollected: item.penaltyCollected,
      penaltyWaived: item.penaltyWaived,
      pendingInterest: item.pendingInterest,
      totalPaid: item.itemTotal,
      delayDays: item.delayDays,
      paymentSplitType: item.paymentSplitType,
      remarks: paymentRemarks,
    }));

    recordMultiPayment({
      loanId: loan.id,
      depositDate,
      paymentMode,
      chequeOrTxnNo,
      payments: payloadPayments,
      notes: paymentRemarks,
    });

    // Provide receipt callback for first paid installment
    const firstPaid = loan.installments.find((i) => i.emiNo === selectedEmiNos[0]);
    if (firstPaid && onSuccessPrintReceipt) {
      onSuccessPrintReceipt(loan, {
        ...firstPaid,
        depositDate,
        paymentMode,
        chequeOrTxnNo,
        totalPaid: calculatedItems[0]?.itemTotal || firstPaid.totalDue,
        paidPrincipal: calculatedItems[0]?.paidPrincipal ?? firstPaid.duePrincipal,
        paidInterest: calculatedItems[0]?.paidInterest ?? firstPaid.dueInterest,
        penaltyCollected: calculatedItems[0]?.penaltyCollected ?? 0,
        penaltyWaived: calculatedItems[0]?.penaltyWaived ?? 0,
        pendingInterest: calculatedItems[0]?.pendingInterest ?? 0,
        paymentRemarks,
        status: calculatedItems[0]?.paymentSplitType !== 'FULL' ? 'PARTIAL' : (calculatedItems[0]?.delayDays > 0 ? 'DELAYED_PAID' : 'PAID'),
      });
    }

    onClose();
  };

  // Filtered installments for display in table
  const displayedInstallments = useMemo(() => {
    if (tableFilter === 'UNPAID') {
      return loan.installments.filter((i) => i.status !== 'PAID' && i.status !== 'DELAYED_PAID');
    }
    if (tableFilter === 'PAID') {
      return loan.installments.filter((i) => i.status === 'PAID' || i.status === 'DELAYED_PAID' || (i.totalPaid || 0) > 0);
    }
    return loan.installments;
  }, [loan.installments, tableFilter]);

  const allDisplayedAreSelected = useMemo(() => {
    const selectable = displayedInstallments.filter((i) => i.status !== 'PAID' && i.status !== 'DELAYED_PAID');
    if (selectable.length === 0) return false;
    return selectable.every((i) => selectedEmiNos.includes(i.emiNo));
  }, [displayedInstallments, selectedEmiNos]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <SocietyEmblem size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  किश्त भुगतान एवं प्रविष्टि संशोधन (Installment Hub)
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {selectedEmiNos.length} किश्त चयनित
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ऋणी: <strong className="text-amber-300">{loan.borrowerName}</strong> • सदस्यता: #{loan.membershipNo} • खाता: {loan.accountNo} • स्वीकृत ऋण: {formatINR(loan.loanAmount)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Toast */}
        {statusNotification && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 transition-all ${
              statusNotification.type === 'success'
                ? 'bg-emerald-600 text-white'
                : statusNotification.type === 'warn'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-blue-600 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{statusNotification.text}</span>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-xs opacity-75 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Top Control Bar: Mode Toggle + Lock All / Unlock All */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">कार्य मोड:</span>
              <button
                type="button"
                onClick={() => setIsLumpSumMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isLumpSumMode
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                तालिका से किश्तें चुनें ({selectedEmiNos.length})
              </button>
              <button
                type="button"
                onClick={() => setIsLumpSumMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isLumpSumMode
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                एकमुश्त राशि (Lump-Sum Auto)
              </button>
            </div>

            {/* Mass Lock / Unlock Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  toggleAllInstallmentsLock(loan.id, true);
                  showNotification('✓ सभी किश्त प्रविष्टियां सुरक्षित लॉक (Lock) कर दी गईं!', 'success');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="सभी प्रविष्टियों को लॉक करें"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>सभी लॉक करें</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleAllInstallmentsLock(loan.id, false);
                  showNotification('✓ सभी किश्त प्रविष्टियां अनलॉक (Unlock) कर दी गईं', 'info');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="सभी प्रविष्टियों को अनलॉक करें"
              >
                <Unlock className="w-3.5 h-3.5 text-slate-600" />
                <span>सभी अनलॉक</span>
              </button>
            </div>
          </div>

          {/* LUMP SUM MODE */}
          {isLumpSumMode ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>सदस्य द्वारा दी गई एकमुश्त राशि दर्ज करें:</span>
              </div>
              <p className="text-xs text-slate-600">
                सिस्टम अपने आप देय किश्तों में मूलधन, 14% घटते ब्याज व लेट फीस का अनुक्रमिक हिसाब लगाकर शेष राशि क्रेडिट कर देगा।
              </p>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  कुल जमा नकद / चेक राशि (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="100"
                  placeholder="उदा. 5000 या 10000"
                  value={lumpSumAmount || ''}
                  onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                  className="w-full p-3 border-2 border-emerald-500 rounded-xl text-lg font-bold font-mono bg-white"
                />
              </div>
            </div>
          ) : (
            /* TABLE CHECKBOX SELECTION MODE */
            <div className="space-y-4">
              {/* Quick Select & Filter Toolbar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-700 text-xs">तालिका फ़िल्टर:</span>
                  <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setTableFilter('UNPAID')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        tableFilter === 'UNPAID'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      केवल बकाया ({unpaidInstallments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableFilter('ALL')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        tableFilter === 'ALL'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      सभी किश्तें ({loan.installments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableFilter('PAID')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        tableFilter === 'PAID'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      जमा हो चुकी ({loan.installments.filter((i) => i.status === 'PAID' || i.status === 'DELAYED_PAID').length})
                    </button>
                  </div>
                </div>

                {/* Quick Checkbox Selectors */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-600">त्वरित चयन:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectCount(1)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-[11px] cursor-pointer"
                  >
                    1 किश्त
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCount(2)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-[11px] cursor-pointer"
                  >
                    2 किश्त
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectCount(3)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-[11px] cursor-pointer"
                  >
                    3 किश्त
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllPending}
                    className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 font-bold text-[11px] cursor-pointer"
                  >
                    सभी बकाया चुनें
                  </button>
                  {selectedEmiNos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[11px] cursor-pointer"
                    >
                      चयन हटाएं
                    </button>
                  )}
                </div>
              </div>

              {/* MAIN INTERACTIVE INSTALLMENT TABLE WITH CHECKBOXES, EDIT, & LOCK */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-900 text-white font-bold text-center sticky top-0 z-10 select-none">
                      <tr>
                        <th className="p-2.5 border-r border-slate-800 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={allDisplayedAreSelected}
                            onChange={(e) => {
                              if (e.target.checked) handleSelectAllPending();
                              else handleDeselectAll();
                            }}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                            title="सभी चेकबॉक्स चुनें / हटाएं"
                          />
                        </th>
                        <th className="p-2.5 border-r border-slate-800 whitespace-nowrap">ईएमआई #</th>
                        <th className="p-2.5 border-r border-slate-800 whitespace-nowrap">देय तिथि</th>
                        <th className="p-2.5 border-r border-slate-800 text-right whitespace-nowrap">देय मूलधन</th>
                        <th className="p-2.5 border-r border-slate-800 text-right whitespace-nowrap">देय ब्याज (14%)</th>
                        <th className="p-2.5 border-r border-slate-800 text-right whitespace-nowrap">कुल देय</th>
                        <th className="p-2.5 border-r border-slate-800 text-center whitespace-nowrap">स्थिति</th>
                        <th className="p-2.5 border-r border-slate-800 text-right whitespace-nowrap">जमा राशि</th>
                        <th className="p-2.5 border-r border-slate-800 text-center whitespace-nowrap">जमा दिनांक</th>
                        <th className="p-2.5 border-r border-slate-800 text-center whitespace-nowrap">🔒 लॉक स्थिति</th>
                        <th className="p-2.5 text-center whitespace-nowrap">✏️ कार्रवाई / सुधार</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedInstallments.map((inst) => {
                        const isChecked = selectedEmiNos.includes(inst.emiNo);
                        const isPaid = inst.status === 'PAID' || inst.status === 'DELAYED_PAID' || (inst.totalPaid || 0) >= inst.totalDue;
                        const isLocked = inst.isLocked === true;

                        return (
                          <tr
                            key={inst.emiNo}
                            className={`transition-colors ${
                              isChecked
                                ? 'bg-emerald-50/80 font-semibold'
                                : isPaid
                                ? 'bg-slate-50/60'
                                : 'hover:bg-amber-50/40'
                            }`}
                          >
                            {/* 1. CHECKBOX COLUMN */}
                            <td className="p-2 text-center border-r border-slate-100">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleEmiSelection(inst.emiNo)}
                                className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                title={`किश्त #${inst.emiNo} चुनें`}
                              />
                            </td>

                            {/* 2. EMI NO */}
                            <td className="p-2 text-center font-bold font-sans border-r border-slate-100">
                              #{inst.emiNo}
                            </td>

                            {/* 3. DUE DATE */}
                            <td className="p-2 text-center border-r border-slate-100 whitespace-nowrap">
                              {inst.dueDate}
                            </td>

                            {/* 4. DUE PRINCIPAL */}
                            <td className="p-2 text-right border-r border-slate-100">
                              ₹ {Math.round(inst.duePrincipal).toLocaleString('en-IN')}
                            </td>

                            {/* 5. DUE INTEREST */}
                            <td className="p-2 text-right text-amber-800 border-r border-slate-100">
                              ₹ {Math.round(inst.dueInterest).toLocaleString('en-IN')}
                            </td>

                            {/* 6. TOTAL DUE */}
                            <td className="p-2 text-right font-bold text-slate-900 border-r border-slate-100">
                              ₹ {Math.round(inst.totalDue).toLocaleString('en-IN')}
                            </td>

                            {/* 7. STATUS BADGE */}
                            <td className="p-2 text-center border-r border-slate-100 font-sans whitespace-nowrap">
                              {inst.status === 'PAID' ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  जमा
                                </span>
                              ) : inst.status === 'DELAYED_PAID' ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  विलंबित जमा
                                </span>
                              ) : inst.status === 'PARTIAL' ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                  आंशिक जमा
                                </span>
                              ) : inst.delayDays > 0 ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  बकाया ({inst.delayDays}D)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                                  देय
                                </span>
                              )}
                            </td>

                            {/* 8. PAID AMOUNT */}
                            <td className="p-2 text-right border-r border-slate-100 text-emerald-800 font-bold">
                              {(inst.totalPaid || 0) > 0 ? `₹ ${Math.round(inst.totalPaid).toLocaleString('en-IN')}` : '—'}
                            </td>

                            {/* 9. DEPOSIT DATE */}
                            <td className="p-2 text-center border-r border-slate-100 whitespace-nowrap">
                              {inst.depositDate || '—'}
                            </td>

                            {/* 10. LOCK/UNLOCK TOGGLE BUTTON (PER ENTRY LOCK) */}
                            <td className="p-2 text-center border-r border-slate-100 font-sans">
                              <button
                                type="button"
                                onClick={() => {
                                  toggleInstallmentLock(loan.id, inst.emiNo);
                                  showNotification(
                                    isLocked
                                      ? `✓ किश्त #${inst.emiNo} अनलॉक (Unlocked) हो गई`
                                      : `🔒 किश्त #${inst.emiNo} सुरक्षित लॉक (Locked) हो गई`,
                                    isLocked ? 'info' : 'success'
                                  );
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  isLocked
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                }`}
                                title={isLocked ? 'लॉक्ड है - अनलॉक करने के लिए क्लिक करें' : 'खुला है - सुरक्षित लॉक करने के लिए क्लिक करें'}
                              >
                                {isLocked ? (
                                  <>
                                    <Lock className="w-3 h-3 text-emerald-700" />
                                    <span>लॉक्ड</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3 h-3 text-slate-500" />
                                    <span>खुला</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* 11. ACTION: EDIT / REVERT */}
                            <td className="p-2 text-center font-sans">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(inst)}
                                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    isLocked
                                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                      : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}
                                  title={isLocked ? 'लॉक्ड है! संशोधन के लिए पहले 🔓 अनलॉक करें' : 'डेटा गलत भर दिया है तो सुधारें'}
                                >
                                  <Edit3 className="w-3 h-3 text-blue-600" />
                                  <span>सुधार</span>
                                </button>

                                {isPaid && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevertToPending(inst)}
                                    className={`p-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer ${
                                      isLocked
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                                    }`}
                                    title={isLocked ? 'लॉक्ड है - पहले अनलॉक करें' : 'गलत जमा हुआ है? वापस बकाया (Pending) करें'}
                                  >
                                    <RotateCcw className="w-3 h-3 text-rose-600" />
                                    <span>रीसेट</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAYMENT PRESET BUTTONS (Principal Only, Interest Only, Full, Penalty Waived) */}
              {selectedEmiNos.length > 0 && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-amber-950 text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>भुगतान विभाजन विकल्प (Selective Repayment Presets):</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-800">
                      {splitPreset === 'PRINCIPAL_ONLY' && `⚠️ केवल मूलधन जमा | ब्याज ${formatINR(totalPendingInterest)} बाद में देय`}
                      {splitPreset === 'INTEREST_ONLY' && '⚠️ केवल ब्याज जमा | मूलधन शेष यथावत'}
                      {splitPreset === 'WAIVE_PENALTY' && `✓ पेनल्टी ${formatINR(totalPenaltyWaived)} पूर्ण माफ़`}
                      {splitPreset === 'FULL' && '✓ पूर्ण किश्त (मूलधन + ब्याज + पेनल्टी)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('FULL')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
                        splitPreset === 'FULL'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                      }`}
                    >
                      1. पूर्ण किश्त
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('PRINCIPAL_ONLY')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
                        splitPreset === 'PRINCIPAL_ONLY'
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-300'
                      }`}
                      title="ग्राहक ने केवल मूलधन दिया, ब्याज बाद में देंगे"
                    >
                      2. केवल मूलधन (ब्याज बाद में)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('INTEREST_ONLY')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
                        splitPreset === 'INTEREST_ONLY'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-300'
                      }`}
                      title="ग्राहक ने केवल ब्याज दिया, मूलधन बाद में देंगे"
                    >
                      3. केवल ब्याज (मूलधन बाद में)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset('WAIVE_PENALTY')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
                        splitPreset === 'WAIVE_PENALTY'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-300'
                      }`}
                      title="संस्था द्वारा लेट फीस पेनल्टी पूर्ण माफ़"
                    >
                      4. पेनल्टी 100% माफ़
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EDIT FORM DRAWER (IF EDITING AN INSTALLMENT TO CORRECT MISTAKE) */}
          {editingInstallment && (
            <div className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-blue-950">
                      किश्त #{editingInstallment.emiNo} - डेटा सुधार / संशोधन फॉर्म
                    </h3>
                    <p className="text-[11px] text-blue-700">
                      यदि तारीख, राशि, माध्यम या पेनल्टी में कोई गलती हुई हो तो सही विवरण भरकर सहेजें।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingInstallment(null)}
                  className="p-1 rounded-lg text-blue-600 hover:bg-blue-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    जमा दिनांक (DD/MM/YYYY):
                  </label>
                  <input
                    type="text"
                    value={editFormData.depositDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, depositDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white font-mono"
                    placeholder="DD/MM/YYYY"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    भुगतान माध्यम:
                  </label>
                  <select
                    value={editFormData.paymentMode || 'नकद (Cash)'}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentMode: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="नकद (Cash)">नकद (Cash)</option>
                    <option value="चेक (Cheque)">चेक (Cheque)</option>
                    <option value="यूपीआई (UPI)">यूपीआई (UPI)</option>
                    <option value="बैंक ट्रांसफर (NEFT)">बैंक ट्रांसफर (NEFT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    चेक / यूटीआर क्रमांक:
                  </label>
                  <input
                    type="text"
                    value={editFormData.chequeOrTxnNo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, chequeOrTxnNo: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-white font-mono"
                    placeholder="Ref / Chq No..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    स्थिति (Status):
                  </label>
                  <select
                    value={editFormData.status || 'PAID'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as PaymentStatus })}
                    className="w-full p-2 border rounded-lg bg-white font-bold"
                  >
                    <option value="PAID">PAID (समय पर पूर्ण जमा)</option>
                    <option value="DELAYED_PAID">DELAYED_PAID (विलंबित जमा)</option>
                    <option value="PARTIAL">PARTIAL (आंशिक जमा)</option>
                    <option value="PENDING">PENDING (बकाया / देय)</option>
                    <option value="OVERDUE">OVERDUE (अतिदेय)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    जमा मूलधन (₹):
                  </label>
                  <input
                    type="number"
                    value={editFormData.paidPrincipal ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, paidPrincipal: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-white font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    जमा ब्याज (₹):
                  </label>
                  <input
                    type="number"
                    value={editFormData.paidInterest ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, paidInterest: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-white font-mono font-bold text-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ली गई पेनल्टी (₹):
                  </label>
                  <input
                    type="number"
                    value={editFormData.penaltyCollected ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, penaltyCollected: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-white font-mono text-rose-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    विलंब दिन (Delay Days):
                  </label>
                  <input
                    type="number"
                    value={editFormData.delayDays ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, delayDays: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  सुधार / संशोधन का कारण (Audit Reason):
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                  placeholder="उदा. तारीख गलत टाइप हो गई थी, सही किया गया"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <button
                  type="button"
                  onClick={() => handleRevertToPending(editingInstallment)}
                  className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                  <span>प्रविष्टि रद्द कर 'बकाया' में बदलें</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingInstallment(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-white cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>संशोधन सहेजें (Save)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT FORM FOR COLLECTING CHECKED INSTALLMENTS */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-200">
            {/* Common Payment Details: Date, Mode, Ref */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  जमा दिनांक (Deposit Date) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="DD/MM/YYYY"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  भुगतान का माध्यम *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="नकद (Cash)">नकद (Cash)</option>
                  <option value="चेक (Cheque)">चेक (Cheque)</option>
                  <option value="यूपीआई (UPI)">यूपीआई (UPI)</option>
                  <option value="बैंक ट्रांसफर (NEFT)">बैंक ट्रांसफर (NEFT)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  चेक / यूटीआर क्रमांक (वैकल्पिक)
                </label>
                <input
                  type="text"
                  placeholder="CHQ / UPI Ref..."
                  value={chequeOrTxnNo}
                  onChange={(e) => setChequeOrTxnNo(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-mono"
                />
              </div>
            </div>

            {/* Remarks / Custom Split Settlement Note */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                प्रशासकीय टिप्पणी / समझौता नोट (Payment Remarks / Deferred Settlement):
              </label>
              <input
                type="text"
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                placeholder="उदा. ग्राहक ने ₹2000 मूलधन दिया, ₹583 ब्याज 10 तारीख को देगा / पेनल्टी पूर्ण छूट"
                className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white text-xs font-sans"
              />
            </div>

            {/* Grand Total Summary Box */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-md">
              <div>
                <span className="text-slate-400 text-xs block">
                  {isLumpSumMode ? 'जमा की जा रही एकमुश्त राशि:' : 'कुल जमा प्राप्त राशि:'}
                </span>
                <span className="text-[11px] text-slate-300">
                  {isLumpSumMode
                    ? 'अनुक्रमिक किश्तों में स्वतः समायोजित होगी'
                    : `कुल ${selectedEmiNos.length} किश्तें [${selectedEmiNos.map((n) => `#${n}`).join(', ') || 'कोई नहीं'}] एक साथ जमा होंगी`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {formatINR(isLumpSumMode ? lumpSumAmount : grandTotal)}
                </span>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={!isLumpSumMode && selectedEmiNos.length === 0}
                className={`px-6 py-2.5 rounded-xl text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  !isLumpSumMode && selectedEmiNos.length === 0
                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>चयनित किश्तें जमा करें एवं बही अपडेट करें</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
