import React, { useState } from 'react';
import { SocietyProvider, useSociety } from './context/SocietyContext';
import { Navbar } from './components/Navbar';
import { SocietyEmblem } from './components/SocietyEmblem';
import { BoardMarquee } from './components/BoardMarquee';
import { EmiCalculator } from './components/EmiCalculator';
import { LoanLedgerModal } from './components/LoanLedgerModal';
import { AddLoanModal } from './components/AddLoanModal';
import { PaymentEntryModal } from './components/PaymentEntryModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { DefaulterNoticeModal } from './components/DefaulterNoticeModal';
import { MemberPortalModal } from './components/MemberPortalModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { NoDuesNocModal } from './components/NoDuesNocModal';
import { PassbookControlModal } from './components/PassbookControlModal';
import { Footer } from './components/Footer';
import { EmiInstallment, LoanRecord } from './types';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  UserCheck,
  Search,
  CreditCard,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Settings,
  Eye,
} from 'lucide-react';

function MainApp() {
  const { loans, societyInfo, frontPageConfig } = useSociety();

  // Navigation View State
  const [view, setView] = useState<'HOME' | 'ADMIN'>('HOME');

  // Admin Login Security Modal
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);

  // Modals State
  const [isMemberPortalOpen, setIsMemberPortalOpen] = useState(false);
  const [memberPortalInitialAccount, setMemberPortalInitialAccount] = useState('');
  const [isPassbookControlOpen, setIsPassbookControlOpen] = useState(false);
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [adminInitialStep, setAdminInitialStep] = useState<string | undefined>(undefined);

  // Front-page Passbook Search States
  const [frontSearchAccountNo, setFrontSearchAccountNo] = useState('');
  const [selectedDropdownLoanId, setSelectedDropdownLoanId] = useState('');
  const [frontSearchFeedback, setFrontSearchFeedback] = useState<string | null>(null);

  // No Dues & NOC Modal State (Admin only)
  const [isNoDuesNocOpen, setIsNoDuesNocOpen] = useState(false);
  const [noDuesNocLoan, setNoDuesNocLoan] = useState<LoanRecord | null>(null);

  // Active Loan for Ledger View (Matches Images 1, 2, 3)
  const [selectedLedgerLoan, setSelectedLedgerLoan] = useState<LoanRecord | null>(null);

  // Payment Entry Target (Single or Multi-EMI)
  const [paymentTarget, setPaymentTarget] = useState<{
    loan: LoanRecord;
    emiNo?: number;
  } | null>(null);

  // Payment Receipt Target
  const [receiptTarget, setReceiptTarget] = useState<{
    loan: LoanRecord;
    installment: EmiInstallment;
  } | null>(null);

  // Defaulter Notice Target
  const [noticeTarget, setNoticeTarget] = useState<LoanRecord | null>(null);

  // Handlers
  const handleOpenAdmin = () => {
    setAdminInitialStep('STEP0_DASHBOARD');
    if (isAdminAuthenticated) {
      setView('ADMIN');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleOpenPassbookAdmin = () => {
    setAdminInitialStep('STEP_PASSBOOK_HUB');
    if (isAdminAuthenticated) {
      setView('ADMIN');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginOpen(false);
    setView('ADMIN');
  };

  // Scroll Helpers
  const scrollToBoard = () => {
    if (view !== 'HOME') setView('HOME');
    setTimeout(() => {
      document.getElementById('board-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToAddress = () => {
    if (view !== 'HOME') setView('HOME');
    setTimeout(() => {
      document.getElementById('branch-address-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToCalculator = () => {
    if (view !== 'HOME') setView('HOME');
    setTimeout(() => {
      document.getElementById('loan-calculator-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Keep selectedLedgerLoan synchronized with context updates
  const activeLedgerLoan = selectedLedgerLoan
    ? loans.find((l) => l.id === selectedLedgerLoan.id) || selectedLedgerLoan
    : null;

  // Filter ONLY loans authorized by admin for online passbook
  const enabledLoans = loans.filter((l) => l.passbookEnabled === true);

  // Front-page account number search handler
  const handleFrontAccountSearch = (accountQuery: string) => {
    const q = accountQuery.trim().toLowerCase();
    if (!q) {
      setFrontSearchFeedback('कृपया खाता क्रमांक दर्ज करें।');
      return;
    }
    const matched = loans.find(
      (l) =>
        l.accountNo.toLowerCase() === q ||
        l.accountNo.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q.replace(/[^a-z0-9]/g, '')) ||
        l.membershipNo.toLowerCase() === q
    );
    if (!matched) {
      setFrontSearchFeedback(`खाता क्रमांक '${accountQuery}' संस्था रिकॉर्ड में नहीं मिला। कृपया सही खाता क्रमांक दर्ज करें।`);
      return;
    }
    if (!matched.passbookEnabled) {
      setFrontSearchFeedback(
        `खाता क्रमांक ${matched.accountNo} (${matched.borrowerName}) की ऑनलाइन पासबुक वर्तमान में संस्था प्रशासन द्वारा सक्षम नहीं की गई है। कृपया संस्था कार्यालय से संपर्क करें।`
      );
      return;
    }
    // Success: open modal with this account
    setFrontSearchFeedback(null);
    setMemberPortalInitialAccount(matched.accountNo);
    setIsMemberPortalOpen(true);
  };

  // Front-page dropdown select handler
  const handleFrontDropdownSelect = (loanId: string) => {
    if (!loanId) return;
    const found = enabledLoans.find((l) => l.id === loanId);
    if (found) {
      setFrontSearchFeedback(null);
      setFrontSearchAccountNo(found.accountNo);
      setMemberPortalInitialAccount(found.accountNo);
      setIsMemberPortalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f3] via-[#fff5f7] to-[#ffeef2] text-slate-900 flex flex-col font-sans">
      {/* 🚀 QUICK VIEW SWITCHER BAR (ALWAYS VISIBLE AT TOP) */}
      <div className="bg-slate-950 text-white px-3 sm:px-6 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-bold z-50">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-slate-300 hidden sm:inline">दृश्य (View):</span>
          <div className="inline-flex rounded-xl p-0.5 bg-slate-900 border border-slate-700">
            <button
              onClick={() => setView('HOME')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                view === 'HOME'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 मुख्य वेबसाइट (Front Page)
            </button>
            <button
              onClick={() => {
                setAdminInitialStep('STEP_PASSBOOK_HUB');
                setView('ADMIN');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                view === 'ADMIN'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-amber-300 hover:text-white'
              }`}
            >
              <span>🏢 एडमिन बायां पैनल (Left Panel)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                🎯 पासबुक
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {view === 'HOME' ? (
            <button
              onClick={() => {
                setAdminInitialStep('STEP_PASSBOOK_HUB');
                setView('ADMIN');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-pink-200" />
              <span>एडमिन बायां पैनल खोलें →</span>
            </button>
          ) : (
            <button
              onClick={() => setView('HOME')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
            >
              वेबसाइट फ्रंट पेज देखें ✕
            </button>
          )}
        </div>
      </div>

      {/* Top Navigation Bar */}
      <Navbar
        onOpenAdmin={handleOpenAdmin}
        onOpenMemberPortal={() => {
          setMemberPortalInitialAccount('');
          setIsMemberPortalOpen(true);
        }}
        onOpenPassbookControl={handleOpenPassbookAdmin}
        onScrollToBoard={scrollToBoard}
        onScrollToAddress={scrollToAddress}
        onScrollToCalculator={scrollToCalculator}
      />

      {/* Main Viewport */}
      {view === 'ADMIN' ? (
        <AdminPanel
          initialStep={adminInitialStep as any}
          onClose={() => {
            setView('HOME');
            setAdminInitialStep(undefined);
          }}
          onOpenAddLoan={() => setIsAddLoanOpen(true)}
          onOpenLedger={(loan) => setSelectedLedgerLoan(loan)}
          onOpenPaymentEntry={(loan, emiNo) => setPaymentTarget({ loan, emiNo })}
          onOpenReceipt={(loan, emi) => setReceiptTarget({ loan, installment: emi })}
          onOpenNotice={(loan) => setNoticeTarget(loan)}
          onOpenNoDuesNoc={(loan) => {
            setNoDuesNocLoan(loan || null);
            setIsNoDuesNocOpen(true);
          }}
          onOpenPassbookControl={() => {
            setAdminInitialStep('STEP_PASSBOOK_HUB');
            setView('ADMIN');
          }}
        />
      ) : (
        <main className="flex-1">
          {/* 1. Official Society Header (Light Pinkish Combination, Dignified & Clean) */}
          <section className="bg-gradient-to-b from-[#ffe4e9]/80 via-[#fff0f3]/90 to-white/95 border-b border-rose-200 py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100/90 border border-rose-300 text-rose-950 text-xs font-bold shadow-xs">
                <span>पंजीयन क्र. {societyInfo.regNo} • म.प्र. शासन सहकारिता विभाग पंजीकृत</span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <SocietyEmblem size="lg" showText={false} />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight leading-snug">
                  {societyInfo.name}
                </h1>
                <p className="text-sm sm:text-base text-rose-950/80 max-w-xl font-medium">
                  {societyInfo.tagline || '14% वार्षिक घटती ब्याज दर पर आसान व पारदर्शी सहकारी ऋण सुविधा'}
                </p>
              </div>

              {/* Limited Essential Information Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs text-rose-950">
                <span className="px-3.5 py-1.5 rounded-xl bg-white/95 font-semibold border border-rose-200 shadow-xs">
                  ⚖️ 14% वार्षिक घटती ब्याज दर (केवल शेष मूलधन पर)
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-white/95 font-semibold border border-rose-200 shadow-xs">
                  📅 24 एवं 36 माह की सुगम किश्तें
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-white/95 font-semibold border border-rose-200 shadow-xs">
                  🛡️ पूर्ण पारदर्शी सहकारी हिसाब
                </span>
              </div>

              {/* Dedicated Front-Page Passbook Search & Name Dropdown (Light Pinkish Card) */}
              <div className="pt-2">
                <div id="member-passbook-card" className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-rose-300/80 shadow-lg shadow-pink-200/50 max-w-xl mx-auto text-left space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-200/80 pb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl">
                        <CreditCard className="w-5 h-5 text-rose-700" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                          सदस्य ऑनलाइन पासबुक
                        </h3>
                        <p className="text-[11px] text-rose-800 font-semibold">
                          केवल प्रशासन द्वारा अधिकृत खाते ही ऑनलाइन देखे जा सकते हैं
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {enabledLoans.length} अधिकृत
                      </span>
                      <button
                        onClick={handleOpenPassbookAdmin}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-200/90 hover:bg-rose-300 text-rose-950 font-black text-xs border border-rose-400 transition-all cursor-pointer shadow-xs"
                        title="बाएं पैनल में तय करें किसकी पासबुक दिखाना है"
                      >
                        <Settings className="w-3.5 h-3.5 text-rose-800" />
                        <span>⚙️ पासबुक कंट्रोल</span>
                      </button>
                    </div>
                  </div>

                  {/* 🎯 Administrator Single-Point Control Notice Banner */}
                  <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-rose-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-rose-700/60 rounded-xl text-pink-200 shrink-0">
                        <Settings className="w-4 h-4 text-pink-300" />
                      </div>
                      <div className="text-xs">
                        <span className="font-black text-white block">
                          🎯 पासबुक दृश्यता कंट्रोल (एडमिन बायां पैनल)
                        </span>
                        <span className="text-[11px] text-rose-200/90">
                          तय करें कि वेबसाइट पर किसकी पासबुक दिखेगी और किसकी बंद रहेगी ({enabledLoans.length} चालू)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenPassbookAdmin}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-200" />
                      <span>बाएं पैनल में कंट्रोल खोलें →</span>
                    </button>
                  </div>

                  {/* Option 1: Dropdown + Direct Button */}
                  {enabledLoans.length === 0 ? (
                    <div className="p-4 bg-rose-50 border-2 border-dashed border-rose-300 rounded-2xl text-center space-y-2.5">
                      <p className="text-xs font-bold text-rose-950">
                        ⚠️ वर्तमान में प्रशासन द्वारा किसी भी सदस्य की पासबुक वेबसाइट पर सक्षम (चालू) नहीं की गई है।
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenPassbookAdmin}
                        className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs shadow-sm cursor-pointer inline-flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4 text-pink-200" />
                        <span>बाएं पैनल में जाकर पासबुक चालू करें</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-rose-950">
                          1. नाम चुनें एवं पासबुक देखें:
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            value={selectedDropdownLoanId}
                            onChange={(e) => {
                              setSelectedDropdownLoanId(e.target.value);
                              setFrontSearchFeedback(null);
                            }}
                            className="flex-1 px-3.5 py-2.5 bg-rose-50/60 border border-rose-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer shadow-xs"
                          >
                            <option value="">-- अधिकृत सदस्य नाम चुनें ({enabledLoans.length} उपलब्ध) --</option>
                            {enabledLoans.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.borrowerName} • खाता: {l.accountNo} (सदस्यता #{l.membershipNo})
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              if (selectedDropdownLoanId) {
                                handleFrontDropdownSelect(selectedDropdownLoanId);
                              } else {
                                setFrontSearchFeedback('कृपया पहले ड्रॉपडाउन से किसी सदस्य का नाम चुनें, फिर इस बटन पर क्लिक करें।');
                              }
                            }}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-pink-700 hover:from-rose-800 hover:to-pink-800 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-900/20 cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                          >
                            <UserCheck className="w-4 h-4 text-pink-200" />
                            <span>पासबुक दिखाएं</span>
                          </button>
                        </div>
                      </div>

                      {/* Option 1.5: Direct Member 1-Click Buttons */}
                      <div className="pt-2 border-t border-rose-100">
                        <span className="text-[11px] font-extrabold text-rose-950 block mb-2">
                          👇 या नीचे सीधे सदस्य के नाम पर क्लिक करके पासबुक खोलें:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {enabledLoans.map((l) => (
                            <button
                              key={l.id}
                              onClick={() => {
                                setFrontSearchAccountNo(l.accountNo);
                                setMemberPortalInitialAccount(l.accountNo);
                                setIsMemberPortalOpen(true);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-950 font-bold text-xs flex items-center gap-2 border-2 border-rose-300 hover:border-rose-500 shadow-xs transition-all cursor-pointer hover:scale-102"
                            >
                              <UserCheck className="w-4 h-4 text-rose-600" />
                              <span>{l.borrowerName} ({l.accountNo})</span>
                              <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md font-semibold">पासबुक देखें →</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3 text-[11px] font-extrabold text-rose-400">
                    <div className="flex-1 h-px bg-rose-200" />
                    <span>अथवा (OR)</span>
                    <div className="flex-1 h-px bg-rose-200" />
                  </div>

                  {/* Option 2: Khata Kramank Search */}
                  <div>
                    <label className="block text-xs font-bold text-rose-950 mb-1.5">
                      2. खाता क्रमांक से खोजें:
                    </label>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleFrontAccountSearch(frontSearchAccountNo);
                      }}
                      className="flex gap-2"
                    >
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-rose-400" />
                        <input
                          type="text"
                          placeholder="खाता क्रमांक (उदा. SB-2023-0213)..."
                          value={frontSearchAccountNo}
                          onChange={(e) => {
                            setFrontSearchAccountNo(e.target.value);
                            setFrontSearchFeedback(null);
                          }}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-rose-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-800 to-pink-700 hover:from-rose-900 hover:to-pink-800 text-white font-extrabold text-xs transition-colors shrink-0 cursor-pointer shadow-sm shadow-rose-900/10 flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>पासबुक खोजें</span>
                      </button>
                    </form>
                  </div>

                  {/* Feedback Notice if any */}
                  {frontSearchFeedback && (
                    <div className="p-3 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-950 text-xs font-semibold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                      <p className="leading-snug">{frontSearchFeedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 2. Sanchalak Mandal: Members marquee */}
          <div id="board-section" className="border-b border-rose-200/80 bg-gradient-to-r from-[#ffe4e9]/40 via-rose-50/70 to-[#ffe4e9]/40">
            <BoardMarquee onManageClick={handleOpenAdmin} />
          </div>

          {/* 3. Official Loan Slab & EMI Calculator */}
          <section id="loan-calculator-section" className="py-14 bg-gradient-to-b from-white via-rose-50/40 to-[#fff0f3] border-t border-rose-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-extrabold uppercase tracking-widest text-rose-800 block mb-1">
                  पारदर्शी साख एवं किस्त गणना
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  ऋण स्लैब एवं 24/36 माह किस्त कैलकुलेटर
                </h2>
                <p className="text-xs sm:text-sm text-rose-900/80 mt-1">
                  14% घटती ब्याज दर अनुसार मासिक किस्त, कुल ब्याज, पहली व अंतिम किस्त, तथा देय चेक राशि का पूर्ण चार्ट।
                </p>
              </div>

              <EmiCalculator isInline={true} />
            </div>
          </section>

          {/* 4. Branch Office Address & Contact (Clean, no redundant buttons) */}
          <section id="branch-address-section" className="py-14 bg-gradient-to-b from-[#fff0f3] to-[#ffe4e9]/60 border-t border-rose-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-extrabold uppercase tracking-widest text-rose-800 block mb-1">
                  कार्यालय एवं शाखा संपर्क
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {societyInfo.name}
                </h2>
                <p className="text-xs sm:text-sm text-rose-900/70 mt-1">
                  भोपाल नगर में सदस्यों के आर्थिक सहयोग व साख संवर्धन हेतु सदैव तत्पर।
                </p>
              </div>

              {/* Clean Branch Contact Card with Rose/Burgundy Glow */}
              <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-950/15 border border-rose-800/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-rose-500/20 text-rose-300 rounded-xl shrink-0 mt-0.5 border border-rose-500/30">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-rose-200/80 block font-semibold">शाखा कार्यालय पता:</span>
                      <p className="text-sm font-semibold text-white mt-0.5 leading-snug">
                        {societyInfo.address}
                      </p>
                      <span className="text-xs text-pink-300 font-mono mt-1 block">
                        पंजीयन क्र.: {societyInfo.regNo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-pink-500/20 text-pink-300 rounded-xl shrink-0 mt-0.5 border border-pink-500/30">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-pink-200/80 block font-semibold">हेल्पलाइन व संपर्क:</span>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">
                        {societyInfo.phone}
                      </p>
                      <span className="text-xs text-rose-200 font-mono block mt-0.5">
                        {societyInfo.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl shrink-0 mt-0.5 border border-amber-500/30">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-amber-200/80 block font-semibold">कार्य समय:</span>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5">
                        {societyInfo.workingHours}
                      </p>
                      <span className="text-xs text-rose-300/80 block mt-1">
                        रविवार साप्ताहिक अवकाश
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <Footer
            onOpenAdmin={handleOpenAdmin}
            onOpenMemberPortal={() => {
              setMemberPortalInitialAccount('');
              setIsMemberPortalOpen(true);
            }}
            onOpenCalculator={scrollToCalculator}
            onScrollToSlabs={scrollToCalculator}
          />
        </main>
      )}

      {/* ADMIN AUTHENTICATION LOGIN MODAL */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onSuccess={handleAdminAuthSuccess}
          onClose={() => setIsAdminLoginOpen(false)}
        />
      )}

      {/* LOAN LEDGER MODAL (Replicating Image 1, 2, 3) */}
      {activeLedgerLoan && (
        <LoanLedgerModal
          loan={activeLedgerLoan}
          onClose={() => setSelectedLedgerLoan(null)}
          onOpenPaymentEntry={(l, emiNo) => setPaymentTarget({ loan: l, emiNo })}
          onPrintReceipt={(l, emi) => setReceiptTarget({ loan: l, installment: emi })}
        />
      )}

      {/* ADD NEW LOAN MODAL */}
      {isAddLoanOpen && (
        <AddLoanModal
          onClose={() => setIsAddLoanOpen(false)}
          onSuccess={(newLoan) => {
            setSelectedLedgerLoan(newLoan);
          }}
        />
      )}

      {/* MULTI-EMI PAYMENT ENTRY MODAL */}
      {paymentTarget && (
        <PaymentEntryModal
          loan={paymentTarget.loan}
          initialEmiNo={paymentTarget.emiNo}
          onClose={() => setPaymentTarget(null)}
          onSuccessPrintReceipt={(l, emi) => {
            setReceiptTarget({ loan: l, installment: emi });
          }}
        />
      )}

      {/* PAYMENT RECEIPT PRINT MODAL */}
      {receiptTarget && (
        <PaymentReceiptModal
          loan={receiptTarget.loan}
          installment={receiptTarget.installment}
          onClose={() => setReceiptTarget(null)}
        />
      )}

      {/* DEFAULTER LEGAL NOTICE PRINT MODAL */}
      {noticeTarget && (
        <DefaulterNoticeModal
          loan={noticeTarget}
          onClose={() => setNoticeTarget(null)}
        />
      )}

      {/* MEMBER ONLINE PORTAL MODAL */}
      {isMemberPortalOpen && (
        <MemberPortalModal
          initialAccountNo={memberPortalInitialAccount}
          onClose={() => {
            setIsMemberPortalOpen(false);
            setMemberPortalInitialAccount('');
          }}
          onViewLedger={(loan) => {
            setIsMemberPortalOpen(false);
            setSelectedLedgerLoan(loan);
          }}
          onPrintReceipt={(loan, emi) => {
            setReceiptTarget({ loan, installment: emi });
          }}
        />
      )}

      {/* NO DUES & NOC CERTIFICATE MODAL (Admin Only) */}
      {isNoDuesNocOpen && (
        <NoDuesNocModal
          initialLoan={noDuesNocLoan}
          onClose={() => {
            setIsNoDuesNocOpen(false);
            setNoDuesNocLoan(null);
          }}
        />
      )}

      {/* PASSBOOK VISIBILITY CONTROL MODAL (One Single Dedicated Control Place) */}
      {isPassbookControlOpen && (
        <PassbookControlModal
          onClose={() => setIsPassbookControlOpen(false)}
          onViewOnWebsite={(accNo) => {
            setIsPassbookControlOpen(false);
            if (accNo) {
              setFrontSearchAccountNo(accNo);
              setMemberPortalInitialAccount(accNo);
              setIsMemberPortalOpen(true);
            }
          }}
          onOpenAdminHub={handleOpenPassbookAdmin}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SocietyProvider>
      <MainApp />
    </SocietyProvider>
  );
}
