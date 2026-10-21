import React from 'react';
import { LoanRecord, SocietyInfo } from '../types';
import {
  calculateComprehensiveStats,
  formatINR,
} from '../utils/loanCalculations';
import {
  TrendingUp,
  Coins,
  ShieldAlert,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building,
  CreditCard,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Percent,
  Calendar,
  FileCheck,
  ChevronRight,
  Award,
  CircleDot,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';

interface SocietyDashboardProps {
  loans: LoanRecord[];
  societyInfo: SocietyInfo;
  mode: 'LIVE' | 'DUMMY';
  onNavigateToStep: (
    step:
      | 'STEP_PASSBOOK_HUB'
      | 'STEP1_LOANS'
      | 'STEP2_PAYMENTS'
      | 'STEP3_DEFAULTERS'
      | 'STEP4_CALCULATOR'
      | 'STEP5_REPORTS'
      | 'STEP6_BOARD_BACKUP'
      | 'STEP7_WEBSITE_SETTINGS'
  ) => void;
  onOpenAddLoan: () => void;
  onOpenNoDuesNoc?: () => void;
  onTogglePassbookEnabled?: (loanId: string) => void;
}

export const SocietyDashboard: React.FC<SocietyDashboardProps> = ({
  loans,
  societyInfo,
  mode,
  onNavigateToStep,
  onOpenAddLoan,
  onOpenNoDuesNoc,
  onTogglePassbookEnabled,
}) => {
  const stats = calculateComprehensiveStats(loans);

  // SVG Circular Gauge Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const recoveryOffset =
    circumference - (Math.min(100, Math.max(0, stats.recoveryPercentage)) / 100) * circumference;

  const onTimeOffset =
    circumference - (Math.min(100, Math.max(0, stats.onTimePaymentRate)) / 100) * circumference;

  // Slab Breakdown calculation
  const slabTiers = [
    { label: '₹ 50,000 (पचास हजार)', amount: 50000 },
    { label: '₹ 1,00,000 (एक लाख)', amount: 100000 },
    { label: '₹ 1,50,000 (डेढ़ लाख)', amount: 150000 },
    { label: '₹ 2,00,000 (दो लाख)', amount: 200000 },
    { label: '₹ 3,00,000 (तीन लाख)', amount: 300000 },
    { label: '₹ 3,50,000 (साढ़े तीन लाख)', amount: 350000 },
    { label: '₹ 4,00,000 (चार लाख)', amount: 400000 },
  ];

  const slabData = slabTiers.map((tier) => {
    const matching = loans.filter((l) => l.loanAmount === tier.amount);
    const count = matching.length;
    const totalAmount = count * tier.amount;
    const pct = stats.kitnaDiya > 0 ? Math.round((totalAmount / stats.kitnaDiya) * 100) : 0;
    return {
      ...tier,
      count,
      totalAmount,
      pct,
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. TOP EXECUTIVE GREETING & STATUS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-amber-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                समग्र वित्तीय विश्लेषण डैशबोर्ड (Executive Intelligence)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/10 text-slate-300">
                {mode === 'LIVE' ? 'लाइव सुरक्षित लेजर' : 'डमी टेस्ट मोड'}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {societyInfo.name}
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              पंजीयन क्र. <span className="text-amber-300 font-mono font-bold">{societyInfo.regNo}</span> • मुख्य शाखा: {societyInfo.address}
              <br />
              <span className="text-slate-400">
                संस्था की समग्र वित्तीय पूंजी, ब्याज आय संचय, 14% घटते क्रम की वसूली गति एवं पोर्टफोलियो सुरक्षा का वास्तविक-समय (Real-Time) विश्लेषण।
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenNoDuesNoc && (
              <button
                onClick={onOpenNoDuesNoc}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                title="अदेयता (No Dues) एवं अनापत्ति (NOC) प्रमाण पत्र जारी करें"
              >
                <FileCheck className="w-4 h-4 text-purple-200" />
                <span>No Dues / NOC</span>
              </button>
            )}
            <button
              onClick={() => onNavigateToStep('STEP2_PAYMENTS')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Coins className="w-4 h-4 text-emerald-200" />
              <span>किश्त वसूली दर्ज करें</span>
            </button>
            <button
              onClick={onOpenAddLoan}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>नया ऋण स्वीकृति</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌐 PROMINENT PASSBOOK VISIBILITY CONTROLS (किसकी पासबुक वेबसाइट पर दिखाना है) */}
      <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-rose-500/50 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-rose-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600/30 border border-rose-400/50 rounded-2xl text-pink-300">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  🌐 वेबसाइट पासबुक नियंत्रण: किसकी पासबुक वेबसाइट पर दिखाना है?
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {loans.filter((l) => l.passbookEnabled).length} / {loans.length} चालू
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-1">
                यहाँ दिए गए बटन पर क्लिक करके तय करें कि मुख्य वेबसाइट (Front Page) पर किस सदस्य की पासबुक दिखाई देगी।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToStep('STEP_PASSBOOK_HUB')}
              className="px-3.5 py-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-rose-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 border border-pink-300"
              title="एक ही जगह से सभी सदस्यों की पासबुक कंट्रोल करें"
            >
              <span>🎯 पूरा पासबुक कंट्रोल हब खोलें →</span>
            </button>
            <button
              onClick={() => {
                loans.forEach((l) => {
                  if (!l.passbookEnabled) onTogglePassbookEnabled?.(l.id);
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              सबकी पासबुक चालू करें
            </button>
            <button
              onClick={() => {
                loans.forEach((l) => {
                  if (l.passbookEnabled) onTogglePassbookEnabled?.(l.id);
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              सबकी पासबुक बंद करें
            </button>
          </div>
        </div>

        {/* Members Cards with Clear Toggle Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                loan.passbookEnabled
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/70 border-slate-700/80'
              }`}
            >
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-amber-300 block">
                  #{loan.membershipNo} • {loan.accountNo}
                </span>
                <h4 className="text-sm font-extrabold text-white truncate mt-0.5">
                  {loan.borrowerName}
                </h4>
                <span
                  className={`text-[10px] font-bold block mt-1 ${
                    loan.passbookEnabled ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {loan.passbookEnabled ? '🟢 वेबसाइट पर दिख रही है' : '⚪ वेबसाइट पर छिपी हुई है'}
                </span>
              </div>

              <button
                onClick={() => onTogglePassbookEnabled?.(loan.id)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md ${
                  loan.passbookEnabled
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-400 shadow-emerald-900/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-600'
                }`}
                title={
                  loan.passbookEnabled
                    ? 'वेबसाइट पर पासबुक चालू है - बंद करने के लिए क्लिक करें'
                    : 'वेबसाइट पर पासबुक बंद है - चालू करने के लिए क्लिक करें'
                }
              >
                {loan.passbookEnabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>चालू (On)</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>बंद (Off)</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. THE 3 GOLDEN HIGH-CONTRAST CORE METRICS (Kitna Diya, Kitna Aaya, Kitna Bacha) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Kitna Diya */}
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-6 shadow-md border border-blue-800/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-blue-400" />
                1. कुल दिया गया ऋण राशि (Disbursed)
              </span>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-500/30">
                {stats.totalLoansCount} ऋण खाते
              </span>
            </div>
            <div className="mt-4 text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {formatINR(stats.kitnaDiya)}
            </div>
            <p className="text-xs text-blue-200/80 mt-1 font-sans">
              संस्था द्वारा स्वीकृत कुल मूलधन राशि
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-blue-800/80 flex items-center justify-between text-xs text-blue-200 font-sans">
            <span>औसत ऋण आकार (Avg Ticket):</span>
            <strong className="font-mono text-white text-sm">
              {formatINR(stats.averageLoanSize)}
            </strong>
          </div>
        </div>

        {/* Metric 2: Kitna Aaya */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                2. कुल वापस आया धन (Total Recovered)
              </span>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                {stats.recoveryPercentage}% वसूली
              </span>
            </div>
            <div className="mt-4 text-3xl sm:text-4xl font-extrabold font-mono text-emerald-300 tracking-tight">
              {formatINR(stats.kitnaAaya)}
            </div>
            <p className="text-xs text-emerald-200/80 mt-1 font-sans">
              मूलधन + 14% ब्याज + लेट फीस का कुल संग्रह
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-200 font-sans">
            <span>जमा मूलधन {formatINR(stats.totalPaidPrincipal)} + ब्याज:</span>
            <strong className="font-mono text-amber-300 text-sm">
              {formatINR(stats.totalPaidInterest)}
            </strong>
          </div>
        </div>

        {/* Metric 3: Kitna Bacha */}
        <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 text-white rounded-2xl p-6 shadow-md border border-amber-800/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                3. कुल बाकी / शेष मूलधन (Outstanding)
              </span>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                {stats.closedCount} खाते चुकता
              </span>
            </div>
            <div className="mt-4 text-3xl sm:text-4xl font-extrabold font-mono text-amber-300 tracking-tight">
              {formatINR(stats.kitnaBacha)}
            </div>
            <p className="text-xs text-amber-200/80 mt-1 font-sans">
              ऋणी सदस्यों से भविष्य में वसूली योग्य शेष मूलधन
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-amber-800/80 flex items-center justify-between text-xs text-amber-200 font-sans">
            <span>भावी अनुमानित ब्याज आय:</span>
            <strong className="font-mono text-emerald-300 text-sm">
              +{formatINR(stats.futureProjectedInterest)}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. INSTITUTIONAL REVENUE & INCOME STREAMS (संस्था की वास्तविक आय एवं संचित कोष) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl font-bold">
              <Award className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                संस्था की वास्तविक गैर-मूलधन आय एवं संचित कोष (Society Institutional Income)
              </h3>
              <p className="text-xs text-slate-500">
                ब्याज, लेट फीस पेनल्टी, फाइल प्रोसेसिंग एवं भवन निर्माण निधि का पारदर्शी वित्तीय वर्गीकरण
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-extrabold text-xs font-mono flex items-center gap-2">
            <span>कुल गैर-मूलधन आय:</span>
            <span className="text-sm font-black text-emerald-700">
              {formatINR(stats.totalSocietyIncome)}
            </span>
          </div>
        </div>

        {/* 4 Income Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Pillar 1: 14% Reducing Interest Income */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between text-amber-900 text-xs font-bold">
              <span>1. 14% घटता ब्याज संग्रह</span>
              <Percent className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-950">
              {formatINR(stats.totalPaidInterest)}
            </div>
            <p className="text-[11px] text-amber-800">
              मासिक घटती शेष राशि पद्धति से अर्जित वास्तविक ब्याज
            </p>
          </div>

          {/* Pillar 2: Late Fee Penalty */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
            <div className="flex items-center justify-between text-rose-900 text-xs font-bold">
              <span>2. लेट फीस पेनल्टी संग्रह</span>
              <AlertTriangle className="w-4 h-4 text-rose-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-950">
              {formatINR(stats.totalPenaltyCollected)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-rose-800">
              <span>दर: ₹ 2.60/दिन</span>
              {stats.totalPenaltyWaived > 0 && (
                <span className="font-semibold text-rose-700">
                  छूट: {formatINR(stats.totalPenaltyWaived)}
                </span>
              )}
            </div>
          </div>

          {/* Pillar 3: Processing Fees */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
            <div className="flex items-center justify-between text-blue-900 text-xs font-bold">
              <span>3. फाइल प्रोसेसिंग शुल्क</span>
              <FileCheck className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-950">
              {formatINR(stats.totalProcessingFees)}
            </div>
            <p className="text-[11px] text-blue-800">
              स्वीकृत ऋणों पर ₹ 500 प्रति फाइल अग्रिम कटौती
            </p>
          </div>

          {/* Pillar 4: Building Fund */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
            <div className="flex items-center justify-between text-purple-900 text-xs font-bold">
              <span>4. भवन निर्माण निधि फंड</span>
              <Building className="w-4 h-4 text-purple-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-950">
              {formatINR(stats.totalBuildingFund)}
            </div>
            <p className="text-[11px] text-purple-800">
              संस्था विकास हेतु ₹ 300 प्रति ऋण संचित फंड
            </p>
          </div>
        </div>

        {/* Advance Pre-EMI Summary Notice */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              कुल अग्रिम <strong>प्री-ईएमआई (Pre-EMI)</strong> कटौती: <strong className="font-mono text-slate-900">{formatINR(stats.totalPreEmiDeducted)}</strong> (चेक वितरण के समय सुरक्षित की गई)
            </span>
          </div>

          {stats.totalPendingInterest > 0 && (
            <div className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>बकाया ब्याज (बाद में देय): {formatINR(stats.totalPendingInterest)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. SPEEDOMETERS & BEHAVIOR RADAR (वसूली गति एवं ऋणी व्यवहार विश्लेषण) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Recovery Gauge & Speedometer (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  वसूली गति एवं अनुशासन दर (Recovery & Discipline)
                </h4>
                <p className="text-[11px] text-slate-500">
                  कुल ऋण मूलधन के विरुद्ध प्राप्त मूलधन अनुपात
                </p>
              </div>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            {/* Circular Gauge Visualization */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-6">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 130 130">
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="12"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={recoveryOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {stats.recoveryPercentage}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    मूलधन वसूली
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs w-full sm:w-auto">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold block">
                    समय पर भुगतान दर (On-Time Rate):
                  </span>
                  <span className="text-base font-extrabold font-mono text-emerald-950">
                    {stats.onTimePaymentRate}%
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-600 font-bold block">
                    औसत विलंब दिन (Avg Delay):
                  </span>
                  <span className="text-base font-extrabold font-mono text-slate-900">
                    {stats.averageDelayDays} दिन
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            <div className="p-2 rounded-lg bg-slate-50 text-center">
              <span className="text-[10px] text-slate-500 block">कुल किश्तें देय:</span>
              <strong className="font-mono text-slate-900 font-bold">
                {stats.totalInstallmentsCount}
              </strong>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-center">
              <span className="text-[10px] text-emerald-700 block">पूर्ण चुकता किश्तें:</span>
              <strong className="font-mono text-emerald-900 font-bold">
                {stats.paidInstallmentsCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Borrower Classification & Risk Radar (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                ऋणी आचरण एवं जोखिम वर्गीकरण (Borrower Behavior Radar)
              </h4>
              <p className="text-[11px] text-slate-500">
                नियमित, निगरानी व डिफ़ॉल्टर खातों का सटीक पोर्टफोलियो विश्लेषण
              </p>
            </div>
            <button
              onClick={() => onNavigateToStep('STEP3_DEFAULTERS')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>डिफ़ॉल्टर सूची देखें</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Category 1: Regular Payers */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. नियमित एवं समयबद्ध ऋणी (Regular Good Payers)</span>
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  {stats.sahiSeDeneWale} सदस्य ({stats.totalLoansCount > 0 ? Math.round((stats.sahiSeDeneWale / stats.totalLoansCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${stats.totalLoansCount > 0 ? (stats.sahiSeDeneWale / stats.totalLoansCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-emerald-800">
                <span>नियमित देयता के अधीन शेष मूलधन:</span>
                <strong className="font-mono">{formatINR(stats.regularAmount)}</strong>
              </div>
            </div>

            {/* Category 2: Watchlist */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>2. निगरानी सूची (Watchlist - 1 से 2 किश्तें विलंबित)</span>
                </span>
                <span className="font-mono font-bold text-amber-800">
                  {stats.dikkatKarneWale} सदस्य ({stats.totalLoansCount > 0 ? Math.round((stats.dikkatKarneWale / stats.totalLoansCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${stats.totalLoansCount > 0 ? (stats.dikkatKarneWale / stats.totalLoansCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-amber-800">
                <span>सावधानी पूर्वक संपर्क योग्य शेष मूलधन:</span>
                <strong className="font-mono">{formatINR(stats.watchlistAmount)}</strong>
              </div>
            </div>

            {/* Category 3: Defaulters */}
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>3. डिफ़ॉल्टर खाते (3+ किश्तें चूक / कानूनी नोटिस योग्य)</span>
                </span>
                <span className="font-mono font-bold text-rose-800">
                  {stats.defaultersCount} सदस्य ({stats.totalLoansCount > 0 ? Math.round((stats.defaultersCount / stats.totalLoansCount) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-rose-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-600 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${stats.totalLoansCount > 0 ? (stats.defaultersCount / stats.totalLoansCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-rose-800">
                <span>जोखिम के अधीन शेष मूलधन (Portfolio At Risk):</span>
                <strong className="font-mono text-rose-950 font-black">
                  {formatINR(stats.defaulterAmountAtRisk)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. LOAN TENURE & SLAB DISTRIBUTION VISUALS (स्लैबवार एवं अवधि विश्लेषण - NO TABLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tenure Comparison (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                ऋण अवधि विभाजन (Tenure Split)
              </h4>
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>

            <div className="space-y-4 my-5">
              {/* 24 Months */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">24 माह अवधि (2 वर्ष)</span>
                  <span className="font-mono font-bold text-slate-700">{stats.tenure24Count} खाते</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-950">
                  {formatINR(stats.tenure24Amount)}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${stats.kitnaDiya > 0 ? (stats.tenure24Amount / stats.kitnaDiya) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  कुल ऋण का {stats.kitnaDiya > 0 ? Math.round((stats.tenure24Amount / stats.kitnaDiya) * 100) : 0}%
                </span>
              </div>

              {/* 36 Months */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">36 माह अवधि (3 वर्ष)</span>
                  <span className="font-mono font-bold text-slate-700">{stats.tenure36Count} खाते</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-950">
                  {formatINR(stats.tenure36Amount)}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${stats.kitnaDiya > 0 ? (stats.tenure36Amount / stats.kitnaDiya) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  कुल ऋण का {stats.kitnaDiya > 0 ? Math.round((stats.tenure36Amount / stats.kitnaDiya) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToStep('STEP4_CALCULATOR')}
            className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>स्लैब कैलकुलेटर व ईएमआई चार्ट देखें</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Slab-wise Volume Bars (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                संस्था स्लैबवार ऋण वितरण (Loan Slabs Volume Breakdown)
              </h4>
              <p className="text-[11px] text-slate-500">
                प्रत्येक स्लैब में जारी किए गए ऋणों की संख्या एवं पूंजी का सटीक बार चार्ट
              </p>
            </div>
            <span className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {slabData.map((s) => (
              <div key={s.amount} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <CircleDot className="w-3 h-3 text-amber-500" />
                    <span>{s.label}</span>
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500 text-[11px]">{s.count} खाते</span>
                    <strong className="text-slate-900 font-bold">{formatINR(s.totalAmount)}</strong>
                    <span className="text-xs font-bold text-amber-700 w-10 text-right">{s.pct}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(s.pct, s.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span>• सभी स्लैब 14% वार्षिक घटते ब्याज पर आधारित हैं।</span>
            <span>• अग्रिम प्री-ईएमआई स्लैब नियमों के अनुसार समायोजित है।</span>
          </div>
        </div>
      </div>

      {/* 6. SECURITY & COLLATERAL ASSURANCE (जमानतदार व कानूनी सुरक्षा) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                जमानतदार एवं कानूनी सुरक्षा कवच (Security & Collateral Health)
              </h4>
              <p className="text-xs text-slate-500">
                अग्रिम चेक, दोहरे जमानतदार एवं मध्य प्रदेश सहकारी समिति अधिनियम 1960 के अंतर्गत अनुपालन
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            100% सुरक्षा अनुपालन
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-slate-500 text-[11px] block">पंजीकृत जमानतदार (Guarantors):</span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {stats.totalLoansCount * 2}
            </div>
            <p className="text-[11px] text-slate-600">प्रत्येक ऋण खाते में 2 पूर्ण जमानतदार</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-slate-500 text-[11px] block">जमानतदार बैंक चेक (PDC Cheques):</span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {stats.totalLoansCount * 2}
            </div>
            <p className="text-[11px] text-slate-600">सुरक्षित हस्ताक्षरयुक्त अग्रिम चेक</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-slate-500 text-[11px] block">ऋणी मुख्य अग्रिम चेक:</span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {stats.totalLoansCount}
            </div>
            <p className="text-[11px] text-slate-600">संस्था लॉकर में सुरक्षित अग्रिम चेक</p>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1">
            <span className="text-rose-700 text-[11px] block">मांग नोटिस योग्य खाते:</span>
            <div className="text-2xl font-bold font-mono text-rose-950">
              {stats.defaultersCount}
            </div>
            <p className="text-[11px] text-rose-800">3+ किश्तों के विलंब पर सूचना पत्र</p>
          </div>
        </div>
      </div>

      {/* 7. QUICK ACTION HUBS (त्वरित प्रशासक कार्य शॉर्टकट) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateToStep('STEP1_LOANS')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-900 hover:shadow-md transition-all text-left space-y-2 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-900">
            <span className="font-bold text-xs">1. ऋण खाते व लेजर</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-500">
            सभी {stats.totalLoansCount} खातों की विस्तृत लेजर बही, जमानतदार व प्रिंट विकल्प
          </p>
        </button>

        <button
          onClick={() => onNavigateToStep('STEP2_PAYMENTS')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all text-left space-y-2 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-emerald-900">
            <span className="font-bold text-xs">2. किश्त वसूली व रसीद</span>
            <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-500">
            एकल व बहु-किश्त जमा, मूलधन-मात्र भुगतान, पेनल्टी छूट एवं आधिकारिक रसीद
          </p>
        </button>

        <button
          onClick={() => onNavigateToStep('STEP3_DEFAULTERS')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-600 hover:shadow-md transition-all text-left space-y-2 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-rose-900">
            <span className="font-bold text-xs">3. डिफ़ॉल्टर नोटिस</span>
            <ChevronRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-500">
            3+ किश्तें मिस होने पर कानूनी मांग पत्र व वसूली प्रक्रिया
          </p>
        </button>

        <button
          onClick={() => onNavigateToStep('STEP7_WEBSITE_SETTINGS')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-600 hover:shadow-md transition-all text-left space-y-2 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-purple-900">
            <span className="font-bold text-xs">4. वेबसाइट व संपर्क सेटिंग्स</span>
            <ChevronRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-500">
            फोन, ईमेल, कार्यालय पता, प्रबंधक नाम एवं वेबसाइट अलर्ट संदेश अपडेट करें
          </p>
        </button>
      </div>
    </div>
  );
};
