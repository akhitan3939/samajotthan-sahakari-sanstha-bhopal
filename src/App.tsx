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
import { Footer } from './components/Footer';
import { EmiInstallment, LoanRecord } from './types';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  UserCheck,
} from 'lucide-react';

function MainApp() {
  const { loans, societyInfo, frontPageConfig } = useSociety();

  // Navigation View State
  const [view, setView] = useState<'HOME' | 'ADMIN'>('HOME');

  // Admin Login Security Modal
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Modals State
  const [isMemberPortalOpen, setIsMemberPortalOpen] = useState(false);
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [isAdminCalculatorModalOpen, setIsAdminCalculatorModalOpen] = useState(false);

  // No Dues & NOC Modal State
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/70 via-pink-50/40 to-rose-50/60 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenAdmin={handleOpenAdmin}
        onOpenMemberPortal={() => setIsMemberPortalOpen(true)}
        onScrollToBoard={scrollToBoard}
        onScrollToAddress={scrollToAddress}
        onScrollToCalculator={scrollToCalculator}
      />

      {/* Main Viewport */}
      {view === 'ADMIN' ? (
        <AdminPanel
          onClose={() => setView('HOME')}
          onOpenAddLoan={() => setIsAddLoanOpen(true)}
          onOpenLedger={(loan) => setSelectedLedgerLoan(loan)}
          onOpenPaymentEntry={(loan, emiNo) => setPaymentTarget({ loan, emiNo })}
          onOpenReceipt={(loan, emi) => setReceiptTarget({ loan, installment: emi })}
          onOpenNotice={(loan) => setNoticeTarget(loan)}
          onOpenNoDuesNoc={(loan) => {
            setNoDuesNocLoan(loan || null);
            setIsNoDuesNocOpen(true);
          }}
        />
      ) : (
        <main className="flex-1">
          {/* 1. Official Society Header (Light Pinkish Combination, Dignified & Clean) */}
          <section className="bg-gradient-to-b from-rose-100/70 via-pink-50/50 to-white/90 border-b border-rose-200/80 py-12 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
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

              {/* Single Essential Action for Members */}
              <div className="pt-3">
                <button
                  onClick={() => setIsMemberPortalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-800 to-pink-700 hover:from-rose-800 hover:to-pink-800 text-white font-extrabold text-xs transition-all cursor-pointer shadow-lg shadow-rose-900/20"
                >
                  <UserCheck className="w-4 h-4 text-pink-200" />
                  <span>सदस्य ऑनलाइन पासबुक देखें</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. Sanchalak Mandal: Members marquee */}
          <div id="board-section" className="border-b border-rose-200/60 bg-gradient-to-r from-pink-50/40 via-rose-50/60 to-pink-50/40">
            <BoardMarquee onManageClick={handleOpenAdmin} />
          </div>

          {/* 3. Official Loan Slab & EMI Calculator */}
          <section id="loan-calculator-section" className="py-14 bg-gradient-to-b from-white via-rose-50/40 to-pink-50/50 border-t border-rose-200/80">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-800 block mb-1">
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
          <section id="branch-address-section" className="py-14 bg-gradient-to-b from-pink-50/30 to-rose-100/50 border-t border-rose-200/80">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-800 block mb-1">
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
            onOpenMemberPortal={() => setIsMemberPortalOpen(true)}
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
          onClose={() => setIsMemberPortalOpen(false)}
          onViewLedger={(loan) => {
            setIsMemberPortalOpen(false);
            setSelectedLedgerLoan(loan);
          }}
          onPrintReceipt={(loan, emi) => {
            setReceiptTarget({ loan, installment: emi });
          }}
        />
      )}

      {/* NO DUES & NOC CERTIFICATE MODAL */}
      {isNoDuesNocOpen && (
        <NoDuesNocModal
          initialLoan={noDuesNocLoan}
          onClose={() => {
            setIsNoDuesNocOpen(false);
            setNoDuesNocLoan(null);
          }}
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
