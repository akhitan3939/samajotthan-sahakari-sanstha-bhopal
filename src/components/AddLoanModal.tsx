import React, { useState } from 'react';
import { useSociety } from '../context/SocietyContext';
import { generateSchedule, formatINR, getStandardPreEmi } from '../utils/loanCalculations';
import { INITIAL_LOAN_SLABS } from '../data/initialData';
import { LoanRecord, LoanSlab } from '../types';
import { X, UserPlus, Shield, Calculator, Check, AlertCircle } from 'lucide-react';

interface AddLoanModalProps {
  onClose: () => void;
  preSelectedSlab?: LoanSlab | null;
  onSuccess?: (newLoan: LoanRecord) => void;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  onClose,
  preSelectedSlab,
  onSuccess,
}) => {
  const { addLoan, mode } = useSociety();

  const [borrowerName, setBorrowerName] = useState('');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [membershipNo, setMembershipNo] = useState('');
  const [accountNo, setAccountNo] = useState(() => `SB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loanDate, setLoanDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loanAmount, setLoanAmount] = useState<number>(preSelectedSlab ? preSelectedSlab.amount : 50000);
  const [tenureMonths, setTenureMonths] = useState<number>(preSelectedSlab ? preSelectedSlab.tenureMonths : 24);
  const [interestRate, setInterestRate] = useState<number>(14);
  const [lateFeeRate, setLateFeeRate] = useState<number>(2.6);
  const [advanceChequeNo, setAdvanceChequeNo] = useState('');

  // Guarantor 1
  const [g1Name, setG1Name] = useState('');
  const [g1Phone, setG1Phone] = useState('');
  const [g1Address, setG1Address] = useState('');
  const [g1Cheque, setG1Cheque] = useState('');
  const [g1Relation, setG1Relation] = useState('');

  // Guarantor 2
  const [g2Name, setG2Name] = useState('');
  const [g2Phone, setG2Phone] = useState('');
  const [g2Address, setG2Address] = useState('');
  const [g2Cheque, setG2Cheque] = useState('');
  const [g2Relation, setG2Relation] = useState('');

  // Pre-EMI & Deductions: 50k->2500, 100k->5000, 150k->7500, 200k->10000, 300k->15000, 350k->17500, 400k->20000
  const processingFee = 500;
  const buildingFund = 300;
  const estimatedPreEmi = getStandardPreEmi(loanAmount);
  const netDisbursed = Math.round(loanAmount - (estimatedPreEmi + processingFee + buildingFund));

  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSlabSelect = (slab: LoanSlab) => {
    setLoanAmount(slab.amount);
    setTenureMonths(slab.tenureMonths);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) {
      setError('कृपया ऋणी का नाम दर्ज करें');
      return;
    }
    if (!membershipNo.trim()) {
      setError('कृपया सदस्यता क्रमांक दर्ज करें');
      return;
    }
    if (!phone.trim()) {
      setError('कृपया मोबाइल नंबर दर्ज करें');
      return;
    }
    if (!g1Name.trim() || !g2Name.trim()) {
      setError('ऋण स्वीकृति हेतु दोनों (2) जमानतदारों का विवरण अनिवार्य है');
      return;
    }

    // Generate schedule
    const schedule = generateSchedule(loanAmount, interestRate, tenureMonths, loanDate, lateFeeRate);

    const created = addLoan({
      isLocked: mode === 'LIVE',
      borrowerName: borrowerName.trim(),
      fatherOrHusbandName: fatherOrHusbandName.trim(),
      membershipNo: membershipNo.trim(),
      accountNo: accountNo.trim(),
      phone: phone.trim(),
      address: address.trim() || 'भोपाल, म.प्र.',
      loanDate,
      loanAmount,
      interestRate,
      lateFeeRatePerDay: lateFeeRate,
      tenureMonths,
      advanceChequeNo: advanceChequeNo.trim(),
      guarantor1: {
        name: g1Name.trim(),
        phone: g1Phone.trim(),
        address: g1Address.trim() || 'भोपाल',
        chequeNo: g1Cheque.trim(),
        relation: g1Relation.trim(),
      },
      guarantor2: {
        name: g2Name.trim(),
        phone: g2Phone.trim(),
        address: g2Address.trim() || 'भोपाल',
        chequeNo: g2Cheque.trim(),
        relation: g2Relation.trim(),
      },
      preEmiDeductions: {
        preEmiAmount: estimatedPreEmi,
        processingFee,
        buildingFund,
        otherDeductions: 0,
        netDisbursed,
      },
      installments: schedule,
      status: 'ACTIVE',
      notes: notes.trim(),
    });

    if (onSuccess) onSuccess(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">नया ऋण खाता स्वीकृत करें</h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                    mode === 'LIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  [{mode === 'LIVE' ? 'लाइव खाता' : 'डमी / टेस्ट खाता'}]
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ऋणी, 2 जमानतदार, अग्रिम चेक व प्री-ईएमआई कटौती प्रविष्टि
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Preset Slabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ऋण स्लैब चुनें (Preset Slabs):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {INITIAL_LOAN_SLABS.map((s) => (
                <button
                  key={s.amount}
                  type="button"
                  onClick={() => handleSlabSelect(s)}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    loanAmount === s.amount && tenureMonths === s.tenureMonths
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold">{formatINR(s.amount)}</div>
                  <div className="text-[10px] opacity-80">{s.tenureMonths} माह</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Borrower Information */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
              ऋणी का प्राथमिक विवरण (Borrower Info)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ऋणी का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. कांता डोंगरे"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  पिता / पति का नाम
                </label>
                <input
                  type="text"
                  placeholder="उदा. श्री रामेश्वर डोंगरे"
                  value={fatherOrHusbandName}
                  onChange={(e) => setFatherOrHusbandName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  सदस्यता क्रमांक *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. 213"
                  value={membershipNo}
                  onChange={(e) => setMembershipNo(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  खाता क्रमांक *
                </label>
                <input
                  type="text"
                  required
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  मोबाइल नंबर *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10 अंकों का मोबाइल"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ऋण स्वीकृति तिथि *
                </label>
                <input
                  type="date"
                  required
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  ऋणी का पता (भोपाल)
                </label>
                <input
                  type="text"
                  placeholder="वार्ड, कॉलोनी, कोलार रोड, भोपाल"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  अग्रिम चेक क्र. (Advance Cheque No.)
                </label>
                <input
                  type="text"
                  placeholder="उदा. CHQ-649201"
                  value={advanceChequeNo}
                  onChange={(e) => setAdvanceChequeNo(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Financial Terms & Pre-EMI Deductions */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
              ऋण राशि, अवधि एवं पूर्व कटौती नियम
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs mb-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ऋण राशि (₹)</label>
                <input
                  type="number"
                  min="10000"
                  max="1000000"
                  step="5000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">अवधि (माह)</label>
                <select
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value={24}>24 माह (2 वर्ष)</option>
                  <option value={36}>36 माह (3 वर्ष)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ब्याज दर (% वार्षिक)</label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">लेट फीस (प्रति दिन)</label>
                <input
                  type="number"
                  step="0.1"
                  value={lateFeeRate}
                  onChange={(e) => setLateFeeRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono text-rose-700 font-bold"
                />
              </div>
            </div>

            {/* Live Calculation Box */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-slate-800">
              <span className="font-bold text-amber-900 block mb-1">चेक वितरण समायोजन गणना (Auto Computed):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div>
                  <span className="text-slate-500 text-[11px] block">प्री-ईएमआई (अग्रिम कटौती):</span>
                  <span className="font-bold text-amber-900">{formatINR(estimatedPreEmi)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">प्रोसेसिंग शुल्क:</span>
                  <span className="font-bold">₹ 500</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">भवन निधि (Building Fund):</span>
                  <span className="font-bold">₹ 300</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">निवल चेक राशि (Net):</span>
                  <span className="font-bold text-emerald-700 text-sm">{formatINR(netDisbursed)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Two Guarantors (2 जमानतदार) - CRITICAL REQUIREMENT */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
              2 साख जमानतदारों की जानकारी (2 Guarantors Mandatory)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Guarantor 1 */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-blue-900 block border-b pb-1">
                  प्रथम जमानतदार (Guarantor 1) *
                </span>
                <div>
                  <label className="block text-slate-600 mb-0.5">नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. श्री मुकेश डोंगरे"
                    value={g1Name}
                    onChange={(e) => setG1Name(e.target.value)}
                    className="w-full p-1.5 border rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5">मोबाइल *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9826011223"
                      value={g1Phone}
                      onChange={(e) => setG1Phone(e.target.value)}
                      className="w-full p-1.5 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">चेक क्रमांक</label>
                    <input
                      type="text"
                      placeholder="CHQ-410291"
                      value={g1Cheque}
                      onChange={(e) => setG1Cheque(e.target.value)}
                      className="w-full p-1.5 border rounded font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">पता व संबंध</label>
                  <input
                    type="text"
                    placeholder="पता, संबंध (उदा. भाई / मित्र)"
                    value={g1Address}
                    onChange={(e) => setG1Address(e.target.value)}
                    className="w-full p-1.5 border rounded"
                  />
                </div>
              </div>

              {/* Guarantor 2 */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-purple-900 block border-b pb-1">
                  द्वितीय जमानतदार (Guarantor 2) *
                </span>
                <div>
                  <label className="block text-slate-600 mb-0.5">नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. श्री सुनील कुमार"
                    value={g2Name}
                    onChange={(e) => setG2Name(e.target.value)}
                    className="w-full p-1.5 border rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5">मोबाइल *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9425099881"
                      value={g2Phone}
                      onChange={(e) => setG2Phone(e.target.value)}
                      className="w-full p-1.5 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">चेक क्रमांक</label>
                    <input
                      type="text"
                      placeholder="CHQ-301824"
                      value={g2Cheque}
                      onChange={(e) => setG2Cheque(e.target.value)}
                      className="w-full p-1.5 border rounded font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">पता व संबंध</label>
                  <input
                    type="text"
                    placeholder="पता, संबंध (उदा. सहकर्मी / परिचित)"
                    value={g2Address}
                    onChange={(e) => setG2Address(e.target.value)}
                    className="w-full p-1.5 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              विशेष टिप्पणी / नोट (वैकल्पिक)
            </label>
            <input
              type="text"
              placeholder="संस्था प्रस्ताव क्र., स्वीकृति नियम या विशेष अनुमति..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
            >
              ऋण स्वीकृत एवं लेजर तैयार करें
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
