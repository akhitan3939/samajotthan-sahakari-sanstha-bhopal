import React, { useState } from 'react';
import { LoanRecord } from '../types';
import {
  calculateComprehensiveStats,
  calculateInstallmentTotals,
  classifyBorrower,
  evaluateDefaulterStatus,
  exportToCSV,
  formatINR,
} from '../utils/loanCalculations';
import { SocietyEmblem } from './SocietyEmblem';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  AlertTriangle,
  Building,
  Coins,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminReportsHubProps {
  loans: LoanRecord[];
  onOpenLedger: (loan: LoanRecord) => void;
  onOpenNotice: (loan: LoanRecord) => void;
}

type ReportType = 'MONTHLY_RECOVERY' | 'DEFAULTER_AGEING' | 'PRE_EMI_AUDIT' | 'SLAB_BALANCE_SHEET';

export const AdminReportsHub: React.FC<AdminReportsHubProps> = ({
  loans,
  onOpenLedger,
  onOpenNotice,
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('MONTHLY_RECOVERY');
  const [dateFilter, setDateFilter] = useState('ALL');

  const stats = calculateComprehensiveStats(loans);

  // 1. MONTHLY RECOVERY DATA (Aggregate installments across all loans)
  const allInstallments = loans.flatMap((l) =>
    l.installments.map((inst) => ({
      ...inst,
      borrowerName: l.borrowerName,
      membershipNo: l.membershipNo,
      accountNo: l.accountNo,
      loanId: l.id,
    }))
  );

  // 2. CSV EXPORT DISPATCHER
  const handleExportCSV = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (activeReport === 'MONTHLY_RECOVERY') {
      const headers = [
        'सदस्यता',
        'ऋणी नाम',
        'किस्त #',
        'देय तिथि',
        'देय मूलधन',
        'देय ब्याज',
        'कुल देय',
        'जमा दिनांक',
        'विलंब दिन',
        'माध्यम',
        'कुल जमा',
        'वसूल मूलधन',
        'वसूल ब्याज',
        'वसूल पेनल्टी',
        'स्थिति',
      ];
      const rows = allInstallments.map((i) => [
        i.membershipNo,
        i.borrowerName,
        i.emiNo,
        i.dueDate,
        i.duePrincipal,
        i.dueInterest,
        i.totalDue,
        i.depositDate || '—',
        i.delayDays,
        i.paymentMode || '—',
        i.totalPaid,
        i.paidPrincipal,
        i.paidInterest,
        i.penaltyCollected,
        i.status,
      ]);
      exportToCSV(`samajotthan-monthly-recovery-${todayStr}.csv`, [headers, ...rows]);
    } else if (activeReport === 'DEFAULTER_AGEING') {
      const headers = [
        'सदस्यता',
        'ऋणी का नाम',
        'मोबाइल',
        'स्वीकृत ऋण',
        'वर्तमान शेष मूलधन',
        'लगातार मिस किश्तें',
        'जमानतदार 1 (चेक सहित)',
        'जमानतदार 2 (चेक सहित)',
        'पेनल्टी देयता (₹2.6/D)',
      ];
      const defaulters = loans.filter((l) => classifyBorrower(l) === 'DEFAULTER');
      const rows = defaulters.map((l) => {
        const dInfo = evaluateDefaulterStatus(l.installments);
        const tot = calculateInstallmentTotals(l.installments);
        const rem = Math.max(0, l.loanAmount - tot.totalPaidPrincipal);
        return [
          l.membershipNo,
          l.borrowerName,
          l.phone,
          l.loanAmount,
          rem,
          dInfo.consecutiveMissedCount,
          `${l.guarantor1?.name || ''} (चेक: ${l.guarantor1?.chequeNo || '—'})`,
          `${l.guarantor2?.name || ''} (चेक: ${l.guarantor2?.chequeNo || '—'})`,
          tot.totalPenaltyCalculated - tot.totalPenaltyCollected,
        ];
      });
      exportToCSV(`samajotthan-defaulter-ageing-${todayStr}.csv`, [headers, ...rows]);
    } else if (activeReport === 'PRE_EMI_AUDIT') {
      const headers = [
        'सदस्यता',
        'ऋणी का नाम',
        'ऋण तिथि',
        'स्वीकृत ऋण राशि',
        'प्री-ईएमआई कटौती',
        'प्रोसेसिंग शुल्क (₹500)',
        'भवन निधि (₹300)',
        'कुल अग्रिम कटौती',
        'निवल चेक वितरण',
        'अग्रिम चेक क्र.',
      ];
      const rows = loans.map((l) => {
        const pre = l.preEmiDeductions?.preEmiAmount || 0;
        const proc = l.preEmiDeductions?.processingFee || 500;
        const bld = l.preEmiDeductions?.buildingFund || 300;
        const totalDed = pre + proc + bld;
        const net = l.preEmiDeductions?.netDisbursed || l.loanAmount - totalDed;
        return [
          l.membershipNo,
          l.borrowerName,
          l.loanDate,
          l.loanAmount,
          pre,
          proc,
          bld,
          totalDed,
          net,
          l.advanceChequeNo || '—',
        ];
      });
      exportToCSV(`samajotthan-pre-emi-audit-${todayStr}.csv`, [headers, ...rows]);
    } else {
      // Slab Balance Sheet
      const headers = [
        'ऋण स्लैब',
        'अवधि',
        'कुल स्वीकृत खाते',
        'कुल वितरित पूंजी',
        'वसूल मूलधन',
        'शेष मूलधन',
        'वसूली प्रतिशत',
      ];
      const slabs = [50000, 100000, 150000, 200000, 300000, 350000, 400000];
      const rows = slabs.map((amt) => {
        const match = loans.filter((l) => l.loanAmount === amt);
        const disbursed = amt * match.length;
        const paidP = match.reduce(
          (a, b) => a + calculateInstallmentTotals(b.installments).totalPaidPrincipal,
          0
        );
        const rem = Math.max(0, disbursed - paidP);
        const pct = disbursed > 0 ? Math.round((paidP / disbursed) * 100) : 0;
        return [
          `₹ ${amt.toLocaleString('en-IN')}`,
          amt >= 350000 ? '36 माह' : '24 माह',
          match.length,
          disbursed,
          paidP,
          rem,
          `${pct}%`,
        ];
      });
      exportToCSV(`samajotthan-slab-balance-sheet-${todayStr}.csv`, [headers, ...rows]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Report Tabs Selector */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveReport('MONTHLY_RECOVERY')}
          className={`flex-1 min-w-[200px] p-3 rounded-xl text-left transition-all cursor-pointer ${
            activeReport === 'MONTHLY_RECOVERY'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeReport === 'MONTHLY_RECOVERY' ? 'bg-amber-400' : 'bg-slate-400'
              }`}
            />
            <span className="font-bold text-xs">1. मासिक वसूली रजिस्टर</span>
          </div>
          <p
            className={`text-[11px] mt-1 ${
              activeReport === 'MONTHLY_RECOVERY' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            माह-वार किश्त देय, जमा, ब्याज व पेनल्टी बही
          </p>
        </button>

        <button
          onClick={() => setActiveReport('DEFAULTER_AGEING')}
          className={`flex-1 min-w-[200px] p-3 rounded-xl text-left transition-all cursor-pointer ${
            activeReport === 'DEFAULTER_AGEING'
              ? 'bg-rose-900 text-white shadow-sm'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeReport === 'DEFAULTER_AGEING' ? 'bg-amber-400' : 'bg-rose-500'
              }`}
            />
            <span className="font-bold text-xs">2. डिफ़ॉल्टर आयु-वार बही</span>
          </div>
          <p
            className={`text-[11px] mt-1 ${
              activeReport === 'DEFAULTER_AGEING' ? 'text-rose-200' : 'text-slate-500'
            }`}
          >
            3+ मिस किश्तें, जमानतदार चेक व मांग पत्र
          </p>
        </button>

        <button
          onClick={() => setActiveReport('PRE_EMI_AUDIT')}
          className={`flex-1 min-w-[200px] p-3 rounded-xl text-left transition-all cursor-pointer ${
            activeReport === 'PRE_EMI_AUDIT'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeReport === 'PRE_EMI_AUDIT' ? 'bg-amber-400' : 'bg-slate-400'
              }`}
            />
            <span className="font-bold text-xs">3. अग्रिम कटौती व कोष ऑडिट</span>
          </div>
          <p
            className={`text-[11px] mt-1 ${
              activeReport === 'PRE_EMI_AUDIT' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            प्री-ईएमआई, ₹500 प्रोसेसिंग व ₹300 भवन निधि
          </p>
        </button>

        <button
          onClick={() => setActiveReport('SLAB_BALANCE_SHEET')}
          className={`flex-1 min-w-[200px] p-3 rounded-xl text-left transition-all cursor-pointer ${
            activeReport === 'SLAB_BALANCE_SHEET'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeReport === 'SLAB_BALANCE_SHEET' ? 'bg-amber-400' : 'bg-slate-400'
              }`}
            />
            <span className="font-bold text-xs">4. स्लैब-वार बैलेंस शीट</span>
          </div>
          <p
            className={`text-[11px] mt-1 ${
              activeReport === 'SLAB_BALANCE_SHEET' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            50K से 4L स्लैब में पूंजी निवेश व वसूली दर
          </p>
        </button>
      </div>

      {/* REPORT CONTENT WRAPPER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        {/* Top Control Bar of Active Report */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <SocietyEmblem size="sm" showText={false} />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activeReport === 'MONTHLY_RECOVERY' && 'मासिक ऋण किश्त वसूली एवं ब्याज रजिस्टर'}
                {activeReport === 'DEFAULTER_AGEING' && 'डिफ़ॉल्टर खाता आयु-वार एवं जमानतदार देयता रजिस्टर'}
                {activeReport === 'PRE_EMI_AUDIT' && 'ऋण वितरण समय अग्रिम कटौती एवं संस्था कोष ऑडिट'}
                {activeReport === 'SLAB_BALANCE_SHEET' && 'ऋण स्लैबवार पूंजी आवंटन एवं वसूली बैलेंस शीट'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल • अधिकृत वित्तीय विवरण
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>एक्सेल/CSV डाउनलोड</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट रिपोर्ट</span>
            </button>
          </div>
        </div>

        {/* REPORT 1: MONTHLY RECOVERY TABLE */}
        {activeReport === 'MONTHLY_RECOVERY' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#b30000] text-white font-bold text-center text-[11px]">
                  <tr>
                    <th className="p-2.5 border border-red-800">सदस्यता</th>
                    <th className="p-2.5 border border-red-800">ऋणी नाम</th>
                    <th className="p-2.5 border border-red-800">किस्त #</th>
                    <th className="p-2.5 border border-red-800">देय तिथि</th>
                    <th className="p-2.5 border border-red-800">देय मूलधन</th>
                    <th className="p-2.5 border border-red-800">देय ब्याज (14%)</th>
                    <th className="p-2.5 border border-red-800">कुल देय</th>
                    <th className="p-2.5 bg-[#0070ba] border border-blue-700">जमा दिनांक</th>
                    <th className="p-2.5 bg-[#0070ba] border border-blue-700">विलंब दिन</th>
                    <th className="p-2.5 bg-[#0070ba] border border-blue-700">माध्यम</th>
                    <th className="p-2.5 bg-[#0070ba] border border-blue-700 text-right">कुल जमा राशि</th>
                    <th className="p-2.5 bg-[#008a28] border border-emerald-700 text-right">वसूल ब्याज</th>
                    <th className="p-2.5 bg-[#008a28] border border-emerald-700 text-right">वसूल पेनल्टी</th>
                    <th className="p-2.5 bg-slate-800 border border-slate-700 text-center">लेजर</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {allInstallments.slice(0, 15).map((inst, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50 ${
                        inst.status === 'PAID'
                          ? 'bg-emerald-50/20'
                          : inst.status === 'DELAYED_PAID'
                          ? 'bg-amber-50/30'
                          : inst.delayDays > 0
                          ? 'bg-rose-50/30'
                          : ''
                      }`}
                    >
                      <td className="p-2.5 text-center font-bold">#{inst.membershipNo}</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-900">{inst.borrowerName}</td>
                      <td className="p-2.5 text-center">#{inst.emiNo}</td>
                      <td className="p-2.5 text-center">{inst.dueDate}</td>
                      <td className="p-2.5 text-right font-medium">₹ {inst.duePrincipal.toFixed(2)}</td>
                      <td className="p-2.5 text-right text-amber-800">₹ {inst.dueInterest.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">₹ {inst.totalDue.toFixed(2)}</td>
                      <td className="p-2.5 text-center">{inst.depositDate || '—'}</td>
                      <td className="p-2.5 text-center">
                        {inst.delayDays > 0 ? (
                          <span className="font-bold text-rose-700">{inst.delayDays} दिन</span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="p-2.5 text-center font-sans">{inst.paymentMode || '—'}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-800">
                        {inst.totalPaid > 0 ? `₹ ${inst.totalPaid.toFixed(2)}` : '₹ 0.00'}
                      </td>
                      <td className="p-2.5 text-right font-medium text-amber-900">
                        {inst.paidInterest > 0 ? `₹ ${inst.paidInterest.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-2.5 text-right text-emerald-700 font-bold">
                        {inst.penaltyCollected > 0 ? `₹ ${inst.penaltyCollected.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-2.5 text-center font-sans">
                        <button
                          onClick={() => {
                            const l = loans.find((x) => x.id === inst.loanId);
                            if (l) onOpenLedger(l);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px]"
                        >
                          देखें
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* MANDATORY FOOTER TOTAL */}
                <tfoot className="bg-slate-900 text-white font-mono font-bold text-[11px]">
                  <tr>
                    <td colSpan={4} className="p-3 text-center font-sans">
                      कुल योग (समस्त किश्तें)
                    </td>
                    <td className="p-3 text-right">
                      {formatINR(allInstallments.reduce((a, b) => a + b.duePrincipal, 0))}
                    </td>
                    <td className="p-3 text-right text-amber-300">
                      {formatINR(allInstallments.reduce((a, b) => a + b.dueInterest, 0))}
                    </td>
                    <td className="p-3 text-right text-amber-300">
                      {formatINR(allInstallments.reduce((a, b) => a + b.totalDue, 0))}
                    </td>
                    <td colSpan={3} className="p-3 text-center font-sans">
                      —
                    </td>
                    <td className="p-3 text-right text-emerald-400">
                      {formatINR(allInstallments.reduce((a, b) => a + b.totalPaid, 0))}
                    </td>
                    <td className="p-3 text-right text-amber-300">
                      {formatINR(allInstallments.reduce((a, b) => a + b.paidInterest, 0))}
                    </td>
                    <td className="p-3 text-right text-emerald-400">
                      {formatINR(allInstallments.reduce((a, b) => a + b.penaltyCollected, 0))}
                    </td>
                    <td className="p-3 text-center font-sans">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: DEFAULTER AGEING ANALYSIS */}
        {activeReport === 'DEFAULTER_AGEING' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-950 font-bold block">
                  3 या अधिक लगातार किश्तें मिस होने वाले डिफ़ॉल्टर खाते:
                </strong>
                <p className="text-rose-800 mt-0.5">
                  इन सभी ऋणियों के दोनों जमानतदारों से वसूली मांग सूचना पत्र जारी करने हेतु विवरण नीचे संलग्न है।
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-rose-900 text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-3">सदस्यता</th>
                    <th className="p-3">ऋणी का नाम</th>
                    <th className="p-3">ऋण राशि</th>
                    <th className="p-3">मिस किश्तें</th>
                    <th className="p-3">जमानतदार 1 व चेक</th>
                    <th className="p-3">जमानतदार 2 व चेक</th>
                    <th className="p-3 text-right">शेष मूलधन</th>
                    <th className="p-3 text-right">पेनल्टी (@ ₹2.6/D)</th>
                    <th className="p-3 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {loans
                    .filter((l) => classifyBorrower(l) === 'DEFAULTER')
                    .map((loan) => {
                      const dInfo = evaluateDefaulterStatus(loan.installments);
                      const tot = calculateInstallmentTotals(loan.installments);
                      const rem = Math.max(0, loan.loanAmount - tot.totalPaidPrincipal);

                      return (
                        <tr key={loan.id} className="hover:bg-rose-50/50">
                          <td className="p-3 font-bold">#{loan.membershipNo}</td>
                          <td className="p-3 font-sans font-bold text-slate-900">{loan.borrowerName}</td>
                          <td className="p-3 font-bold">{formatINR(loan.loanAmount)}</td>
                          <td className="p-3 text-rose-700 font-bold">
                            {dInfo.consecutiveMissedCount} किश्तें मिस
                          </td>
                          <td className="p-3 font-sans text-[11px]">
                            <strong>{loan.guarantor1?.name}</strong>
                            <div className="text-[10px] text-slate-500 font-mono">
                              चेक: {loan.guarantor1?.chequeNo || '—'}
                            </div>
                          </td>
                          <td className="p-3 font-sans text-[11px]">
                            <strong>{loan.guarantor2?.name}</strong>
                            <div className="text-[10px] text-slate-500 font-mono">
                              चेक: {loan.guarantor2?.chequeNo || '—'}
                            </div>
                          </td>
                          <td className="p-3 text-right font-bold text-rose-700">{formatINR(rem)}</td>
                          <td className="p-3 text-right text-rose-800 font-bold">
                            {formatINR(tot.totalPenaltyCalculated - tot.totalPenaltyCollected)}
                          </td>
                          <td className="p-3 text-center font-sans">
                            <button
                              onClick={() => onOpenNotice(loan)}
                              className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px]"
                            >
                              नोटिस प्रिंट
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 3: PRE-EMI & SOCIETY FUNDS AUDIT */}
        {activeReport === 'PRE_EMI_AUDIT' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-3">सदस्यता</th>
                    <th className="p-3">ऋणी का नाम</th>
                    <th className="p-3">ऋण तिथि</th>
                    <th className="p-3 text-right">स्वीकृत ऋण</th>
                    <th className="p-3 text-right">प्री-ईएमआई कटौती</th>
                    <th className="p-3 text-right">प्रोसेसिंग फीस (₹500)</th>
                    <th className="p-3 text-right">भवन निधि (₹300)</th>
                    <th className="p-3 text-right text-emerald-400">निवल चेक वितरण</th>
                    <th className="p-3 text-center">अग्रिम चेक क्र.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {loans.map((loan) => {
                    const pre = loan.preEmiDeductions?.preEmiAmount || 0;
                    const proc = loan.preEmiDeductions?.processingFee || 500;
                    const bld = loan.preEmiDeductions?.buildingFund || 300;
                    const totalDed = pre + proc + bld;
                    const net = loan.preEmiDeductions?.netDisbursed || loan.loanAmount - totalDed;

                    return (
                      <tr key={loan.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold">#{loan.membershipNo}</td>
                        <td className="p-3 font-sans font-bold text-slate-900">{loan.borrowerName}</td>
                        <td className="p-3 text-slate-600">{loan.loanDate}</td>
                        <td className="p-3 text-right font-bold">{formatINR(loan.loanAmount)}</td>
                        <td className="p-3 text-right text-blue-800">{formatINR(pre)}</td>
                        <td className="p-3 text-right text-amber-800">{formatINR(proc)}</td>
                        <td className="p-3 text-right text-emerald-800">{formatINR(bld)}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">{formatINR(net)}</td>
                        <td className="p-3 text-center font-mono">{loan.advanceChequeNo || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="bg-slate-900 text-white font-mono font-bold text-[11px]">
                  <tr>
                    <td colSpan={3} className="p-3 text-center font-sans">
                      कुल योग (समस्त ऋण खाते)
                    </td>
                    <td className="p-3 text-right">
                      {formatINR(loans.reduce((a, b) => a + b.loanAmount, 0))}
                    </td>
                    <td className="p-3 text-right text-blue-300">
                      {formatINR(loans.reduce((a, b) => a + (b.preEmiDeductions?.preEmiAmount || 0), 0))}
                    </td>
                    <td className="p-3 text-right text-amber-300">
                      {formatINR(
                        loans.reduce((a, b) => a + (b.preEmiDeductions?.processingFee || 500), 0)
                      )}
                    </td>
                    <td className="p-3 text-right text-emerald-300">
                      {formatINR(
                        loans.reduce((a, b) => a + (b.preEmiDeductions?.buildingFund || 300), 0)
                      )}
                    </td>
                    <td className="p-3 text-right text-emerald-400">
                      {formatINR(
                        loans.reduce((a, b) => a + (b.preEmiDeductions?.netDisbursed || 0), 0)
                      )}
                    </td>
                    <td className="p-3 text-center font-sans">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 4: SLAB-WISE BALANCE SHEET */}
        {activeReport === 'SLAB_BALANCE_SHEET' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-3">ऋण स्लैब श्रेणी</th>
                    <th className="p-3">निर्धारित अवधि</th>
                    <th className="p-3 text-center">सक्रिय खाते</th>
                    <th className="p-3 text-right">कुल स्वीकृत पूंजी</th>
                    <th className="p-3 text-right">वसूल मूलधन</th>
                    <th className="p-3 text-right">शेष मूलधन</th>
                    <th className="p-3 text-center">वसूली प्रतिशत</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {[50000, 100000, 150000, 200000, 350000, 400000].map((amt) => {
                    const match = loans.filter((l) => l.loanAmount === amt);
                    const totalDisbursed = amt * match.length;
                    const paidP = match.reduce(
                      (a, b) => a + calculateInstallmentTotals(b.installments).totalPaidPrincipal,
                      0
                    );
                    const rem = Math.max(0, totalDisbursed - paidP);
                    const pct = totalDisbursed > 0 ? Math.round((paidP / totalDisbursed) * 100) : 0;

                    return (
                      <tr key={amt} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 font-sans">
                          {formatINR(amt)} स्लैब
                        </td>
                        <td className="p-3 font-sans text-slate-600">
                          {amt >= 350000 ? '36 माह (3 वर्ष)' : '24 माह (2 वर्ष)'}
                        </td>
                        <td className="p-3 text-center font-bold text-amber-700">{match.length} खाते</td>
                        <td className="p-3 text-right font-bold">{formatINR(totalDisbursed)}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">{formatINR(paidP)}</td>
                        <td className="p-3 text-right font-bold text-amber-700">{formatINR(rem)}</td>
                        <td className="p-3 text-center font-bold font-sans">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                            {pct}% वसूल
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
