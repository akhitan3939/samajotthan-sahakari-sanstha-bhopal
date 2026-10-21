import React, { useState, useEffect, useMemo } from 'react';
import { useSociety, SingleEmiPayment } from '../context/SocietyContext';
import { EmiInstallment, LoanRecord } from '../types';
import {
  calculateDelayDays,
  calculatePenalty,
  formatDateToDisplay,
  formatINR,
} from '../utils/loanCalculations';
import {
  X,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Layers,
  Sparkles,
  Coins
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
  const { recordMultiPayment, recordLumpSumPayment } = useSociety();

  const [paymentMode, setPaymentMode] = useState('नकद (Cash)');
  const [depositDate, setDepositDate] = useState(() => formatDateToDisplay(new Date()));
  const [chequeOrTxnNo, setChequeOrTxnNo] = useState('');

  // Unpaid installments
  const unpaidInstallments = useMemo(() => {
    return loan.installments.filter(
      (i) => i.status !== 'PAID' && i.status !== 'DELAYED_PAID' && i.totalPaid < i.totalDue
    );
  }, [loan.installments]);

  // Selected EMI numbers (default to initialEmiNo or first unpaid)
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

  // Toggle selection
  const toggleEmiSelection = (emiNo: number) => {
    if (selectedEmiNos.includes(emiNo)) {
      if (selectedEmiNos.length > 1) {
        setSelectedEmiNos(selectedEmiNos.filter((n) => n !== emiNo));
      }
    } else {
      setSelectedEmiNos([...selectedEmiNos, emiNo].sort((a, b) => a - b));
    }
  };

  // Quick Select N installments
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
        // Customer pays only Principal, interest deferred
        newPOverrides[emiNo] = inst.duePrincipal;
        newIOverrides[emiNo] = 0;
        newPenOverrides[emiNo] = 0;
        setPaymentRemarks('केवल मूलधन जमा, शेष ब्याज बाद में देय होगा');
      } else if (preset === 'INTEREST_ONLY') {
        // Customer pays only Interest, principal deferred
        newPOverrides[emiNo] = 0;
        newIOverrides[emiNo] = inst.dueInterest;
        newPenOverrides[emiNo] = 0;
        setPaymentRemarks('केवल ब्याज जमा, मूलधन देयता यथावत');
      } else if (preset === 'WAIVE_PENALTY') {
        // Full EMI without penalty
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg text-slate-950 font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>किश्त भुगतान प्रविष्टि (Multi-EMI Payment)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  {selectedEmiNos.length} किश्त चयनित
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ऋणी: <strong className="text-amber-300">{loan.borrowerName}</strong> • सदस्यता: #{loan.membershipNo}
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Payment Mode Selector: Custom Installments vs One-shot Lump sum */}
          <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
            <span className="font-bold text-slate-800">भुगतान का स्वरूप:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLumpSumMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isLumpSumMode
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                चयनित किश्तें जमा करें ({selectedEmiNos.length})
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
          </div>

          {/* LUMP SUM MODE */}
          {isLumpSumMode ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>सदस्य द्वारा दी गई एकमुश्त राशि दर्ज करें:</span>
              </div>
              <p className="text-[11px] text-slate-600">
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
                  className="w-full p-2.5 border-2 border-emerald-500 rounded-lg text-base font-bold font-mono bg-white"
                />
              </div>
            </div>
          ) : (
            /* MULTI-INSTALLMENT SELECTION MODE */
            <div className="space-y-3">
              {/* Quick Preset Buttons: 1 EMI, 2 EMIs, 3 EMIs */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">
                  कितनी किश्तें एक साथ जमा करनी हैं?
                </span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleSelectCount(count)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                        selectedEmiNos.length === count
                          ? 'bg-amber-500 text-slate-950 border-amber-600'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      {count} किश्त
                    </button>
                  ))}
                </div>
              </div>

              {/* Installment Pills / Checkbox list */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border rounded-lg bg-slate-50">
                {unpaidInstallments.map((inst) => {
                  const isChecked = selectedEmiNos.includes(inst.emiNo);
                  return (
                    <button
                      key={inst.emiNo}
                      type="button"
                      onClick={() => toggleEmiSelection(inst.emiNo)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300/60 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-mono">
                          #{inst.emiNo}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-emerald-600"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{inst.dueDate}</div>
                      <div className="font-bold text-emerald-800 font-mono text-[11px] mt-0.5">
                        ₹ {inst.totalDue.toFixed(2)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* PRESETS FOR REAL-WORLD LOAN REPAYMENT CASES (Muldhan de diya byaj baad me, or byaj diya penalty nahi di) */}
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
                    title="ग्राहक ने मूलधन दे दिया, ब्याज बाद में देंगे"
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
                    title="ग्राहक ने केवल ब्याज दिया, मूलधन नहीं दिया"
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
                    title="ग्राहक पेनल्टी नहीं दे रहा / पेनल्टी 100% माफ़"
                  >
                    4. पेनल्टी 100% माफ़
                  </button>
                </div>
              </div>

              {/* Breakdown Table for Selected EMIs */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-slate-800 text-white font-bold text-center">
                    <tr>
                      <th className="p-2 border border-slate-700 whitespace-nowrap">किस्त #</th>
                      <th className="p-2 border border-slate-700 whitespace-nowrap">जमा मूलधन (₹)</th>
                      <th className="p-2 border border-slate-700 whitespace-nowrap">जमा ब्याज (14%)</th>
                      <th className="p-2 border border-slate-700 whitespace-nowrap">विलंब दिन</th>
                      <th className="p-2 border border-slate-700 whitespace-nowrap">ली गई पेनल्टी</th>
                      <th className="p-2 border border-slate-700 whitespace-nowrap">पेनल्टी छूट</th>
                      <th className="p-2 border border-slate-700 whitespace-nowrap">बकाया ब्याज</th>
                      <th className="p-2 border border-slate-700 text-right whitespace-nowrap">कुल जमा</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {calculatedItems.map((item) => (
                      <tr key={item.emiNo} className="hover:bg-slate-50">
                        <td className="p-2 text-center font-bold font-sans">
                          #{item.emiNo}
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="1"
                            value={item.paidPrincipal}
                            onChange={(e) => {
                              setSplitPreset('CUSTOM');
                              setPrincipalOverrides({
                                ...principalOverrides,
                                [item.emiNo]: Math.max(0, Number(e.target.value)),
                              });
                            }}
                            className="w-18 text-right p-1 border rounded bg-white font-mono font-bold text-slate-900"
                            title="जमा मूलधन बदलें"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="1"
                            value={item.paidInterest}
                            onChange={(e) => {
                              setSplitPreset('CUSTOM');
                              setInterestOverrides({
                                ...interestOverrides,
                                [item.emiNo]: Math.max(0, Number(e.target.value)),
                              });
                            }}
                            className="w-16 text-right p-1 border rounded bg-white font-mono font-bold text-amber-800"
                            title="जमा ब्याज बदलें (शून्य करने पर बाद में देय होगा)"
                          />
                        </td>
                        <td className="p-2 text-center text-rose-700 font-sans">
                          {item.delayDays > 0 ? `${item.delayDays}D` : '0'}
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="1"
                            value={item.penaltyCollected}
                            onChange={(e) => {
                              setSplitPreset('CUSTOM');
                              setPenaltyOverrides({
                                ...penaltyOverrides,
                                [item.emiNo]: Math.max(0, Number(e.target.value)),
                              });
                            }}
                            className="w-14 text-right p-1 border rounded bg-white font-mono text-rose-700 font-bold"
                            title="ली जाने वाली पेनल्टी"
                          />
                        </td>
                        <td className="p-2 text-center font-mono text-emerald-700">
                          {item.penaltyWaived > 0 ? `₹${Math.round(item.penaltyWaived)}` : '—'}
                        </td>
                        <td className="p-2 text-center font-mono text-amber-700 font-bold">
                          {item.pendingInterest > 0 ? `₹${Math.round(item.pendingInterest)}` : '—'}
                        </td>
                        <td className="p-2 text-right font-bold text-emerald-800">
                          ₹ {Math.round(item.itemTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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

          {/* Common Payment Details: Date, Mode, Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
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

          {/* Grand Total Summary Box */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs block">
                {isLumpSumMode ? 'जमा की जा रही एकमुश्त राशि:' : 'कुल जमा प्राप्त राशि:'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isLumpSumMode
                  ? 'अनुक्रमिक किश्तों में स्वतः समायोजित होगी'
                  : `कुल ${selectedEmiNos.length} किश्तें एक साथ निपटाई जाएंगी`}
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md cursor-pointer"
            >
              भुगतान दर्ज करें एवं बही अपडेट करें
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
