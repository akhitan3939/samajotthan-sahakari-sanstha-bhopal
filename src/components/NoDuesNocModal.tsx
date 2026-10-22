import React, { useState, useRef, useMemo } from 'react';
import { LoanRecord, SocietyInfo } from '../types';
import { SocietyEmblem } from './SocietyEmblem';
import { calculateInstallmentTotals, formatINR } from '../utils/loanCalculations';
import { useSociety } from '../context/SocietyContext';
import {
  FileCheck,
  FileText,
  Printer,
  Copy,
  Check,
  X,
  HelpCircle,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  Award,
  Stamp,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface NoDuesNocModalProps {
  loans?: LoanRecord[];
  initialLoan?: LoanRecord | null;
  societyInfo?: SocietyInfo;
  onClose: () => void;
  onOpenPaymentEntry?: (loan: LoanRecord) => void;
}

export const NoDuesNocModal: React.FC<NoDuesNocModalProps> = ({
  loans: propLoans,
  initialLoan,
  societyInfo: propSocietyInfo,
  onClose,
  onOpenPaymentEntry,
}) => {
  const context = useSociety();
  const loans = propLoans || context.loans;
  const societyInfo = propSocietyInfo || context.societyInfo;
  const boardMembers = context.boardMembers || [];

  // Designated President from Live Data
  const defaultPresident = useMemo(() => {
    return (
      boardMembers.find((m) => m.role === 'ADHYAKSHA' || m.designationHindi?.includes('अध्यक्ष')) ||
      boardMembers[0] || {
        name: 'श्री राजेश शर्मा',
        designationHindi: 'संस्था अध्यक्ष',
        role: 'ADHYAKSHA',
      }
    );
  }, [boardMembers]);

  // Designated Manager from Live Data
  const defaultManager = useMemo(() => {
    return (
      boardMembers.find((m) => m.role === 'PRABANDHAK' || m.designationHindi?.includes('प्रबंधक')) ||
      boardMembers.find((m) => m.role === 'UPADHYAKSHA') ||
      boardMembers[boardMembers.length - 1] || {
        name: 'श्रीमति तन्‍मयी कोरसने',
        designationHindi: 'शाखा प्रबंधक',
        role: 'PRABANDHAK',
      }
    );
  }, [boardMembers]);

  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    initialLoan ? initialLoan.id : loans[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'NO_DUES' | 'NOC' | 'EXPLAINER'>('NO_DUES');
  
  // NOC Specific Form Fields
  const [nocPurpose, setNocPurpose] = useState<string>(
    'अन्य बैंक / वित्तीय संस्था से नवीन ऋण प्राप्त करने हेतु'
  );
  const [customNocPurpose, setCustomNocPurpose] = useState<string>('');
  const [targetBank, setTargetBank] = useState<string>('सर्वसंबंधित / शाखा प्रबंधक, भारतीय स्टेट बैंक');
  const [refNumber, setRefNumber] = useState<string>(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `साईं/प्रमाण-पत्र/${year}/${randomNum}`;
  });
  const [issueDate, setIssueDate] = useState<string>(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [customRemarks, setCustomRemarks] = useState<string>(
    'संस्था के अभिलेखानुसार सदस्य का लेन-देन संतोषजनक रहा है।'
  );
  const [allowOverride, setAllowOverride] = useState(false);
  const [copied, setCopied] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const selectedLoan = loans.find((l) => l.id === selectedLoanId) || loans[0];

  // Calculations for this loan
  const totals = selectedLoan
    ? calculateInstallmentTotals(selectedLoan.installments)
    : { totalPaidPrincipal: 0, totalPaidInterest: 0, totalPaidPenalty: 0, totalPaidAmount: 0 };

  const remainingPrincipal = selectedLoan
    ? Math.max(0, selectedLoan.loanAmount - totals.totalPaidPrincipal)
    : 0;

  const isFullyPaid = remainingPrincipal <= 0.01;

  const handlePrint = () => {
    document.body.classList.add('is-printing-modal');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('is-printing-modal');
    }, 800);
  };

  const handleCopyText = () => {
    if (!selectedLoan) return;

    let text = '';
    if (activeTab === 'NO_DUES') {
      text = `
============================================================
${societyInfo.name}
पंजीयन क्रमांक: ${societyInfo.regNo}
पता: ${societyInfo.address}
दूरभाष: ${societyInfo.phone}
------------------------------------------------------------
अदेयता प्रमाण पत्र (NO DUES CERTIFICATE)
क्रमांक: ${refNumber}                          दिनांक: ${issueDate}
------------------------------------------------------------
प्रमाणित किया जाता है कि संस्था के सम्मानित सदस्य:
ऋणी का नाम: ${selectedLoan.borrowerName}
पिता/पति का नाम: ${selectedLoan.fatherOrHusbandName || '—'}
सदस्यता क्रमांक: ${selectedLoan.membershipNo}
ऋण खाता क्रमांक: ${selectedLoan.accountNo}
निवासी: ${selectedLoan.address}

को संस्था द्वारा दिनांक ${selectedLoan.loanDate} को स्वीकृत ऋण राशि ${formatINR(
        selectedLoan.loanAmount
      )} (14% वार्षिक घटती ब्याज दर पर) प्रदान की गई थी।

उक्त सदस्य द्वारा ऋण का समस्त मूलधन ${formatINR(
        totals.totalPaidPrincipal
      )} एवं समस्त ब्याज ${formatINR(
        totals.totalPaidInterest
      )} पूर्ण रूप से संस्था में जमा कर दिया गया है। 
आज दिनांक ${issueDate} तक संस्था का उक्त ऋण खाते में कोई भी बकाया (Due) शेष नहीं है।

अतः यह अदेयता प्रमाण पत्र (No Dues Certificate) जारी किया जाता है।

(हस्ताक्षर ${defaultManager.designationHindi || 'शाखा प्रबंधक'})                 (हस्ताक्षर ${defaultPresident.designationHindi || 'अध्यक्ष'})
${defaultManager.name}                   ${defaultPresident.name}
${societyInfo.name}
============================================================
`;
    } else {
      text = `
============================================================
${societyInfo.name}
पंजीयन क्रमांक: ${societyInfo.regNo}
पता: ${societyInfo.address}
------------------------------------------------------------
अनापत्ति प्रमाण पत्र (NO OBJECTION CERTIFICATE - NOC)
क्रमांक: ${refNumber}                          दिनांक: ${issueDate}
प्रति: ${targetBank}
विषय: ${nocPurpose === 'OTHER' ? customNocPurpose : nocPurpose}
------------------------------------------------------------
महोदय,
प्रमाणित किया जाता है कि श्री/श्रीमती ${selectedLoan.borrowerName},
पिता/पति ${selectedLoan.fatherOrHusbandName || '—'},
निवासी: ${selectedLoan.address},
जो कि इस संस्था के पंजीकृत सदस्य (सदस्यता क्र. ${selectedLoan.membershipNo}, ऋण खाता क्र. ${
        selectedLoan.accountNo
      }) हैं।

उक्त सदस्य द्वारा संस्था से प्राप्त ऋण राशि ${formatINR(
        selectedLoan.loanAmount
      )} का पूर्ण भुगतान संस्था में कर दिया गया है। 

संस्था को उक्त सदस्य द्वारा ${
        nocPurpose === 'OTHER' ? customNocPurpose : nocPurpose
      } के संबंध में कोई आपत्ति नहीं है (No Objection)।

जमानत के रूप में जमा अग्रिम चेक क्रमांक ${
        selectedLoan.advanceChequeNo || '—'
      } विमुक्त किए जाते हैं।

(हस्ताक्षर ${defaultManager.designationHindi || 'शाखा प्रबंधक'})                 (हस्ताक्षर ${defaultPresident.designationHindi || 'अध्यक्ष'})
${defaultManager.name}                   ${defaultPresident.name}
${societyInfo.name}
============================================================
`;
    }

    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto printable-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto printable-modal-card">
        {/* Modal Top Header (Non-print) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                No Dues (अदेय प्रमाण पत्र) एवं NOC (अनापत्ति प्रमाण पत्र) जारी करें
              </h2>
              <p className="text-xs text-slate-300">
                ऋण पूर्ण चुकता होने पर आधिकारिक सहकारी संस्था लेटरहेड पर मुहर व हस्ताक्षरयुक्त प्रमाण पत्र
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Non-print) */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('NO_DUES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'NO_DUES'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-300" />
              <span>1. अदेयता प्रमाण पत्र (No Dues)</span>
            </button>

            <button
              onClick={() => setActiveTab('NOC')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'NOC'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>2. अनापत्ति प्रमाण पत्र (NOC)</span>
            </button>

            <button
              onClick={() => setActiveTab('EXPLAINER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'EXPLAINER'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>💡 दोनों में क्या अंतर है? (मार्गदर्शिका)</span>
            </button>
          </div>

          {/* Action Buttons */}
          {activeTab !== 'EXPLAINER' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="प्रमाण पत्र कॉपी करें"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">कॉपी हो गया!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>टेक्स्ट कॉपी करें</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>प्रमाण पत्र प्रिंट करें (A4)</span>
              </button>
            </div>
          )}
        </div>

        {/* Member Selector Strip (Non-print) */}
        {activeTab !== 'EXPLAINER' && (
          <div className="bg-slate-50 p-4 border-b border-slate-200 shrink-0 print:hidden space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Member Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>सदस्य / ऋणी का चयन करें (Member Dropdown):</span>
                  <span className="text-slate-500 font-normal">
                    कुल {loans.length} ऋण खाते उपलब्ध
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={selectedLoanId}
                    onChange={(e) => setSelectedLoanId(e.target.value)}
                    className="w-full p-2.5 pr-8 border border-slate-300 rounded-xl bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 appearance-none"
                  >
                    {loans.map((l) => {
                      const tot = calculateInstallmentTotals(l.installments);
                      const bal = Math.max(0, l.loanAmount - tot.totalPaidPrincipal);
                      const isZero = bal <= 0.01;
                      return (
                        <option key={l.id} value={l.id}>
                          {isZero ? '✅ [पूर्ण चुकता] ' : '⏳ [बकाया] '}
                          #{l.membershipNo} - {l.borrowerName} ({l.accountNo}) | ऋण: {formatINR(l.loanAmount)} | शेष: ₹{bal.toFixed(0)}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Reference & Date Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    प्रमाण पत्र क्रमांक:
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    जारी दिनांक:
                  </label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            {/* NOC Specific Fields */}
            {activeTab === 'NOC' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    अनापत्ति का उद्देश्य (Purpose of NOC):
                  </label>
                  <select
                    value={nocPurpose}
                    onChange={(e) => setNocPurpose(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                  >
                    <option value="अन्य बैंक / वित्तीय संस्था से नवीन ऋण प्राप्त करने हेतु">
                      1. अन्य बैंक/संस्था से नवीन ऋण प्राप्त करने हेतु (Loan from other Bank)
                    </option>
                    <option value="अग्रिम चेक (PDC) एवं बंधक दस्तावेज विमुक्त करने हेतु">
                      2. जमानत चेक व बंधक प्रतिभूति विमुक्त करने हेतु (Release of Cheques & Mortgage)
                    </option>
                    <option value="संपत्ति / वाहन पर से संस्था का प्रभार (Lien) हटाने हेतु">
                      3. संपत्ति / वाहन पर से संस्था का प्रभार (Lien) हटाने हेतु (Lien Removal)
                    </option>
                    <option value="संस्था की सदस्यता समाप्ति एवं अंशपूंजी विमुक्ति हेतु">
                      4. सदस्यता त्याग एवं अंशपूंजी विमुक्ति हेतु (Membership Resignation)
                    </option>
                    <option value="OTHER">5. अन्य विशेष उद्देश्य (लिखें...)</option>
                  </select>
                  {nocPurpose === 'OTHER' && (
                    <input
                      type="text"
                      placeholder="अन्य उद्देश्य यहाँ लिखें..."
                      value={customNocPurpose}
                      onChange={(e) => setCustomNocPurpose(e.target.value)}
                      className="w-full p-2 mt-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    प्रति / किसे प्रस्तुत करना है (Recipient / Target Bank):
                  </label>
                  <input
                    type="text"
                    value={targetBank}
                    onChange={(e) => setTargetBank(e.target.value)}
                    placeholder="उदा. शाखा प्रबंधक, भारतीय स्टेट बैंक / सर्वसंबंधित"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Unpaid Warning Banner */}
            {!isFullyPaid && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>ध्यान दें:</strong> इस ऋण खाते में अभी <strong>₹{remainingPrincipal.toFixed(2)}</strong> मूलधन बकाया शेष है। नियमानुसार पूर्ण चुकता होने पर No Dues जारी होता है।
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onOpenPaymentEntry && selectedLoan && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPaymentEntry(selectedLoan);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      किश्त जमा करें
                    </button>
                  )}
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowOverride}
                      onChange={(e) => setAllowOverride(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>विशेष अनुमति से जारी करें</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          {/* TAB 3: EXPLAINER GUIDE */}
          {activeTab === 'EXPLAINER' ? (
            <div className="max-w-3xl mx-auto space-y-6 text-slate-800">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  सहकारी साख संस्था नियम व प्रक्रिया
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  No Dues (अदेय प्रमाण पत्र) एवं NOC (अनापत्ति प्रमाण पत्र) क्या होता है?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  सहकारी साख संस्थाओं एवं वित्तीय संस्थानों में इन दोनों दस्तावेजों का विशेष कानूनी महत्व है।
                </p>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* No Dues Card */}
                <div className="bg-white rounded-2xl border-2 border-emerald-300 p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-800">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <FileCheck className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">
                        1. No Dues (अदेयता प्रमाण पत्र)
                      </h4>
                      <span className="text-[11px] text-emerald-700 font-bold block">
                        शून्य बकाया की पुष्टि
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    यह प्रमाण पत्र तब जारी किया जाता है जब सदस्य ने संस्था से लिया गया संपूर्ण ऋण (मूलधन + 14% घटती दर से ब्याज + कोई पेनल्टी) <strong>पूर्ण रूप से चुका दिया हो</strong>।
                  </p>

                  <div className="bg-emerald-50 rounded-xl p-3 text-xs space-y-2 text-emerald-950 font-medium">
                    <div className="font-bold text-emerald-900">मुख्य बातें:</div>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      <li>प्रमाणित करता है कि संस्था का अब कोई भी पैसा बकाया नहीं है।</li>
                      <li>ऋण खाता आधिकारिक रूप से <strong>CLOSED (पूर्ण चुकता)</strong> हो जाता है।</li>
                      <li>सदस्य के सिबिल/क्रेडिट रिकॉर्ड में खाता चुकता दर्शाने हेतु आवश्यक।</li>
                    </ul>
                  </div>
                </div>

                {/* NOC Card */}
                <div className="bg-white rounded-2xl border-2 border-blue-300 p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2.5 text-blue-800">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <FileText className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">
                        2. NOC (अनापत्ति प्रमाण पत्र)
                      </h4>
                      <span className="text-[11px] text-blue-700 font-bold block">
                        No Objection Certificate (सहमति पत्र)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    NOC किसी <strong>विशिष्ट कार्य अथवा अन्य संस्था के लिए</strong> जारी की जाने वाली आधिकारिक सहमति है कि "संस्था को सदस्य द्वारा उक्त कार्य करने में कोई आपत्ति नहीं है"।
                  </p>

                  <div className="bg-blue-50 rounded-xl p-3 text-xs space-y-2 text-blue-950 font-medium">
                    <div className="font-bold text-blue-900">NOC कब-कब आवश्यक होती है?</div>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      <li>सदस्य द्वारा किसी अन्य राष्ट्रीयकृत या सहकारी बैंक से नया लोन लेने पर।</li>
                      <li>जमानत के रूप में जमा अग्रिम चेक (PDC) वापस प्राप्त करने हेतु।</li>
                      <li>बंधक संपत्ति या जमीन पर से संस्था का प्रभार (Lien) हटाने हेतु।</li>
                      <li>सोसायटी से सदस्यता त्यागने या अन्य जिले में स्थानांतरण हेतु।</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Summary Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>त्वरित अंतर सारांश (Quick Summary):</span>
                </h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">बिंदु</th>
                        <th className="p-2.5 text-emerald-800">No Dues (अदेय प्रमाण पत्र)</th>
                        <th className="p-2.5 text-blue-800">NOC (अनापत्ति प्रमाण पत्र)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800">उद्देश्य</td>
                        <td className="p-2.5">ऋण चुकता होने व बकाया शून्य होने का प्रमाण</td>
                        <td className="p-2.5">अन्य बैंक से ऋण लेने या चेक/बंधक छुड़ाने की अनुमति</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800">किसको संबोधित</td>
                        <td className="p-2.5">स्वयं ऋणी सदस्य को</td>
                        <td className="p-2.5">बैंक, अन्य संस्था या सर्वसंबंधित को</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800">अग्रिम चेक स्थिति</td>
                        <td className="p-2.5">खाता चुकता होने का रिकॉर्ड</td>
                        <td className="p-2.5">चेक विमुक्त करने का स्पष्ट आदेश</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setActiveTab('NO_DUES')}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <span>प्रमाण पत्र जारी करने हेतु यहाँ क्लिक करें ➔</span>
                </button>
              </div>
            </div>
          ) : (
            /* PRINTABLE OFFICIAL COOPERATIVE LETTERHEAD */
            <div className="max-w-3xl mx-auto">
              <div
                ref={printRef}
                className="bg-white p-8 sm:p-12 rounded-2xl shadow-md border-2 border-slate-300 font-serif text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0"
              >
                {/* Official Society Letterhead Header */}
                <div className="border-b-2 border-amber-600 pb-5 mb-6 text-center relative">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <SocietyEmblem size="md" showText={false} />
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 font-sans">
                        {societyInfo.name}
                      </h1>
                      <p className="text-xs font-bold text-amber-800 font-sans mt-0.5">
                        {societyInfo.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5 font-sans">
                    <p className="font-semibold text-slate-800">
                      म.प्र. शासन सहकारिता विभाग द्वारा पंजीकृत • पंजीयन क्रमांक:{' '}
                      <span className="font-mono font-bold text-slate-950">{societyInfo.regNo}</span>
                    </p>
                    <p>शाखा कार्यालय: {societyInfo.address}</p>
                    <p className="font-mono">
                      दूरभाष: {societyInfo.phone} • ईमेल: {societyInfo.email}
                    </p>
                  </div>

                  {/* Ref & Date Row */}
                  <div className="flex justify-between items-center text-xs font-sans mt-4 pt-3 border-t border-slate-200">
                    <span className="font-semibold">
                      क्रमांक: <span className="font-mono font-bold text-slate-900">{refNumber}</span>
                    </span>
                    <span className="font-semibold">
                      दिनांक: <span className="font-mono font-bold text-slate-900">{issueDate}</span>
                    </span>
                  </div>
                </div>

                {/* Document Title Badge */}
                <div className="text-center my-6">
                  <span className="inline-block border-2 border-slate-900 px-6 py-1.5 text-base sm:text-lg font-extrabold uppercase tracking-wide font-sans bg-amber-50">
                    {activeTab === 'NO_DUES'
                      ? 'अदेयता प्रमाण पत्र (NO DUES CERTIFICATE)'
                      : 'अनापत्ति प्रमाण पत्र (NO OBJECTION CERTIFICATE - NOC)'}
                  </span>
                </div>

                {/* BODY CONTENT */}
                {selectedLoan && (
                  <div className="text-sm leading-relaxed space-y-4 text-justify">
                    {activeTab === 'NOC' && (
                      <div className="space-y-1 font-sans text-xs mb-4">
                        <p>
                          <strong>प्रति,</strong>
                        </p>
                        <p className="font-bold text-slate-900 pl-4">{targetBank}</p>
                        <p className="pl-4 pt-1">
                          <strong>विषय:</strong> {nocPurpose === 'OTHER' ? customNocPurpose : nocPurpose}
                        </p>
                        <p className="pl-4">
                          <strong>संदर्भ:</strong> ऋण खाता क्रमांक {selectedLoan.accountNo}, सदस्यता क्र.{' '}
                          {selectedLoan.membershipNo}
                        </p>
                      </div>
                    )}

                    <p>
                      प्रमाणित किया जाता है कि संस्था के पंजीकृत सदस्य{' '}
                      <strong>श्री/श्रीमती {selectedLoan.borrowerName}</strong>, पिता/पति{' '}
                      <strong>{selectedLoan.fatherOrHusbandName || '—'}</strong>, निवासी{' '}
                      <strong>{selectedLoan.address}</strong>, जिनका संस्था में{' '}
                      <strong>सदस्यता क्रमांक {selectedLoan.membershipNo}</strong> एवं{' '}
                      <strong>ऋण खाता क्रमांक {selectedLoan.accountNo}</strong> दर्ज है।
                    </p>

                    <p>
                      उक्त सदस्य को संस्था द्वारा दिनांक{' '}
                      <strong>{selectedLoan.loanDate}</strong> को 14% वार्षिक घटते क्रम की ब्याज दर पर स्वीकृत ऋण राशि{' '}
                      <strong>{formatINR(selectedLoan.loanAmount)}</strong> (अवधि {selectedLoan.tenureMonths} माह) प्रदान की गई थी।
                    </p>

                    {activeTab === 'NO_DUES' ? (
                      <>
                        <p>
                          उक्त सदस्य द्वारा ऋण का समस्त मूलधन{' '}
                          <strong>₹ {totals.totalPaidPrincipal.toFixed(2)}</strong> एवं नियमानुसार देय सम्पूर्ण ब्याज राशि{' '}
                          <strong>₹ {totals.totalPaidInterest.toFixed(2)}</strong> पूर्ण रूप से संस्था के खाते में जमा कर दी गई है।
                        </p>

                        <p className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 font-sans text-xs font-semibold text-emerald-950">
                          अतः आज दिनांक <strong>{issueDate}</strong> की स्थिति में समाजोत्थान साई साख सहकारी संस्था मर्यादित का उक्त ऋण खाते में <strong>कोई भी मूलधन, ब्याज अथवा अन्य शुल्क बकाया शेष नहीं है</strong>। यह खाता पूर्णतः शून्य (NIL Balance) हो चुका है।
                        </p>

                        <p className="text-xs text-slate-600">
                          यह अदेयता प्रमाण पत्र (No Dues Certificate) सदस्य की मांग पर उनके व्यक्तिगत रिकॉर्ड एवं आवश्यकतानुसार अन्य वित्तीय संस्थानों में प्रस्तुत करने हेतु जारी किया जाता है।
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          उक्त ऋण खाते के परिप्रेक्ष्य में संस्था यह प्रमाणित करती है कि सदस्य द्वारा{' '}
                          <strong>{nocPurpose === 'OTHER' ? customNocPurpose : nocPurpose}</strong> किए जाने के संबंध में संस्था को{' '}
                          <strong>कोई आपत्ति नहीं है (The Society has No Objection)</strong>।
                        </p>

                        <p>
                          ऋण खाता चुकता होने के उपरांत सदस्य द्वारा जमानत के रूप में जमा कराए गए अग्रिम चेक क्रमांक{' '}
                          <strong className="font-mono">{selectedLoan.advanceChequeNo || '—'}</strong> एवं संबंधित दस्तावेज विमुक्त (Released) किए जाते हैं।
                        </p>

                        <p className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 font-sans text-xs font-semibold text-blue-950">
                          संस्था के अभिलेखानुसार उक्त सदस्य का वित्तीय आचरण एवं लेन-देन संतोषजनक रहा है।
                        </p>
                      </>
                    )}

                    {/* Loan Summary Mini-Strip */}
                    <div className="my-6 p-4 bg-slate-50 border border-slate-300 rounded-xl font-sans text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-500 block">स्वीकृत ऋण:</span>
                        <span className="font-bold text-slate-900">{formatINR(selectedLoan.loanAmount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">कुल जमा मूलधन:</span>
                        <span className="font-bold text-emerald-700">₹ {totals.totalPaidPrincipal.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">कुल जमा ब्याज:</span>
                        <span className="font-bold text-amber-800">₹ {totals.totalPaidInterest.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">वर्तमान शेष बकाया:</span>
                        <span className="font-bold font-mono text-emerald-700">
                          {isFullyPaid ? '₹ 0.00 (शून्य)' : `₹ ${remainingPrincipal.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    {/* Official Signatures (NO SEAL / MOHAR - Pure Official Signature Lines) */}
                    <div className="pt-8 mt-6 border-t border-slate-300 grid grid-cols-2 gap-8 font-sans print-page-fit">
                      {/* Left: Manager */}
                      <div className="text-center space-y-1">
                        <div className="h-10 border-b border-dotted border-slate-400 w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-xs sm:text-sm text-slate-950">
                          ({defaultManager.name})
                        </p>
                        <p className="text-[11px] text-slate-700 font-semibold">
                          {defaultManager.designationHindi || 'शाखा प्रबंधक'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {societyInfo.name}
                        </p>
                      </div>

                      {/* Right: President */}
                      <div className="text-center space-y-1">
                        <div className="h-10 border-b border-dotted border-slate-400 w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-xs sm:text-sm text-slate-950">
                          ({defaultPresident.name})
                        </p>
                        <p className="text-[11px] text-slate-700 font-semibold">
                          {defaultPresident.designationHindi || 'संस्था अध्यक्ष'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {societyInfo.name}
                        </p>
                      </div>
                    </div>

                    {/* Footer Verification Notice */}
                    <div className="text-[10px] text-slate-400 text-center pt-6 border-t border-slate-100 font-sans">
                      यह एक कंप्यूटर जनित अधिकृत प्रमाण पत्र है। सत्यापन हेतु संस्था के कार्यालय दूरभाष {societyInfo.phone} पर संपर्क करें।
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (Non-print) */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              मध्य प्रदेश सहकारी साख संस्था अधिनियम के अधीन पूर्णतः सत्यापित प्रारूप।
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              बंद करें
            </button>
            {activeTab !== 'EXPLAINER' && (
              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>प्रिंट करें</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
