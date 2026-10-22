import React, { useState, useEffect } from 'react';
import { useSociety } from '../context/SocietyContext';
import { BannerSlide, BoardMember, EmiInstallment, FrontPageConfig, LoanRecord, LoanStatus } from '../types';
import {
  calculateComprehensiveStats,
  calculateInstallmentTotals,
  classifyBorrower,
  evaluateDefaulterStatus,
  exportToCSV,
  formatINR,
} from '../utils/loanCalculations';
import { AdminCharts } from './AdminCharts';
import { AdminReportsHub } from './AdminReportsHub';
import { EmiCalculator } from './EmiCalculator';
import { SocietyDashboard } from './SocietyDashboard';
import { MemberLoanProgressGraph } from './MemberLoanProgressGraph';
import { SocietyEmblem } from './SocietyEmblem';
import {
  Users,
  CreditCard,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  Search,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  Database,
  Download,
  Upload,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building,
  UserCheck,
  Printer,
  FileDown,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Coins,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  Receipt,
  Calculator,
  Globe,
  MapPin,
  Phone,
  Mail,
  Save,
  FileCheck,
  FileText,
  Image,
  Camera,
  Plus,
  Check,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Archive,
  RotateCcw
} from 'lucide-react';

interface AdminPanelProps {
  initialStep?: StepWorkflow;
  onOpenAddLoan: () => void;
  onOpenLedger: (loan: LoanRecord) => void;
  onOpenPaymentEntry: (loan: LoanRecord, emiNo?: number) => void;
  onOpenReceipt: (loan: LoanRecord, emi: EmiInstallment) => void;
  onOpenNotice: (loan: LoanRecord) => void;
  onOpenNoDuesNoc?: (loan?: LoanRecord) => void;
  onOpenPassbookControl?: () => void;
  onLogout?: () => void;
  onClose: () => void;
}

type StepWorkflow =
  | 'STEP0_DASHBOARD'
  | 'STEP_PASSBOOK_HUB'
  | 'STEP1_LOANS'
  | 'STEP2_PAYMENTS'
  | 'STEP3_DEFAULTERS'
  | 'STEP4_CALCULATOR'
  | 'STEP5_REPORTS'
  | 'STEP_ARCHIVE'
  | 'STEP6_BOARD_BACKUP'
  | 'STEP7_WEBSITE_SETTINGS';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  initialStep,
  onOpenAddLoan,
  onOpenLedger,
  onOpenPaymentEntry,
  onOpenReceipt,
  onOpenNotice,
  onOpenNoDuesNoc,
  onOpenPassbookControl,
  onLogout,
  onClose,
}) => {
  const {
    mode,
    setMode,
    loans,
    archivedLoans,
    allLoans,
    allLiveLoans,
    allDummyLoans,
    boardMembers,
    societyInfo,
    updateSocietyInfo,
    bannerSlides,
    updateBannerSlide,
    addBannerSlide,
    deleteBannerSlide,
    resetBannerSlides,
    frontPageConfig,
    updateFrontPageConfig,
    deleteLoan,
    archiveLoan,
    restoreLoan,
    deleteLoanPermanent,
    toggleLockLoan,
    toggleInstallmentLock,
    togglePassbookEnabled,
    addBoardMember,
    updateBoardMember,
    deleteBoardMember,
    exportBackupData,
    importBackupData,
    resetAllData,
  } = useSociety();

  const [activeStep, setActiveStep] = useState<StepWorkflow>(initialStep || 'STEP0_DASHBOARD');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Archive & Recalculation States
  const [loanToArchive, setLoanToArchive] = useState<LoanRecord | null>(null);
  const [archiveReason, setArchiveReason] = useState<string>('सदस्य द्वारा खाता बंद / हटाया गया');
  const [archiveSuccessMsg, setArchiveSuccessMsg] = useState<string | null>(null);
  const [loanToDeletePermanent, setLoanToDeletePermanent] = useState<LoanRecord | null>(null);
  const [archiveSearchFilter, setArchiveSearchFilter] = useState('');
  const [previewGraphLoan, setPreviewGraphLoan] = useState<LoanRecord | null>(null);

  useEffect(() => {
    if (initialStep) {
      setActiveStep(initialStep);
    }
  }, [initialStep]);

  // Dedicated Passbook Control Hub States
  const [passbookHubFilter, setPassbookHubFilter] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [passbookHubSearch, setPassbookHubSearch] = useState('');
  const [passbookHubToast, setPassbookHubToast] = useState<string | null>(null);

  // Website & Branch Contact Form State
  const [contactForm, setContactForm] = useState({
    phone: societyInfo.phone,
    email: societyInfo.email,
    address: societyInfo.address,
    workingHours: societyInfo.workingHours,
    regNo: societyInfo.regNo,
    tagline: societyInfo.tagline,
    shortName: societyInfo.shortName,
  });
  const [contactSaveMessage, setContactSaveMessage] = useState('');

  useEffect(() => {
    setContactForm({
      phone: societyInfo.phone,
      email: societyInfo.email,
      address: societyInfo.address,
      workingHours: societyInfo.workingHours,
      regNo: societyInfo.regNo,
      tagline: societyInfo.tagline,
      shortName: societyInfo.shortName,
    });
  }, [societyInfo]);

  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSocietyInfo(contactForm);
    setContactSaveMessage('✓ वेबसाइट व संपर्क विवरण सफलतापूर्वक अपडेट कर दिया गया है!');
    setTimeout(() => setContactSaveMessage(''), 4000);
  };

  // Board Member Form State
  const [isAddingBoardMember, setIsAddingBoardMember] = useState(false);
  const [editingBoardMember, setEditingBoardMember] = useState<BoardMember | null>(null);
  const [bmName, setBmName] = useState('');
  const [bmDesignation, setBmDesignation] = useState('संचालक');
  const [bmRole, setBmRole] = useState<BoardMember['role']>('SANCHALAK');
  const [bmPhone, setBmPhone] = useState('');
  const [bmPhotoUrl, setBmPhotoUrl] = useState('');

  // Step 2 Payment Member Selector State
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentSelectedLoanId, setPaymentSelectedLoanId] = useState<string>('');
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState<'ALL' | 'ACTIVE' | 'DUES' | 'CLOSED'>('ALL');

  // Step 7 Website, Banner & Content Editor State
  const [websiteActiveTab, setWebsiteActiveTab] = useState<'BANNER' | 'FRONT_CONTENT' | 'CONTACT'>('BANNER');
  const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    badgeText: '',
    imageUrl: '',
    buttonText: 'सदस्य ऑनलाइन पासबुक',
    buttonAction: 'PASSBOOK' as BannerSlide['buttonAction'],
    secondaryButtonText: 'ऋण कैलकुलेटर व स्लैब',
    secondaryButtonAction: 'CALCULATOR' as BannerSlide['buttonAction'],
    accentColor: 'amber',
    isActive: true,
  });
  const [slideSaveMessage, setSlideSaveMessage] = useState('');

  const [frontForm, setFrontForm] = useState<FrontPageConfig>(frontPageConfig);
  const [frontSaveMessage, setFrontSaveMessage] = useState('');

  useEffect(() => {
    setFrontForm(frontPageConfig);
  }, [frontPageConfig]);

  // Backup state
  const [backupJsonInput, setBackupJsonInput] = useState('');
  const [backupMessage, setBackupMessage] = useState('');

  // Core Comprehensive Tracking metrics
  const stats = calculateComprehensiveStats(loans);

  // Filtered loans
  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.borrowerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loan.membershipNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loan.accountNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loan.phone.includes(searchFilter);

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'REGULAR') return classifyBorrower(loan) === 'REGULAR';
    if (statusFilter === 'WATCHLIST') return classifyBorrower(loan) === 'WATCHLIST';
    if (statusFilter === 'DEFAULTER') return classifyBorrower(loan) === 'DEFAULTER';
    if (statusFilter === 'CLOSED') return loan.status === 'CLOSED';
    return true;
  });

  // Defaulters list (consecutive 3 missed installments)
  const defaulterLoans = loans.filter((loan) => classifyBorrower(loan) === 'DEFAULTER');

  // Filtered archived loans (excluded from all society financial calculations)
  const filteredArchivedLoans = archivedLoans.filter((loan) => {
    if (!archiveSearchFilter.trim()) return true;
    const q = archiveSearchFilter.toLowerCase().trim();
    return (
      loan.borrowerName.toLowerCase().includes(q) ||
      loan.membershipNo.toLowerCase().includes(q) ||
      loan.accountNo.toLowerCase().includes(q) ||
      loan.phone.includes(q) ||
      (loan.archivedReason && loan.archivedReason.toLowerCase().includes(q))
    );
  });

  // Export handlers
  const exportLoansCSV = () => {
    const headers = [
      'सदस्यता क्र.',
      'खाता क्र.',
      'ऋणी का नाम',
      'मोबाइल',
      'पता',
      'ऋण राशि',
      'ऋण तिथि',
      'अवधि (माह)',
      'जमा मूलधन',
      'शेष मूलधन',
      'जमानतदार 1',
      'जमानतदार 1 चेक',
      'जमानतदार 2',
      'जमानतदार 2 चेक',
      'स्थिति',
    ];

    const rows = loans.map((l) => {
      const tot = calculateInstallmentTotals(l.installments);
      const remaining = Math.max(0, l.loanAmount - tot.totalPaidPrincipal);
      return [
        l.membershipNo,
        l.accountNo,
        l.borrowerName,
        l.phone,
        l.address,
        l.loanAmount,
        l.loanDate,
        l.tenureMonths,
        tot.totalPaidPrincipal,
        remaining,
        l.guarantor1?.name || '',
        l.guarantor1?.chequeNo || '',
        l.guarantor2?.name || '',
        l.guarantor2?.chequeNo || '',
        classifyBorrower(l),
      ];
    });

    exportToCSV(`samajotthan-sai-loans-${new Date().toISOString().split('T')[0]}.csv`, [
      headers,
      ...rows,
    ]);
  };

  const handleSaveBoardMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmName.trim()) return;

    if (editingBoardMember) {
      updateBoardMember({
        ...editingBoardMember,
        name: bmName.trim(),
        designationHindi: bmDesignation.trim(),
        role: bmRole,
        phone: bmPhone.trim(),
        photoUrl: bmPhotoUrl.trim() || undefined,
      });
      setEditingBoardMember(null);
    } else {
      addBoardMember({
        name: bmName.trim(),
        designationHindi: bmDesignation.trim(),
        role: bmRole,
        phone: bmPhone.trim(),
        photoUrl: bmPhotoUrl.trim() || undefined,
        order: boardMembers.length + 1,
      });
    }

    setBmName('');
    setBmDesignation('संचालक');
    setBmRole('SANCHALAK');
    setBmPhone('');
    setBmPhotoUrl('');
    setIsAddingBoardMember(false);
  };

  const handleStartEditBoardMember = (bm: BoardMember) => {
    setEditingBoardMember(bm);
    setBmName(bm.name);
    setBmDesignation(bm.designationHindi);
    setBmRole(bm.role);
    setBmPhone(bm.phone || '');
    setBmPhotoUrl(bm.photoUrl || '');
    setIsAddingBoardMember(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.title.trim()) return;

    if (editingSlide) {
      updateBannerSlide({
        ...editingSlide,
        title: slideForm.title.trim(),
        subtitle: slideForm.subtitle.trim(),
        description: slideForm.description.trim(),
        badgeText: slideForm.badgeText.trim(),
        imageUrl: slideForm.imageUrl.trim(),
        buttonText: slideForm.buttonText.trim(),
        buttonAction: slideForm.buttonAction,
        secondaryButtonText: slideForm.secondaryButtonText.trim(),
        secondaryButtonAction: slideForm.secondaryButtonAction,
        accentColor: slideForm.accentColor,
        isActive: slideForm.isActive,
      });
      setSlideSaveMessage('✓ बैनर स्लाइड सफलतापूर्वक अपडेट हो गई!');
      setEditingSlide(null);
    } else {
      addBannerSlide({
        title: slideForm.title.trim(),
        subtitle: slideForm.subtitle.trim(),
        description: slideForm.description.trim(),
        badgeText: slideForm.badgeText.trim(),
        imageUrl:
          slideForm.imageUrl.trim() ||
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
        buttonText: slideForm.buttonText.trim(),
        buttonAction: slideForm.buttonAction,
        secondaryButtonText: slideForm.secondaryButtonText.trim(),
        secondaryButtonAction: slideForm.secondaryButtonAction,
        accentColor: slideForm.accentColor,
        isActive: slideForm.isActive,
        order: (bannerSlides?.length || 0) + 1,
      });
      setSlideSaveMessage('✓ नई बैनर स्लाइड सफलतापूर्वक जोड़ी गई!');
    }

    setTimeout(() => setSlideSaveMessage(''), 3500);
    setIsAddingSlide(false);
  };

  const handleStartEditSlide = (slide: BannerSlide) => {
    setEditingSlide(slide);
    setSlideForm({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description || '',
      badgeText: slide.badgeText || '',
      imageUrl: slide.imageUrl || '',
      buttonText: slide.buttonText,
      buttonAction: slide.buttonAction,
      secondaryButtonText: slide.secondaryButtonText || '',
      secondaryButtonAction: slide.secondaryButtonAction || 'CALCULATOR',
      accentColor: slide.accentColor || 'amber',
      isActive: slide.isActive,
    });
    setIsAddingSlide(true);
  };

  const handleSaveFrontContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateFrontPageConfig(frontForm);
    setFrontSaveMessage('✓ फ्रंट पेज की सामग्री सफलतापूर्वक अद्यतन (Save) हो गई!');
    setTimeout(() => setFrontSaveMessage(''), 4000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samajotthan-sai-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage('डेटा बैकअप फ़ाइल (.json) सफलतापूर्वक डाउनलोड हो गई।');
  };

  const handleImportBackup = () => {
    if (!backupJsonInput.trim()) {
      setBackupMessage('कृपया बैकअप JSON डेटा पेस्ट करें।');
      return;
    }
    const success = importBackupData(backupJsonInput);
    if (success) {
      setBackupMessage('बैकअप डेटा सफलतापूर्वक पुनर्स्थापित हो गया है।');
      setBackupJsonInput('');
    } else {
      setBackupMessage('त्रुटि: अमान्य JSON प्रारूप।');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top Banner: LIVE VS DUMMY ISOLATION */}
      <div
        className={`px-4 sm:px-6 py-2.5 text-xs font-bold transition-colors border-b ${
          mode === 'LIVE'
            ? 'bg-emerald-950 text-emerald-100 border-emerald-900'
            : 'bg-amber-900 text-amber-100 border-amber-800'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                mode === 'LIVE' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>
              {mode === 'LIVE'
                ? 'लाइव सहकारी डेटा मोड: वास्तविक सदस्य लेजर बही सुरक्षित व लॉक्ड है।'
                : 'चेतावनी: डमी / टेस्ट मोड सक्रिय है। यह वास्तविक संस्थागत गणनाओं में नहीं जुड़ेगा।'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-normal opacity-90">कार्य मोड:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-black/40 border border-white/20">
              <button
                onClick={() => setMode('LIVE')}
                className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                  mode === 'LIVE'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                लाइव डेटा ({allLiveLoans.length})
              </button>
              <button
                onClick={() => setMode('DUMMY')}
                className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                  mode === 'DUMMY'
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                डमी टेस्ट ({allDummyLoans.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Executive Header Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SocietyEmblem size="sm" showText={false} />
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="sm:hidden px-2.5 py-1.5 rounded-xl bg-slate-800 text-amber-400 hover:text-white cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-slate-700"
              title="बायां मेनू खोलें / बंद करें"
            >
              {isMobileSidebarOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4" />}
              <span>{isMobileSidebarOpen ? 'मेनू छुपाएं' : '📌 बायां मेनू खोलें'}</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                  {societyInfo.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                  व्यवस्थापक कंसोल
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                पंजीयन क्र. {societyInfo.regNo} • ऋण लेखा, वसूली एवं कानूनी ऑडिट केंद्र
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Passbook Control on Header */}
            <button
              onClick={() => {
                setActiveStep('STEP_PASSBOOK_HUB');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs border ${
                activeStep === 'STEP_PASSBOOK_HUB'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-400 ring-2 ring-rose-400/30'
                  : 'bg-rose-950/90 hover:bg-rose-900 text-rose-200 border-rose-700'
              }`}
              title="वेबसाइट पर किसकी पासबुक दिखाना है तय करें"
            >
              <Eye className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
              <span>🎯 पासबुक कंट्रोल</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-mono font-bold">
                {loans.filter((l) => l.passbookEnabled).length} चालू
              </span>
            </button>

            {/* Quick Add Loan */}
            <button
              onClick={onOpenAddLoan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">नया ऋण</span>
            </button>

            {/* Logout and Return */}
            <button
              onClick={onLogout || onClose}
              className="px-3 py-1.5 rounded-xl border border-rose-800 bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="प्रशासक सत्र समाप्त करें एवं वेबसाइट पर लौटें"
            >
              <span>🚪 लॉगआउट ✕</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Side Panel + Right Content Area */}
      <div className="flex flex-col sm:flex-row min-h-[calc(100vh-85px)] bg-slate-100 relative">
        {/* LEFT SIDE PANEL (Sidebar Menu) */}
        <aside
          className={`w-full sm:w-72 md:w-80 lg:w-84 shrink-0 bg-slate-950 text-white border-r-2 border-slate-800 sm:sticky sm:top-[45px] sm:h-[calc(100vh-45px)] flex flex-col justify-between overflow-y-auto z-20 transition-all ${
            isMobileSidebarOpen ? 'block' : 'hidden sm:flex'
          }`}
        >
          {/* Menu Items Container */}
          <div className="p-3.5 space-y-4">
            {/* Sidebar Branding Header */}
            <div className="p-3 bg-slate-900 border border-slate-800 flex items-center justify-between rounded-2xl mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-black text-xs text-amber-400 tracking-wide uppercase">
                  📌 एडमिन बायां कंट्रोल मेनू
                </span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                मेनू विकल्प
              </span>
            </div>
            {/* Section 1: Priority Feature: PASSBOOK CONTROL (Bright, High-Contrast Card) */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-rose-400 px-2 block">
                ⭐ मुख्य वेबसाइट पासबुक नियंत्रण
              </span>

              <button
                onClick={() => {
                  setActiveStep('STEP_PASSBOOK_HUB');
                }}
                className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md border-2 ${
                  activeStep === 'STEP_PASSBOOK_HUB'
                    ? 'bg-gradient-to-r from-rose-700 to-pink-700 text-white border-rose-300 ring-2 ring-rose-500/40 shadow-rose-950/50 scale-[1.02]'
                    : 'bg-rose-950/80 hover:bg-rose-900 text-rose-100 border-rose-500/70 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
                    <Eye className="w-5 h-5 text-pink-200 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm text-white leading-tight flex items-center gap-1.5">
                      <span>🎯 पासबुक कंट्रोल</span>
                    </div>
                    <div className="text-[11px] text-rose-200 truncate mt-0.5 font-semibold">
                      वेबसाइट पर किसकी दिखेगी
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-black bg-emerald-500 text-slate-950 block shadow-xs">
                    {loans.filter((l) => l.passbookEnabled).length} चालू
                  </span>
                  <span className="text-[9px] text-rose-300 font-bold block mt-0.5">
                    कुल {loans.length}
                  </span>
                </div>
              </button>
            </div>

            {/* Section 2: Core Admin Workflow Menu (Numbered Steps) */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2 block">
                📋 संस्था प्रशासनिक मेनू (Admin Menu)
              </span>

              {/* Step 0: Dashboard */}
              <button
                onClick={() => {
                  setActiveStep('STEP0_DASHBOARD');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  activeStep === 'STEP0_DASHBOARD'
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>संस्था डैशबोर्ड (Dashboard)</span>
                </div>
              </button>

              {/* Step 1: Loans */}
              <button
                onClick={() => {
                  setActiveStep('STEP1_LOANS');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  activeStep === 'STEP1_LOANS'
                    ? 'bg-slate-800 text-white shadow-md ring-2 ring-slate-700 border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  <span>ऋण खाते व लेजर बही</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                  {loans.length}
                </span>
              </button>

              {/* Step 2: Payments */}
              <button
                onClick={() => {
                  setActiveStep('STEP2_PAYMENTS');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  activeStep === 'STEP2_PAYMENTS'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                    2
                  </span>
                  <span>किश्त वसूली व रसीद (Multi-EMI)</span>
                </div>
              </button>

              {/* Step 3: Defaulters */}
              <button
                onClick={() => {
                  setActiveStep('STEP3_DEFAULTERS');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  activeStep === 'STEP3_DEFAULTERS'
                    ? 'bg-rose-700 text-white shadow-md ring-2 ring-rose-600/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-rose-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                    3
                  </span>
                  <span>डिफ़ॉल्टर व मांग नोटिस</span>
                </div>
                {defaulterLoans.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-mono font-black text-white">
                    {defaulterLoans.length}
                  </span>
                )}
              </button>

              {/* Step 4: Calculator */}
              <button
                onClick={() => {
                  setActiveStep('STEP4_CALCULATOR');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeStep === 'STEP4_CALCULATOR'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                  4
                </span>
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>ऋण व ईएमआई कैलकुलेटर</span>
              </button>

              {/* Step 5: Reports */}
              <button
                onClick={() => {
                  setActiveStep('STEP5_REPORTS');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeStep === 'STEP5_REPORTS'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-blue-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                  5
                </span>
                <span>वित्तीय चार्ट व ऑडिट रिपोर्ट</span>
              </button>

              {/* Step 6: Archived Loans Hub */}
              <button
                onClick={() => {
                  setActiveStep('STEP_ARCHIVE');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  activeStep === 'STEP_ARCHIVE'
                    ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-600/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                    6
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                    <span>आर्काइव ऋण फ़ाइल</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    archivedLoans.length > 0
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {archivedLoans.length}
                </span>
              </button>

              {/* Step 7: Board & Backup */}
              <button
                onClick={() => {
                  setActiveStep('STEP6_BOARD_BACKUP');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeStep === 'STEP6_BOARD_BACKUP'
                    ? 'bg-slate-700 text-white shadow-md ring-2 ring-slate-600'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-slate-500 text-white flex items-center justify-center text-[10px] font-black">
                  7
                </span>
                <span>संचालक मंडल व डेटा लॉक</span>
              </button>

              {/* Step 8: Website Settings */}
              <button
                onClick={() => {
                  setActiveStep('STEP7_WEBSITE_SETTINGS');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeStep === 'STEP7_WEBSITE_SETTINGS'
                    ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-purple-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                  8
                </span>
                <Globe className="w-3.5 h-3.5 text-purple-300" />
                <span>वेबसाइट व संपर्क सेटिंग्स</span>
              </button>
            </div>

            {/* Section 3: Quick Administrative Tools */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2 block">
                ⚡ त्वरित कार्य (Quick Tools)
              </span>

              {onOpenNoDuesNoc && (
                <button
                  onClick={() => onOpenNoDuesNoc()}
                  className="w-full text-left px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                  title="No Dues (अदेयता) व NOC प्रमाण पत्र जारी करें"
                >
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>No Dues / NOC जारी करें</span>
                </button>
              )}

              <button
                onClick={exportLoansCSV}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                title="समस्त ऋण डाटा CSV/एक्सेल में डाउनलोड करें"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>समस्त डेटा CSV निर्यात</span>
              </button>

              <button
                onClick={onOpenAddLoan}
                className="w-full text-left px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>नया ऋण स्वीकृत करें</span>
              </button>
            </div>
          </div>

          {/* Left Panel Bottom Info */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-950 text-slate-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-200">
                  {societyInfo.shortName || 'साईं साख संस्था'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  पंजीयन: {societyInfo.regNo}
                </div>
              </div>
              <button
                onClick={onLogout || onClose}
                className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-[11px] font-bold border border-rose-800 cursor-pointer"
                title="प्रशासक सत्र समाप्त करें (लॉगआउट)"
              >
                लॉगआउट ✕
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-7 space-y-6 overflow-y-auto">
          {/* ARCHIVE / RECALCULATION SUCCESS TOAST */}
          {archiveSuccessMsg && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 flex items-center justify-between gap-3 shadow-md animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="font-extrabold text-xs sm:text-sm">{archiveSuccessMsg}</p>
              </div>
              <button
                onClick={() => setArchiveSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

        {/* STEP 0: DEDICATED SOCIETY DASHBOARD (NO TABLE) */}
        {activeStep === 'STEP0_DASHBOARD' && (
          <SocietyDashboard
            loans={loans}
            societyInfo={societyInfo}
            mode={mode}
            onNavigateToStep={(step) => setActiveStep(step)}
            onOpenAddLoan={onOpenAddLoan}
            onTogglePassbookEnabled={togglePassbookEnabled}
          />
        )}

        {/* STEP PASSBOOK HUB: DEDICATED CENTRAL PASSBOOK VISIBILITY CONTROL */}
        {activeStep === 'STEP_PASSBOOK_HUB' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Header Banner */}
            <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-rose-500/40 relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/30 text-pink-300 border border-rose-400/40 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-pink-300" />
                      एक ही जगह से संपूर्ण नियंत्रण (Single Central Control Hub)
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {loans.filter((l) => l.passbookEnabled).length} / {loans.length} वेबसाइट पर सक्रिय
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                    🎯 ऑनलाइन पासबुक दृश्यता कंट्रोल (किसकी पासबुक दिखाना है)
                  </h2>
                  <p className="text-xs sm:text-sm text-rose-200/90 max-w-3xl leading-relaxed">
                    यहाँ से आप तय कर सकते हैं कि मुख्य वेबसाइट के फ्रंट पेज पर किस-किस सदस्य की पासबुक दिखेगी और किसकी बंद रहेगी। जिस सदस्य के आगे <strong>'वेबसाइट पर चालू'</strong> होगा, केवल उसी का नाम फ्रंट पेज ड्रॉपडाउन में आएगा और उसी का खाता सर्च करने पर पासबुक खुलेगी।
                  </p>
                </div>

                {/* Bulk Actions */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      loans.forEach((l) => {
                        if (!l.passbookEnabled) togglePassbookEnabled(l.id);
                      });
                      setPassbookHubToast('🟢 सभी सदस्यों की पासबुक मुख्य वेबसाइट पर चालू कर दी गई है!');
                      setTimeout(() => setPassbookHubToast(null), 3500);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    title="सभी सदस्यों की पासबुक एक क्लिक में चालू करें"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>सभी की चालू करें (Enable All)</span>
                  </button>

                  <button
                    onClick={() => {
                      loans.forEach((l) => {
                        if (l.passbookEnabled) togglePassbookEnabled(l.id);
                      });
                      setPassbookHubToast('🔴 सभी सदस्यों की पासबुक मुख्य वेबसाइट पर बंद कर दी गई है!');
                      setTimeout(() => setPassbookHubToast(null), 3500);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    title="सभी सदस्यों की पासबुक एक क्लिक में बंद करें"
                  >
                    <XCircle className="w-4 h-4 text-rose-200" />
                    <span>सभी की बंद करें (Disable All)</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
                    title="फ्रंट पेज पर परिणाम देखने के लिए वेबसाइट पर लौटें"
                  >
                    <span>वेबसाइट पर देखें →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Toast message */}
            {passbookHubToast && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-black text-xs flex items-center gap-2.5 animate-fadeIn shadow-sm">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{passbookHubToast}</span>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setPassbookHubFilter('ALL')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    passbookHubFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  सभी सदस्य ({loans.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPassbookHubFilter('ENABLED')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    passbookHubFilter === 'ENABLED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>केवल वेबसाइट पर चालू ({loans.filter((l) => l.passbookEnabled).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPassbookHubFilter('DISABLED')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    passbookHubFilter === 'DISABLED'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-rose-800 hover:bg-rose-50'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>केवल बंद ({loans.filter((l) => !l.passbookEnabled).length})</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="सदस्य का नाम, खाता क्र. (जैसे SB-2023-0213) या फोन से खोजें..."
                  value={passbookHubSearch}
                  onChange={(e) => setPassbookHubSearch(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            {/* List of Members with Big, Obvious Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans
                .filter((l) => {
                  if (passbookHubFilter === 'ENABLED' && !l.passbookEnabled) return false;
                  if (passbookHubFilter === 'DISABLED' && l.passbookEnabled) return false;
                  if (!passbookHubSearch.trim()) return true;
                  const q = passbookHubSearch.toLowerCase().trim();
                  return (
                    l.borrowerName.toLowerCase().includes(q) ||
                    l.accountNo.toLowerCase().includes(q) ||
                    l.membershipNo.toLowerCase().includes(q) ||
                    l.phone.includes(q)
                  );
                })
                .map((loan) => {
                  const isEnabled = loan.passbookEnabled ?? false;
                  return (
                    <div
                      key={loan.id}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 shadow-sm ${
                        isEnabled
                          ? 'bg-white border-emerald-400 ring-2 ring-emerald-300/40 shadow-emerald-100/50'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {/* Top: Member Meta */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
                              खाता: {loan.accountNo}
                            </span>
                            <span className="text-xs font-mono text-slate-500">
                              सदस्यता #{loan.membershipNo}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-black text-slate-950 mt-1">
                            {loan.borrowerName}
                          </h3>

                          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 pt-0.5">
                            <span>मो.: <strong className="font-mono text-slate-900">{loan.phone}</strong></span>
                            <span>•</span>
                            <span>स्वीकृत ऋण: <strong className="font-mono text-slate-900">{formatINR(loan.loanAmount)}</strong> ({loan.tenureMonths} माह)</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isEnabled ? (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>वेबसाइट पर चालू</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1.5">
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>वेबसाइट पर बंद</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        {/* Big Primary Toggle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            togglePassbookEnabled(loan.id);
                            setPassbookHubToast(
                              isEnabled
                                ? `🔴 '${loan.borrowerName}' की पासबुक वेबसाइट पर बंद कर दी गई है।`
                                : `🟢 '${loan.borrowerName}' की पासबुक वेबसाइट पर चालू कर दी गई है!`
                            );
                            setTimeout(() => setPassbookHubToast(null), 3000);
                          }}
                          className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
                            isEnabled
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isEnabled ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              <span>वेबसाइट से हटाएं (पासबुक बंद करें)</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>वेबसाइट पर दिखाएं (पासबुक चालू करें)</span>
                            </>
                          )}
                        </button>

                        {/* Live Preview Button */}
                        <button
                          type="button"
                          onClick={() => onOpenLedger(loan)}
                          className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                          title="इस सदस्य की विस्तृत लेजर बही खोलें"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                          <span>लेजर देखें</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* STEP 1: LOAN ACCOUNTS & HIGH-CONTRAST LEDGER TABLE */}
        {activeStep === 'STEP1_LOANS' && (
          <div className="space-y-5">
            {/* 🌐 PROMINENT PASSBOOK VISIBILITY PERMISSION BANNER */}
            <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 p-4 sm:p-5 rounded-3xl border-2 border-rose-300 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-600 text-white rounded-xl">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-950 flex items-center gap-2">
                      <span>🌐 वेबसाइट पासबुक बटन: किसकी पासबुक वेबसाइट पर दिखाना है?</span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {loans.filter((l) => l.passbookEnabled).length} / {loans.length} सक्रिय
                      </span>
                    </h3>
                    <p className="text-xs text-rose-900 font-medium mt-0.5">
                      यहाँ दिए गए <strong>चालू / बंद</strong> बटन पर क्लिक करके तुरंत तय करें कि फ्रंट पेज पर किस सदस्य की पासबुक दिखेगी।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      loans.forEach((l) => {
                        if (!l.passbookEnabled) togglePassbookEnabled(l.id);
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    सबकी चालू करें
                  </button>
                  <button
                    onClick={() => {
                      loans.forEach((l) => {
                        if (l.passbookEnabled) togglePassbookEnabled(l.id);
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    सबकी बंद करें
                  </button>
                </div>
              </div>

              {/* Members Quick Toggle Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {loans.map((l) => (
                  <div
                    key={l.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                      l.passbookEnabled
                        ? 'bg-white border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                        : 'bg-white/60 border-slate-300 text-slate-500'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-slate-950 truncate">
                        {l.borrowerName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        खाता: {l.accountNo}
                      </div>
                    </div>

                    <button
                      onClick={() => togglePassbookEnabled(l.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs ${
                        l.passbookEnabled
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
                          : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
                      }`}
                      title={l.passbookEnabled ? 'पासबुक चालू है - बंद करने के लिए क्लिक करें' : 'पासबुक बंद है - चालू करने के लिए क्लिक करें'}
                    >
                      {l.passbookEnabled ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>🟢 चालू</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-rose-700" />
                          <span>⚪ बंद</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Control Strip */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="नाम, सदस्यता क्र., खाता नंबर..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-slate-50"
                  />
                </div>

                <div className="relative w-full sm:w-64">
                  <select
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full p-2 pr-7 border rounded-xl text-xs bg-white font-semibold text-slate-800 appearance-none truncate"
                  >
                    <option value="">-- सदस्य ड्रॉपडाउन सूची ({loans.length}) --</option>
                    {loans.map((l) => (
                      <option key={l.id} value={l.borrowerName}>
                        #{l.membershipNo} - {l.borrowerName} ({l.accountNo})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                {onOpenNoDuesNoc && (
                  <button
                    onClick={() => onOpenNoDuesNoc()}
                    className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="No Dues व NOC प्रमाण पत्र"
                  >
                    <Award className="w-3.5 h-3.5 text-purple-700" />
                    <span>No Dues / NOC</span>
                  </button>
                )}

                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">फ़िल्टर:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-xs bg-white font-semibold shrink-0"
                >
                  <option value="ALL">सभी सक्रिय खाते ({loans.length})</option>
                  <option value="REGULAR">नियमित सही देने वाले ({stats.sahiSeDeneWale})</option>
                  <option value="WATCHLIST">विलंबित (दिक्कत वाले) ({stats.dikkatKarneWale})</option>
                  <option value="DEFAULTER">डिफ़ॉल्टर (3+ मिस) ({stats.defaultersCount})</option>
                  <option value="CLOSED">पूर्ण चुकता ({stats.closedCount})</option>
                </select>

                <button
                  onClick={() => setActiveStep('STEP_ARCHIVE')}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="आर्काइव में हटाए गए ऋण खाते देखें"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-700" />
                  <span>📦 आर्काइव फ़ाइल ({archivedLoans.length})</span>
                </button>
              </div>
            </div>

            {/* HIGH-PRECISION ATTRACTIVE TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-white font-bold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">सदस्यता क्र.</th>
                      <th className="p-3.5">ऋणी का नाम व मोबाइल</th>
                      <th className="p-3.5 text-center bg-rose-950 text-pink-200">वेबसाइट पासबुक</th>
                      <th className="p-3.5">स्वीकृत ऋण</th>
                      <th className="p-3.5">अवधि व तिथि</th>
                      <th className="p-3.5">2 साख जमानतदार</th>
                      <th className="p-3.5 text-right">वसूल मूलधन</th>
                      <th className="p-3.5 text-right">शेष मूलधन</th>
                      <th className="p-3.5 text-center">स्थिति</th>
                      <th className="p-3.5 text-center">चरणबद्ध कार्रवाई (Next Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredLoans.map((loan) => {
                      const lTotals = calculateInstallmentTotals(loan.installments);
                      const outstanding = Math.max(0, loan.loanAmount - lTotals.totalPaidPrincipal);
                      const cat = classifyBorrower(loan);

                      return (
                        <tr key={loan.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                            #{loan.membershipNo}
                            <span className="block text-[10px] text-slate-500 font-normal">
                              {loan.accountNo}
                            </span>
                          </td>

                          <td className="p-3.5 font-sans">
                            <strong className="text-slate-950 text-xs block font-bold">
                              {loan.borrowerName}
                            </strong>
                            <span className="text-slate-500 text-[10px] font-mono">
                              {loan.phone}
                            </span>
                          </td>

                          {/* Front Passbook Visibility Toggle Button (Column 3 - High Visibility) */}
                          <td className="p-3.5 text-center font-sans bg-rose-50/50">
                            <button
                              onClick={() => togglePassbookEnabled(loan.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-xs ${
                                loan.passbookEnabled
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300'
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
                                  <span>🟢 चालू (On)</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-rose-700" />
                                  <span>⚪ बंद (Off)</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="p-3.5 font-bold text-slate-900 text-xs">
                            {formatINR(loan.loanAmount)}
                          </td>

                          <td className="p-3.5 whitespace-nowrap font-sans text-slate-700">
                            <strong>{loan.tenureMonths} माह</strong>
                            <span className="block text-slate-500 text-[10px] font-mono">
                              {loan.loanDate}
                            </span>
                          </td>

                          <td className="p-3.5 font-sans text-[10px] text-slate-700">
                            <div>1. {loan.guarantor1?.name}</div>
                            <div>2. {loan.guarantor2?.name}</div>
                          </td>

                          <td className="p-3.5 text-right font-bold text-emerald-700">
                            ₹ {lTotals.totalPaidPrincipal.toFixed(2)}
                          </td>

                          <td className="p-3.5 text-right font-bold text-amber-800">
                            ₹ {outstanding.toFixed(2)}
                          </td>

                          <td className="p-3.5 text-center font-sans">
                            {cat === 'DEFAULTER' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                डिफ़ॉल्टर
                              </span>
                            ) : cat === 'WATCHLIST' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                विलंबित
                              </span>
                            ) : loan.status === 'CLOSED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                चुकता
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                नियमित
                              </span>
                            )}
                          </td>


                          {/* Sequential, unconfusing action buttons */}
                          <td className="p-3.5 text-center whitespace-nowrap font-sans">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Action 1: View Ledger */}
                              <button
                                onClick={() => onOpenLedger(loan)}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] transition-colors cursor-pointer"
                                title="Image 1, 2, 3 अनुसार पूर्ण लेजर देखें"
                              >
                                1. लेजर
                              </button>

                              {/* Action 1.5: Member Loan Progress Graph */}
                              <button
                                onClick={() => setPreviewGraphLoan(loan)}
                                className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-950 border border-rose-300 font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                                title="ऋण विश्लेषण ग्राफ़: इतना लिया था, इतना दिया, अब इतना बचा"
                              >
                                <TrendingUp className="w-3 h-3 text-rose-700" />
                                <span>ग्राफ़</span>
                              </button>

                              {/* Action 2: Collect EMI */}
                              <button
                                onClick={() => onOpenPaymentEntry(loan)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                                title="किश्त जमा करें (एक या अधिक)"
                              >
                                2. किश्त जमा
                              </button>

                              {/* Action 3: Notice if Defaulter */}
                              {cat === 'DEFAULTER' && (
                                <button
                                  onClick={() => onOpenNotice(loan)}
                                  className="px-2 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] transition-colors cursor-pointer"
                                  title="वसूली मांग सूचना पत्र प्रिंट करें"
                                >
                                  3. नोटिस
                                </button>
                              )}

                              {/* Action 3.5: No Dues / NOC if Zero Balance */}
                              {(outstanding <= 0.01 || loan.status === 'CLOSED') && onOpenNoDuesNoc && (
                                <button
                                  onClick={() => onOpenNoDuesNoc(loan)}
                                  className="px-2 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] transition-colors cursor-pointer"
                                  title="No Dues (अदेय) व NOC प्रमाण पत्र"
                                >
                                  No Dues
                                </button>
                              )}

                              {/* Action 4: Archive / Remove Loan */}
                              <button
                                onClick={() => {
                                  setLoanToArchive(loan);
                                  setArchiveReason('सदस्य द्वारा खाता बंद / हटाया गया');
                                }}
                                className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                                title="ऋण खाता हटाएं / आर्काइव करें (वित्तीय गणना से बाहर)"
                              >
                                <Archive className="w-3 h-3 text-amber-800" />
                                <span>हटाएं / आर्काइव</span>
                              </button>

                              {/* Action 5: Toggle Lock */}
                              <button
                                onClick={() => toggleLockLoan(loan.id)}
                                className="p-1 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                                title={loan.isLocked ? 'लॉक्ड सुरक्षित' : 'अनलॉक्ड'}
                              >
                                {loan.isLocked ? (
                                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Unlock className="w-3.5 h-3.5 text-amber-600" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* MANDATORY FOOTER TOTAL FOR EVERY REPORT */}
                  <tfoot className="bg-slate-900 text-white font-mono font-bold text-[11px]">
                    <tr>
                      <td className="p-3.5 font-sans" colSpan={3}>
                        कुल योग ({filteredLoans.length} खाते)
                      </td>
                      <td className="p-3.5">
                        {formatINR(filteredLoans.reduce((a, b) => a + b.loanAmount, 0))}
                      </td>
                      <td className="p-3.5" colSpan={2}>—</td>
                      <td className="p-3.5 text-right text-emerald-400">
                        ₹{' '}
                        {filteredLoans
                          .reduce(
                            (a, b) =>
                              a + calculateInstallmentTotals(b.installments).totalPaidPrincipal,
                            0
                          )
                          .toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right text-amber-300">
                        ₹{' '}
                        {filteredLoans
                          .reduce(
                            (a, b) =>
                              a +
                              Math.max(
                                0,
                                b.loanAmount -
                                  calculateInstallmentTotals(b.installments).totalPaidPrincipal
                              ),
                            0
                          )
                          .toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center" colSpan={2}>—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Step 1 Guided Action to Step 2 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                चरण 1 पूर्ण • कुल {filteredLoans.length} ऋण खाते एवं लेजर बही
              </span>
              <button
                onClick={() => setActiveStep('STEP2_PAYMENTS')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <span>अगला चरण 2: किश्त वसूली व रसीद (Multi-EMI) ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MULTI-EMI COLLECTION & RECEIPT HUB */}
        {activeStep === 'STEP2_PAYMENTS' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-900 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-emerald-950">
                  चरण 2: किश्त वसूली एवं बहु-किश्त भुगतान सुविधा (Multi-EMI Collection)
                </h3>
                <p className="mt-0.5 text-emerald-800">
                  सदस्य जितनी भी किश्तें (1, 2, 3...) अथवा एकमुश्त राशि (Lump-Sum) जमा करना चाहें, खाता चुनकर सीधे "किश्त जमा" पर क्लिक करें।
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold font-mono">
                14% घटते क्रम ब्याज
              </span>
            </div>

            {/* MEMBER DROPDOWN & INSTANT FILTER SECTION */}
            <div className="bg-white rounded-2xl border-2 border-emerald-300 p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>सदस्य त्वरित खोज एवं ड्रॉपडाउन चयन (Select Member to Collect / View)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    जिस भी सदस्य का पैसा जमा करना हो या खाता देखना हो, ड्रॉपडाउन अथवा खोज द्वारा तुरंत चुनें।
                  </p>
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => {
                      setPaymentCategoryFilter('ALL');
                      setPaymentSelectedLoanId('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      paymentCategoryFilter === 'ALL'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    सभी ({loans.length})
                  </button>
                  <button
                    onClick={() => {
                      setPaymentCategoryFilter('ACTIVE');
                      setPaymentSelectedLoanId('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      paymentCategoryFilter === 'ACTIVE'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    सक्रिय चालू ({loans.filter((l) => l.status === 'ACTIVE').length})
                  </button>
                  <button
                    onClick={() => {
                      setPaymentCategoryFilter('DUES');
                      setPaymentSelectedLoanId('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      paymentCategoryFilter === 'DUES'
                        ? 'bg-rose-700 text-white'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    बकाया / डिफ़ॉल्टर ({defaulterLoans.length + stats.dikkatKarneWale})
                  </button>
                  <button
                    onClick={() => {
                      setPaymentCategoryFilter('CLOSED');
                      setPaymentSelectedLoanId('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      paymentCategoryFilter === 'CLOSED'
                        ? 'bg-purple-700 text-white'
                        : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    पूर्ण चुकता / No Dues ({stats.closedCount})
                  </button>
                </div>
              </div>

              {/* Dropdown & Live Search Strip */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* 1. Large Dropdown */}
                <div className="md:col-span-7 relative">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    सदस्य ड्रॉपडाउन सूची (Member Dropdown List):
                  </label>
                  <div className="relative">
                    <select
                      value={paymentSelectedLoanId}
                      onChange={(e) => setPaymentSelectedLoanId(e.target.value)}
                      className="w-full p-2.5 pr-8 border border-slate-300 rounded-xl bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                    >
                      <option value="">-- सदस्य का चयन करें (कुल {loans.length} सदस्य) --</option>
                      {loans.map((l) => {
                        const tot = calculateInstallmentTotals(l.installments);
                        const bal = Math.max(0, l.loanAmount - tot.totalPaidPrincipal);
                        return (
                          <option key={l.id} value={l.id}>
                            {bal <= 0.01 ? '✅ [चुकता] ' : '💰 [बकाया] '}
                            #{l.membershipNo} - {l.borrowerName} ({l.accountNo}) | ऋण: {formatINR(l.loanAmount)} | शेष: ₹{bal.toFixed(0)}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Text Search Input */}
                <div className="md:col-span-5 relative">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    नाम / मोबाइल / खाता नंबर से खोजें:
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ऋणी का नाम, फोन, सदस्यता..."
                      value={paymentSearch}
                      onChange={(e) => {
                        setPaymentSearch(e.target.value);
                        setPaymentSelectedLoanId('');
                      }}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* SELECTED MEMBER SPOTLIGHT CARD */}
              {(() => {
                const activeSelectedLoan = loans.find((l) => l.id === paymentSelectedLoanId);
                if (!activeSelectedLoan) return null;

                const tot = calculateInstallmentTotals(activeSelectedLoan.installments);
                const rem = Math.max(0, activeSelectedLoan.loanAmount - tot.totalPaidPrincipal);
                const isZero = rem <= 0.01;
                const nextUnpaid = activeSelectedLoan.installments.find(
                  (i) => i.status !== 'PAID' && i.status !== 'DELAYED_PAID'
                );
                const bCat = classifyBorrower(activeSelectedLoan);

                return (
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border-2 border-amber-400 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-xl flex items-center justify-center border-2 border-white shadow-md shrink-0">
                          {activeSelectedLoan.borrowerName.split(' ').slice(-1)[0]?.charAt(0) || 'ऋ'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-amber-300 font-bold">
                              #{activeSelectedLoan.membershipNo} • खाता: {activeSelectedLoan.accountNo}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isZero
                                  ? 'bg-purple-200 text-purple-950'
                                  : bCat === 'DEFAULTER'
                                  ? 'bg-rose-200 text-rose-950'
                                  : 'bg-emerald-200 text-emerald-950'
                              }`}
                            >
                              {isZero
                                ? 'पूर्ण चुकता (NOC / No Dues)'
                                : bCat === 'DEFAULTER'
                                ? 'डिफ़ॉल्टर खाता'
                                : 'सक्रिय चालू खाता'}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mt-0.5">
                            {activeSelectedLoan.borrowerName}
                          </h3>
                          <p className="text-xs text-slate-300 font-sans">
                            पिता/पति: {activeSelectedLoan.fatherOrHusbandName || '—'} • मो: {activeSelectedLoan.phone} • {activeSelectedLoan.address}
                          </p>
                        </div>
                      </div>

                      {/* 4 Spotlight Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onOpenPaymentEntry(activeSelectedLoan)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-98 cursor-pointer"
                        >
                          <Coins className="w-4 h-4" />
                          <span>₹ किश्त जमा करें (Record Payment)</span>
                        </button>

                        <button
                          onClick={() => onOpenLedger(activeSelectedLoan)}
                          className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>📖 खाता बही लेजर</span>
                        </button>

                        {onOpenNoDuesNoc && (
                          <button
                            onClick={() => onOpenNoDuesNoc(activeSelectedLoan)}
                            className="px-3.5 py-2.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/40 border border-purple-400/50 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            title="No Dues व NOC प्रमाण पत्र जारी करें"
                          >
                            <Award className="w-3.5 h-3.5 text-purple-300" />
                            <span>📜 No Dues / NOC</span>
                          </button>
                        )}

                        {bCat === 'DEFAULTER' && (
                          <button
                            onClick={() => onOpenNotice(activeSelectedLoan)}
                            className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>वसूली नोटिस</span>
                          </button>
                        )}

                        <button
                          onClick={() => togglePassbookEnabled(activeSelectedLoan.id)}
                          className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                            activeSelectedLoan.passbookEnabled
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/40'
                              : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-400/40'
                          }`}
                          title="वेबसाइट पर इस सदस्य की पासबुक दिखेगी या नहीं"
                        >
                          {activeSelectedLoan.passbookEnabled ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>वेबसाइट पासबुक: चालू</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                              <span>वेबसाइट पासबुक: बंद</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Financial Snapshot Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-slate-400 text-[10px] block font-sans">स्वीकृत ऋण:</span>
                        <span className="text-sm font-bold text-white">{formatINR(activeSelectedLoan.loanAmount)}</span>
                        <span className="text-[10px] text-amber-300 block font-sans mt-0.5">{activeSelectedLoan.tenureMonths} माह @ 14%</span>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-slate-400 text-[10px] block font-sans">जमा मूलधन:</span>
                        <span className="text-sm font-bold text-emerald-400">₹ {tot.totalPaidPrincipal.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 block font-sans mt-0.5">ब्याज: ₹ {tot.totalPaidInterest.toFixed(0)}</span>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-slate-400 text-[10px] block font-sans">वर्तमान शेष मूलधन:</span>
                        <span className={`text-sm font-bold ${isZero ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isZero ? '₹ 0.00 (शून्य)' : `₹ ${rem.toFixed(2)}`}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                          {isZero ? 'NOC / No Dues हेतु तैयार' : 'किस्त देय'}
                        </span>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-slate-400 text-[10px] block font-sans">अगली देय किश्त:</span>
                        <span className="text-sm font-bold text-white">
                          {nextUnpaid ? `#${nextUnpaid.emiNo}` : 'पूर्ण चुकता'}
                        </span>
                        <span className="text-[10px] text-slate-300 block font-sans mt-0.5">
                          {nextUnpaid ? nextUnpaid.dueDate : 'खाता बंद'}
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Graph in Step 2: इतना लिया था, इतना दिया, अब इतना बचा */}
                    <div className="pt-2">
                      <MemberLoanProgressGraph loan={activeSelectedLoan} />
                    </div>

                    {/* Quick Installment Table Preview with Lock status and Pay/Edit triggers */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 text-amber-300">
                          <Coins className="w-4 h-4 text-emerald-400" />
                          <span>किश्त भुगतान व व्यक्तिगत लॉक स्थिति (Installments Overview):</span>
                        </span>
                        <button
                          onClick={() => onOpenPaymentEntry(activeSelectedLoan)}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>चेकबॉक्स चयन भुगतान फॉर्म खोलें ➔</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto max-h-52 border border-white/10 rounded-lg">
                        <table className="w-full text-left font-mono text-[11px]">
                          <thead className="bg-slate-950 text-slate-300 font-bold sticky top-0">
                            <tr>
                              <th className="p-2">ईएमआई</th>
                              <th className="p-2">देय तिथि</th>
                              <th className="p-2 text-right">देय मूलधन</th>
                              <th className="p-2 text-right">देय ब्याज</th>
                              <th className="p-2 text-right">कुल देय</th>
                              <th className="p-2 text-center">स्थिति</th>
                              <th className="p-2 text-center">🔒 लॉक</th>
                              <th className="p-2 text-center font-sans">कार्रवाई</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-200">
                            {activeSelectedLoan.installments.map((inst) => {
                              const isPaid = inst.status === 'PAID' || inst.status === 'DELAYED_PAID' || (inst.totalPaid || 0) >= inst.totalDue;
                              const isLocked = inst.isLocked === true;
                              return (
                                <tr key={inst.emiNo} className="hover:bg-white/5 transition-colors">
                                  <td className="p-2 font-bold font-sans">#{inst.emiNo}</td>
                                  <td className="p-2 whitespace-nowrap">{inst.dueDate}</td>
                                  <td className="p-2 text-right">₹ {Math.round(inst.duePrincipal).toLocaleString('en-IN')}</td>
                                  <td className="p-2 text-right text-amber-300">₹ {Math.round(inst.dueInterest).toLocaleString('en-IN')}</td>
                                  <td className="p-2 text-right font-bold text-white">₹ {Math.round(inst.totalDue).toLocaleString('en-IN')}</td>
                                  <td className="p-2 text-center font-sans">
                                    {isPaid ? (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                                        जमा (₹{Math.round(inst.totalPaid)})
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                                        देय
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      onClick={() => toggleInstallmentLock(activeSelectedLoan.id, inst.emiNo)}
                                      className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                                        isLocked
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                          : 'bg-white/10 text-slate-400 hover:text-white'
                                      }`}
                                      title={isLocked ? 'लॉक्ड है - अनलॉक करने के लिए क्लिक करें' : 'खुला है - लॉक करने के लिए क्लिक करें'}
                                    >
                                      {isLocked ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5" />}
                                    </button>
                                  </td>
                                  <td className="p-2 text-center font-sans">
                                    <button
                                      onClick={() => onOpenPaymentEntry(activeSelectedLoan, inst.emiNo)}
                                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer whitespace-nowrap"
                                    >
                                      {isPaid ? 'संशोधन' : 'जमा करें'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Loan Cards for Payments (Filtered by search and category) */}
            {(() => {
              const paymentFilteredLoans = loans.filter((loan) => {
                const matchesSearch =
                  loan.borrowerName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                  loan.membershipNo.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                  loan.accountNo.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                  loan.phone.includes(paymentSearch);

                if (!matchesSearch) return false;

                if (paymentCategoryFilter === 'ALL') return true;
                if (paymentCategoryFilter === 'ACTIVE') return loan.status === 'ACTIVE';
                if (paymentCategoryFilter === 'DUES') {
                  const bCat = classifyBorrower(loan);
                  return bCat === 'DEFAULTER' || bCat === 'WATCHLIST';
                }
                if (paymentCategoryFilter === 'CLOSED') {
                  const tot = calculateInstallmentTotals(loan.installments);
                  return (loan.loanAmount - tot.totalPaidPrincipal) <= 0.01 || loan.status === 'CLOSED';
                }
                return true;
              });

              if (paymentFilteredLoans.length === 0) {
                return (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    कोई सदस्य नहीं मिला। कृपया खोज शब्द बदलें या 'सभी सदस्य' चुनें।
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paymentFilteredLoans.map((loan) => {
                    const tot = calculateInstallmentTotals(loan.installments);
                    const rem = Math.max(0, loan.loanAmount - tot.totalPaidPrincipal);
                    const isZero = rem <= 0.01;
                    const nextUnpaid = loan.installments.find(
                      (i) => i.status !== 'PAID' && i.status !== 'DELAYED_PAID'
                    );
                    const isSelected = loan.id === paymentSelectedLoanId;

                    return (
                      <div
                        key={loan.id}
                        className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                            : 'border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-[10px] font-mono text-slate-500 block">
                                #{loan.membershipNo} • {loan.accountNo}
                              </span>
                              <h4 className="font-bold text-slate-900 text-sm font-sans">
                                {loan.borrowerName}
                              </h4>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {loan.phone}
                              </span>
                            </div>
                            <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {formatINR(loan.loanAmount)}
                            </span>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs my-3 font-mono">
                            <div className="flex justify-between text-slate-600">
                              <span>जमा मूलधन:</span>
                              <span className="font-bold text-emerald-700">₹ {tot.totalPaidPrincipal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>शेष मूलधन:</span>
                              <span className={`font-bold ${isZero ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {isZero ? '₹ 0.00 (शून्य)' : `₹ ${rem.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-600 border-t pt-1 font-sans">
                              <span>अगली देय किश्त:</span>
                              <span className="font-bold font-mono text-slate-900">
                                {nextUnpaid ? `#${nextUnpaid.emiNo} (${nextUnpaid.dueDate})` : 'पूर्ण चुकता'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => onOpenPaymentEntry(loan)}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>किश्त जमा करें</span>
                          </button>

                          <button
                            onClick={() => onOpenLedger(loan)}
                            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                            title="लेजर बही"
                          >
                            लेजर
                          </button>

                          {isZero && onOpenNoDuesNoc && (
                            <button
                              onClick={() => onOpenNoDuesNoc(loan)}
                              className="py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors cursor-pointer"
                              title="No Dues / NOC"
                            >
                              NOC
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Step 2 Guided Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep('STEP1_LOANS')}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                ⬅ पिछला चरण 1: ऋण खाते व लेजर
              </button>
              <button
                onClick={() => setActiveStep('STEP3_DEFAULTERS')}
                className="px-5 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <span>अगला चरण 3: डिफ़ॉल्टर व मांग नोटिस ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEFAULTER WORKFLOW & RECOVERY NOTICES */}
        {activeStep === 'STEP3_DEFAULTERS' && (
          <div className="space-y-5">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-xs text-rose-950 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-rose-950">
                  चरण 3: डिफ़ॉल्टर रिकवरी एवं कानूनी मांग पत्र (3+ किश्तें मिस)
                </h3>
                <p className="mt-0.5 text-rose-800">
                  जिन सदस्यों की लगातार 3 किश्तें मिस हैं, उन्हें कानूनी मांग सूचना पत्र जारी करें अथवा जमानतदार के चेक से वसूली करें।
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-200 text-rose-950 font-bold font-mono">
                {defaulterLoans.length} डिफ़ॉल्टर खाते
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-rose-900 text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-3.5">सदस्यता</th>
                    <th className="p-3.5">ऋणी का नाम</th>
                    <th className="p-3.5">ऋण राशि</th>
                    <th className="p-3.5">मिस किश्तें</th>
                    <th className="p-3.5">जमानतदार 1 (चेक सहित)</th>
                    <th className="p-3.5">जमानतदार 2 (चेक सहित)</th>
                    <th className="p-3.5 text-right">शेष मूलधन</th>
                    <th className="p-3.5 text-center">वसूली मांग पत्र</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {defaulterLoans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                        वर्तमान में कोई डिफ़ॉल्टर खाता नहीं है। सभी सदस्य समय पर भुगतान कर रहे हैं।
                      </td>
                    </tr>
                  ) : (
                    defaulterLoans.map((loan) => {
                      const dInfo = evaluateDefaulterStatus(loan.installments);
                      const tot = calculateInstallmentTotals(loan.installments);
                      const rem = Math.max(0, loan.loanAmount - tot.totalPaidPrincipal);

                      return (
                        <tr key={loan.id} className="hover:bg-rose-50/40">
                          <td className="p-3.5 font-bold">#{loan.membershipNo}</td>
                          <td className="p-3.5 font-sans font-bold text-slate-900">{loan.borrowerName}</td>
                          <td className="p-3.5 font-bold">{formatINR(loan.loanAmount)}</td>
                          <td className="p-3.5 text-rose-700 font-bold">
                            {dInfo.consecutiveMissedCount} किश्तें मिस
                          </td>
                          <td className="p-3.5 font-sans text-[11px]">
                            <strong>{loan.guarantor1?.name}</strong>
                            <div className="text-[10px] text-slate-500 font-mono">
                              चेक: {loan.guarantor1?.chequeNo || '—'}
                            </div>
                          </td>
                          <td className="p-3.5 font-sans text-[11px]">
                            <strong>{loan.guarantor2?.name}</strong>
                            <div className="text-[10px] text-slate-500 font-mono">
                              चेक: {loan.guarantor2?.chequeNo || '—'}
                            </div>
                          </td>
                          <td className="p-3.5 text-right font-bold text-rose-700">{formatINR(rem)}</td>
                          <td className="p-3.5 text-center font-sans">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onOpenNotice(loan)}
                                className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                नोटिस प्रिंट
                              </button>
                              <button
                                onClick={() => onOpenPaymentEntry(loan)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                जमा करें
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Step 3 Guided Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep('STEP2_PAYMENTS')}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                ⬅ पिछला चरण 2: किश्त वसूली
              </button>
              <button
                onClick={() => setActiveStep('STEP4_CALCULATOR')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>अगला चरण 4: ऋण व ईएमआई कैलकुलेटर ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: LOAN & EMI CALCULATOR (As explicitly requested by user) */}
        {activeStep === 'STEP4_CALCULATOR' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-800/50 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                    <Calculator className="w-5 h-5" />
                  </span>
                  <h3 className="font-extrabold text-lg text-white">
                    चरण 4: ऋण स्लैब एवं 24/36 माह ईएमआई कैलकुलेटर
                  </h3>
                </div>
                <p className="text-xs text-amber-200/90 max-w-2xl">
                  संस्था के अधिकृत स्लैब (₹50,000, ₹1,00,000, ₹1,50,000, ₹2,00,000, ₹3,00,000, ₹3,50,000, ₹4,00,000)। 14% घटते क्रम ब्याज, प्री-ईएमआई (50k: ₹2,500, 1L: ₹5,000, 2L: ₹10,000, 3L: ₹15,000, 3.5L: ₹17,500, 4L: ₹20,000) + ₹500 प्रोसेसिंग + ₹300 भवन निधि अग्रिम कटौती उपरांत निवल देय चेक राशि का पूर्ण हिसाब।
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onOpenAddLoan}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>नया ऋण स्वीकृत करें</span>
                </button>
              </div>
            </div>

            {/* Embedded Full Interactive EMI Calculator */}
            <EmiCalculator
              isInline={true}
              onApplyLoan={() => onOpenAddLoan()}
            />

            {/* Step 4 Guided Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep('STEP3_DEFAULTERS')}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                ⬅ पिछला चरण 3: डिफ़ॉल्टर व मांग नोटिस
              </button>
              <button
                onClick={() => setActiveStep('STEP5_REPORTS')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <span>अगला चरण 5: वित्तीय चार्ट व ऑडिट रिपोर्ट ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: VISUAL CHARTS & FINANCIAL REPORTS HUB */}
        {activeStep === 'STEP5_REPORTS' && (
          <div className="space-y-8">
            {/* Visual Analytics Graphs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  दृश्य एनालिटिक्स एवं ग्राफ चार्ट (Visual Financial Analytics):
                </span>
                <span className="text-xs text-slate-500">रीयल-टाइम सहकारी अनुपात</span>
              </div>
              <AdminCharts loans={loans} />
            </div>

            {/* 4 Dedicated Reports Hub */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  वित्तीय ऑडिट एवं रजिस्टर बही (Comprehensive Audit Hub):
                </span>
                <span className="text-xs text-slate-500">स्तंभ-वार कुल योग एवं CSV डाउनलोड</span>
              </div>
              <AdminReportsHub
                loans={loans}
                onOpenLedger={onOpenLedger}
                onOpenNotice={onOpenNotice}
              />
            </div>

            {/* Step 5 Guided Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep('STEP4_CALCULATOR')}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                ⬅ पिछला चरण 4: ऋण कैलकुलेटर
              </button>
              <button
                onClick={() => setActiveStep('STEP_ARCHIVE')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <span>अगला चरण 6: आर्काइव ऋण फ़ाइल ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP_ARCHIVE: ARCHIVED LOANS MANAGEMENT & RECALCULATION CENTER */}
        {activeStep === 'STEP_ARCHIVE' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                    <Archive className="w-3.5 h-3.5" />
                    <span>निष्क्रिय व सुरक्षित आर्काइव ऋण फ़ाइल</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    आर्काइव ऋण खाते एवं वित्तीय री-कैलकुलेशन केंद्र
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    यहाँ वे सदस्य व ऋण खाते सुरक्षित हैं जिन्हें मुख्य सक्रिय सूची से हटाया गया है। इनकी राशि संस्था के कुल लोन व वसूली गणना में <strong>शामिल नहीं</strong> है। 
                    किसी भी खाते को <strong>'पुनः सक्रिय (Restore)'</strong> करने पर सभी वित्तीय गणनाएं तुरंत री-कैलकुलेट हो जाती हैं।
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveStep('STEP1_LOANS')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>सक्रिय ऋण खातों पर जाएं</span>
                  </button>
                </div>
              </div>

              {/* 3 Overview Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                    कुल आर्काइव सदस्य
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    {archivedLoans.length} खाते
                  </div>
                  <span className="text-[10px] text-slate-400">
                    मुख्य सक्रिय गणना से पूरी तरह बाहर
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                    आर्काइव में मूलधन
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    {formatINR(archivedLoans.reduce((acc, l) => acc + l.loanAmount, 0))}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    स्वीकृत ऋण राशि (गणना में अप्रभावित)
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                    आर्काइव शेष मूलधन
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    {formatINR(
                      archivedLoans.reduce((acc, l) => {
                        const t = calculateInstallmentTotals(l.installments);
                        return acc + Math.max(0, l.loanAmount - t.totalPaidPrincipal);
                      }, 0)
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    अतिदेय/शेष राशि जो संस्था देनदारी में नहीं गिनी जा रही
                  </span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="आर्काइव में खोजें (नाम, खाता, मोबाइल)..."
                  value={archiveSearchFilter}
                  onChange={(e) => setArchiveSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                दिख रहे हैं: <strong className="text-slate-900">{filteredArchivedLoans.length}</strong> / कुल आर्काइव: {archivedLoans.length}
              </div>
            </div>

            {/* Table of Archived Loans */}
            {filteredArchivedLoans.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <Archive className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900">
                  {archivedLoans.length === 0
                    ? 'वर्तमान में कोई भी ऋण खाता आर्काइव में नहीं है'
                    : 'खोज के अनुसार कोई आर्काइव खाता नहीं मिला'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {archivedLoans.length === 0
                    ? 'संस्था के सभी सदस्य वर्तमान में सक्रिय गणना में शामिल हैं। यदि आप किसी ऋणी का खाता हटाना या स्थगित करना चाहें तो "ऋण खाते व लेजर" सूची में जाकर "हटाएं / आर्काइव" बटन दबाएं।'
                    : 'कृपया अन्य नाम या खाता क्रमांक से खोज का प्रयास करें।'}
                </p>
                {archivedLoans.length === 0 && (
                  <button
                    onClick={() => setActiveStep('STEP1_LOANS')}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer mt-2"
                  >
                    <span>सक्रिय ऋण खातों की सूची देखें</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-white font-bold text-[11px]">
                      <tr>
                        <th className="p-3.5">सदस्यता व खाता</th>
                        <th className="p-3.5">ऋणी का नाम व फोन</th>
                        <th className="p-3.5">स्वीकृत ऋण</th>
                        <th className="p-3.5">शेष मूलधन</th>
                        <th className="p-3.5">आर्काइव दिनांक</th>
                        <th className="p-3.5">आर्काइव कारण / विवरण</th>
                        <th className="p-3.5 text-center">री-कैलकुलेशन व कार्य (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {filteredArchivedLoans.map((loan) => {
                        const t = calculateInstallmentTotals(loan.installments);
                        const rem = Math.max(0, loan.loanAmount - t.totalPaidPrincipal);
                        return (
                          <tr key={loan.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                              <span className="text-amber-700">#{loan.membershipNo}</span>
                              <span className="block text-[10px] text-slate-500 font-normal">
                                {loan.accountNo}
                              </span>
                            </td>
                            <td className="p-3.5 font-sans">
                              <strong className="text-slate-950 text-xs block font-bold">
                                {loan.borrowerName}
                              </strong>
                              <span className="text-slate-500 text-[10px] font-mono">
                                {loan.phone}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-slate-900 text-xs">
                              {formatINR(loan.loanAmount)}
                            </td>
                            <td className="p-3.5 font-bold text-amber-800">
                              ₹ {rem.toFixed(2)}
                            </td>
                            <td className="p-3.5 font-sans text-slate-600 text-[11px] whitespace-nowrap">
                              {loan.archivedAt ? new Date(loan.archivedAt).toLocaleDateString('hi-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'आर्काइव्ड'}
                            </td>
                            <td className="p-3.5 font-sans text-slate-700 text-xs max-w-xs">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-950 text-[11px] font-semibold">
                                {loan.archivedReason || 'प्रशासक द्वारा आर्काइव'}
                              </span>
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap font-sans">
                              <div className="flex items-center justify-center gap-2">
                                {/* ACTION 1: RESTORE & RECALCULATE */}
                                <button
                                  onClick={() => {
                                    restoreLoan(loan.id);
                                    setArchiveSuccessMsg(
                                      `सदस्य '${loan.borrowerName}' (खाता: ${loan.accountNo}) को पुनः सक्रिय कर दिया गया है! संस्था के सभी वित्तीय आंकड़े स्वतः रीकैलकुलेट हो चुके हैं।`
                                    );
                                    setTimeout(() => setArchiveSuccessMsg(null), 6000);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                  title="इस सदस्य को पुनः सक्रिय करें और वित्तीय गणनाएं रीकैलकुलेट करें"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>पुनः सक्रिय करें (Recalculate)</span>
                                </button>

                                {/* ACTION 2: VIEW LEDGER */}
                                <button
                                  onClick={() => onOpenLedger(loan)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                                  title="लेजर इतिहास देखें"
                                >
                                  लेजर
                                </button>

                                {/* ACTION 3: PERMANENT DELETE */}
                                <button
                                  onClick={() => setLoanToDeletePermanent(loan)}
                                  className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-800 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                  title="हमेशा के लिए डिलीट करें (Permanent Delete)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Guided Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep('STEP5_REPORTS')}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                ⬅ पिछला चरण 5: वित्तीय चार्ट व ऑडिट
              </button>
              <button
                onClick={() => setActiveStep('STEP6_BOARD_BACKUP')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <span>अगला चरण 7: संचालक मंडल व बैकअप ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: BOARD MEMBERS & DATA BACKUP */}
        {activeStep === 'STEP6_BOARD_BACKUP' && (
          <div className="space-y-8">
            {/* Board Members Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    संस्था संचालक मंडल सदस्य सूची (वर्तमान में {boardMembers.length} सदस्य)
                  </h3>
                  <p className="text-xs text-slate-500">
                    1 अध्यक्ष, 2 उपाध्यक्ष, 8 संचालक, 1 संचालक प्रतिनिधि, 1 प्रबंधक (श्रीमति तन्‍मयी कोरसने)
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingBoardMember(null);
                    setBmName('');
                    setBmDesignation('संचालक');
                    setBmRole('SANCHALAK');
                    setBmPhone('');
                    setIsAddingBoardMember(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>नया सदस्य जोड़ें</span>
                </button>
              </div>

              {isAddingBoardMember && (
                <form
                  onSubmit={handleSaveBoardMember}
                  className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3 text-xs"
                >
                  <h4 className="font-bold text-amber-900">
                    {editingBoardMember ? 'संचालक मंडल सदस्य संशोधित करें' : 'नया सदस्य जोड़ें'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">पूरा नाम *</label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. श्री आनंद कुमार"
                        value={bmName}
                        onChange={(e) => setBmName(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">पद (हिंदी में) *</label>
                      <input
                        type="text"
                        required
                        placeholder="अध्यक्ष / उपाध्यक्ष / संचालक"
                        value={bmDesignation}
                        onChange={(e) => setBmDesignation(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">श्रेणी</label>
                      <select
                        value={bmRole}
                        onChange={(e) => setBmRole(e.target.value as BoardMember['role'])}
                        className="w-full p-2 border rounded-lg bg-white"
                      >
                        <option value="ADHYAKSHA">अध्यक्ष (President)</option>
                        <option value="UPADHYAKSHA">उपाध्यक्ष (Vice-President)</option>
                        <option value="SANCHALAK">संचालक (Director)</option>
                        <option value="SANCHALAK_PRATINIDHI">संचालक प्रतिनिधि (Representative)</option>
                        <option value="PRABANDHAK">प्रबंधक (Manager)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">मोबाइल नंबर</label>
                      <input
                        type="tel"
                        placeholder="10 अंकों का फोन"
                        value={bmPhone}
                        onChange={(e) => setBmPhone(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white font-mono"
                      />
                    </div>

                    {/* Sanchalak Profile Photo Uploader */}
                    <div className="sm:col-span-4 border-t border-amber-200/60 pt-3">
                      <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-amber-600" />
                          <span>संचालक प्रोफ़ाइल फ़ोटो (Profile Photo):</span>
                        </span>
                        {bmPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setBmPhotoUrl('')}
                            className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold cursor-pointer"
                          >
                            फ़ोटो हटाएं (Remove)
                          </button>
                        )}
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-amber-200">
                        {/* Live Avatar Preview */}
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                          {bmPhotoUrl ? (
                            <img src={bmPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <UserCheck className="w-8 h-8 text-slate-400" />
                          )}
                        </div>

                        {/* Upload & URL Input */}
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0">
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                              <span>फ़ोटो फ़ाइल अपलोड करें</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        setBmPhotoUrl(event.target.result as string);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <span className="text-[11px] text-slate-500">अथवा फ़ोटो URL लिंक लिखें:</span>
                          </div>

                          <input
                            type="text"
                            placeholder="https://... फ़ोटो लिंक (URL)"
                            value={bmPhotoUrl}
                            onChange={(e) => setBmPhotoUrl(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBoardMember(false);
                        setBmPhotoUrl('');
                      }}
                      className="px-3 py-1.5 border rounded-lg text-slate-700 hover:bg-white cursor-pointer"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-bold cursor-pointer"
                    >
                      सहेजें
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-3 text-center">क्र.</th>
                      <th className="p-3">फ़ोटो</th>
                      <th className="p-3">नाम</th>
                      <th className="p-3">पद (हिंदी)</th>
                      <th className="p-3">मोबाइल</th>
                      <th className="p-3 text-center">संशोधित / हटाएं</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {boardMembers.map((bm, index) => (
                      <tr key={bm.id} className="hover:bg-slate-50">
                        <td className="p-3 text-center font-bold font-mono">{index + 1}</td>
                        <td className="p-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-300 bg-slate-100 flex items-center justify-center shrink-0">
                            {bm.photoUrl ? (
                              <img src={bm.photoUrl} alt={bm.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-slate-600">
                                {bm.name.split(' ').slice(-1)[0]?.charAt(0) || 'सं'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">{bm.name}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900">
                            {bm.designationHindi}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{bm.phone || '—'}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStartEditBoardMember(bm)}
                              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                              title="संपादित करें"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`क्या आप ${bm.name} को संचालक मंडल से हटाना चाहते हैं?`)) {
                                  deleteBoardMember(bm.id);
                                }
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Permanent Data Lock & Backup */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  डेटा सुरक्षा एवं स्थायी JSON बैकअप
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                अपने समस्त ऋण खातों, किश्तों एवं सदस्यों के डेटा को कभी भी JSON फ़ाइल के रूप में सुरक्षित डाउनलोड या पुनर्स्थापित (Restore) करें।
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      बैकअप फ़ाइल डाउनलोड:
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      सभी लाइव ऋण, भुगतान बही और संचालक मंडल एक फ़ाइल में
                    </span>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>JSON बैकअप डाउनलोड (.json)</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <strong className="text-xs font-bold text-slate-900 block">
                    बैकअप फ़ाइल पुनर्स्थापित करें:
                  </strong>
                  <textarea
                    placeholder="JSON बैकअप कोड पेस्ट करें..."
                    value={backupJsonInput}
                    onChange={(e) => setBackupJsonInput(e.target.value)}
                    className="w-full h-16 p-2 text-xs font-mono border rounded-lg bg-white"
                  />
                  <button
                    onClick={handleImportBackup}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>डेटा रिस्टोर करें</span>
                  </button>
                </div>
              </div>

              {backupMessage && (
                <div className="p-3 bg-slate-800 text-white text-xs rounded-xl text-center font-semibold mt-2">
                  {backupMessage}
                </div>
              )}
            </div>

            {/* Step 6 Guided Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveStep('STEP5_REPORTS')}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                ⬅ पिछला चरण 5: वित्तीय चार्ट व रिपोर्ट
              </button>
              <button
                onClick={() => setActiveStep('STEP7_WEBSITE_SETTINGS')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <span>अगला चरण 7: वेबसाइट व संपर्क सेटिंग्स ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: WEBSITE, BANNER SLIDES & FRONT PAGE CONTENT SETTINGS */}
        {activeStep === 'STEP7_WEBSITE_SETTINGS' && (
          <div className="space-y-6">
            {/* Step 7 Navigation Sub-Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWebsiteActiveTab('BANNER')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    websiteActiveTab === 'BANNER'
                      ? 'bg-purple-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Image className="w-4 h-4 text-purple-300" />
                  <span>1. बैनर स्लाइडर व फ़ोटो ({bannerSlides?.length || 0})</span>
                </button>

                <button
                  onClick={() => setWebsiteActiveTab('FRONT_CONTENT')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    websiteActiveTab === 'FRONT_CONTENT'
                      ? 'bg-purple-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4 text-purple-300" />
                  <span>2. फ्रंट पेज संपूर्ण कंटेंट व सूचना</span>
                </button>

                <button
                  onClick={() => setWebsiteActiveTab('CONTACT')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    websiteActiveTab === 'CONTACT'
                      ? 'bg-purple-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-purple-300" />
                  <span>3. शाखा कार्यालय व संपर्क विवरण</span>
                </button>
              </div>

              {websiteActiveTab === 'BANNER' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetBannerSlides}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                    title="डिफ़ॉल्ट 4 स्लाइड्स रीसेट करें"
                  >
                    रीसेट डिफ़ॉल्ट
                  </button>
                  <button
                    onClick={() => {
                      setEditingSlide(null);
                      setSlideForm({
                        title: '',
                        subtitle: '',
                        description: '',
                        badgeText: 'म.प्र. शासन सहकारिता विभाग पंजीकृत',
                        imageUrl:
                          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
                        buttonText: 'सदस्य ऑनलाइन पासबुक',
                        buttonAction: 'PASSBOOK',
                        secondaryButtonText: 'ऋण कैलकुलेटर व स्लैब',
                        secondaryButtonAction: 'CALCULATOR',
                        accentColor: 'amber',
                        isActive: true,
                      });
                      setIsAddingSlide(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ नई स्लाइड जोड़ें</span>
                  </button>
                </div>
              )}
            </div>

            {/* SUB-TAB 1: BANNER SLIDES MANAGER */}
            {websiteActiveTab === 'BANNER' && (
              <div className="space-y-6">
                {slideSaveMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{slideSaveMessage}</span>
                  </div>
                )}

                {/* Add / Edit Slide Form */}
                {isAddingSlide && (
                  <div className="bg-white rounded-2xl border-2 border-purple-300 p-6 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Image className="w-4 h-4 text-purple-700" />
                        <span>{editingSlide ? 'बैनर स्लाइड संपादित करें' : 'नई बैनर स्लाइड जोड़ें'}</span>
                      </h4>
                      <button
                        onClick={() => setIsAddingSlide(false)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        रद्द करें ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">
                            स्लाइड मुख्य शीर्षक (Slide Title) *:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="उदा. समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल"
                            value={slideForm.title}
                            onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                            className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-900 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            उपशीर्षक (Subtitle) *:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="उदा. 14% वार्षिक घटती ब्याज दर पर आसान व पारदर्शी ऋण"
                            value={slideForm.subtitle}
                            onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                            className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            टैग / बैज (Badge Text):
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. म.प्र. शासन सहकारिता विभाग पंजीकृत"
                            value={slideForm.badgeText}
                            onChange={(e) => setSlideForm({ ...slideForm, badgeText: e.target.value })}
                            className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">
                            विस्तृत विवरण (Description):
                          </label>
                          <textarea
                            rows={2}
                            placeholder="स्लाइड के संबंध में 1-2 वाक्यों का संक्षिप्त विवरण..."
                            value={slideForm.description}
                            onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })}
                            className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                          />
                        </div>

                        {/* SLIDE PHOTO UPLOADER & PRESETS */}
                        <div className="sm:col-span-2 bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-3">
                          <label className="block text-purple-950 font-bold flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Camera className="w-4 h-4 text-purple-700" />
                              <span>स्लाइड की फ़ोटो (Slide Image / Photo) *:</span>
                            </span>
                            {slideForm.imageUrl && (
                              <span className="text-[10px] text-emerald-700 font-bold">✓ फ़ोटो सेट है</span>
                            )}
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            {/* Image Preview Thumbnail */}
                            <div className="sm:col-span-4 aspect-video rounded-xl overflow-hidden border-2 border-purple-300 bg-white shadow-inner flex items-center justify-center">
                              {slideForm.imageUrl ? (
                                <img
                                  src={slideForm.imageUrl}
                                  alt="Slide Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80';
                                  }}
                                />
                              ) : (
                                <span className="text-xs text-slate-400">फ़ोटो पूर्वावलोकन</span>
                              )}
                            </div>

                            {/* Upload Button & URL Input */}
                            <div className="sm:col-span-8 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <label className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2 shrink-0">
                                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                                  <span>कंप्यूटर/मोबाइल से फ़ोटो अपलोड करें</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          if (event.target?.result) {
                                            setSlideForm({
                                              ...slideForm,
                                              imageUrl: event.target.result as string,
                                            });
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                                <span className="text-[11px] text-slate-500">या नीचे लिंक लिखें:</span>
                              </div>

                              <input
                                type="text"
                                placeholder="https://... इमेज URL लिंक"
                                value={slideForm.imageUrl}
                                onChange={(e) => setSlideForm({ ...slideForm, imageUrl: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                              />

                              {/* 6 Quick Curated Presets */}
                              <div className="pt-1">
                                <span className="text-[10px] font-bold text-slate-500 block mb-1">
                                  त्वरित सहकारी फ़ोटो प्रीसेट चुनें:
                                </span>
                                <div className="flex flex-wrap gap-1.5 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSlideForm({
                                        ...slideForm,
                                        imageUrl:
                                          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
                                      })
                                    }
                                    className="px-2 py-0.5 rounded bg-white hover:bg-purple-100 border text-slate-700 cursor-pointer"
                                  >
                                    वित्त व बहीखाता
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSlideForm({
                                        ...slideForm,
                                        imageUrl:
                                          'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=1200&auto=format&fit=crop&q=80',
                                      })
                                    }
                                    className="px-2 py-0.5 rounded bg-white hover:bg-purple-100 border text-slate-700 cursor-pointer"
                                  >
                                    किसान व कृषि
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSlideForm({
                                        ...slideForm,
                                        imageUrl:
                                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80',
                                      })
                                    }
                                    className="px-2 py-0.5 rounded bg-white hover:bg-purple-100 border text-slate-700 cursor-pointer"
                                  >
                                    महिला स्व-सहायता
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSlideForm({
                                        ...slideForm,
                                        imageUrl:
                                          'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
                                      })
                                    }
                                    className="px-2 py-0.5 rounded bg-white hover:bg-purple-100 border text-slate-700 cursor-pointer"
                                  >
                                    No Dues / प्रमाण-पत्र
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSlideForm({
                                        ...slideForm,
                                        imageUrl:
                                          'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1200&auto=format&fit=crop&q=80',
                                      })
                                    }
                                    className="px-2 py-0.5 rounded bg-white hover:bg-purple-100 border text-slate-700 cursor-pointer"
                                  >
                                    साख कार्यालय
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Button 1 Configuration */}
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            प्राथमिक बटन का नाम (Primary Button):
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. सदस्य ऑनलाइन पासबुक"
                            value={slideForm.buttonText}
                            onChange={(e) => setSlideForm({ ...slideForm, buttonText: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            प्राथमिक बटन एक्शन (Action Target):
                          </label>
                          <select
                            value={slideForm.buttonAction}
                            onChange={(e) =>
                              setSlideForm({
                                ...slideForm,
                                buttonAction: e.target.value as BannerSlide['buttonAction'],
                              })
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                          >
                            <option value="PASSBOOK">सदस्य पासबुक (Online Passbook)</option>
                            <option value="CALCULATOR">ऋण कैलकुलेटर व स्लैब (Calculator)</option>
                            <option value="BOARD">संचालक मंडल (Board Members)</option>
                            <option value="CONTACT">शाखा संपर्क (Contact & Branch)</option>
                            <option value="ADMIN">प्रशासक लॉगिन (Admin Panel)</option>
                          </select>
                        </div>

                        {/* Button 2 Configuration */}
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            द्वितीयक बटन का नाम (Secondary Button):
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. ऋण कैलकुलेटर व स्लैब"
                            value={slideForm.secondaryButtonText}
                            onChange={(e) =>
                              setSlideForm({ ...slideForm, secondaryButtonText: e.target.value })
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            द्वितीयक बटन एक्शन (Action Target):
                          </label>
                          <select
                            value={slideForm.secondaryButtonAction}
                            onChange={(e) =>
                              setSlideForm({
                                ...slideForm,
                                secondaryButtonAction: e.target.value as BannerSlide['buttonAction'],
                              })
                            }
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                          >
                            <option value="CALCULATOR">ऋण कैलकुलेटर व स्लैब (Calculator)</option>
                            <option value="PASSBOOK">सदस्य पासबुक (Online Passbook)</option>
                            <option value="BOARD">संचालक मंडल (Board Members)</option>
                            <option value="CONTACT">शाखा संपर्क (Contact & Branch)</option>
                            <option value="ADMIN">प्रशासक लॉगिन (Admin Panel)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={slideForm.isActive}
                              onChange={(e) => setSlideForm({ ...slideForm, isActive: e.target.checked })}
                              className="rounded text-purple-700"
                            />
                            <span>यह स्लाइड मुख्य पृष्ठ पर सक्रिय (Active) रखें</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setIsAddingSlide(false)}
                          className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          रद्द करें
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Save className="w-4 h-4 text-amber-300" />
                          <span>स्लाइड सहेजें</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Slides List Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bannerSlides && bannerSlides.length > 0 ? (
                    bannerSlides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                          slide.isActive ? 'border-purple-300' : 'border-slate-200 opacity-70'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Slide Photo & Status Badge */}
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            {slide.imageUrl ? (
                              <img
                                src={slide.imageUrl}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold">
                                कोई फ़ोटो नहीं
                              </div>
                            )}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs">
                                #{idx + 1}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  slide.isActive
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-700 text-slate-300'
                                }`}
                              >
                                {slide.isActive ? 'सक्रिय' : 'बंद'}
                              </span>
                            </div>
                          </div>

                          {/* Content summary */}
                          <div>
                            {slide.badgeText && (
                              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide block">
                                {slide.badgeText}
                              </span>
                            )}
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                              {slide.title}
                            </h4>
                            <p className="text-xs text-amber-700 font-semibold line-clamp-1">
                              {slide.subtitle}
                            </p>
                            {slide.description && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                {slide.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Action Controls */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-3">
                          <button
                            onClick={() =>
                              updateBannerSlide({ ...slide, isActive: !slide.isActive })
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                              slide.isActive
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {slide.isActive ? 'अक्रिय करें (Hide)' : 'सक्रिय करें (Show)'}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEditSlide(slide)}
                              className="px-3 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                              <span>संशोधित</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`क्या आप स्लाइड "${slide.title}" हटाना चाहते हैं?`)) {
                                  deleteBannerSlide(slide.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="sm:col-span-2 p-8 bg-white rounded-2xl border text-center text-xs text-slate-500">
                      कोई स्लाइड नहीं है। 'नई स्लाइड जोड़ें' या 'रीसेट डिफ़ॉल्ट' पर क्लिक करें।
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: FRONT PAGE CONTENT & ANNOUNCEMENTS */}
            {websiteActiveTab === 'FRONT_CONTENT' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      फ्रंट पेज की संपूर्ण सामग्री एवं सूचना पट्टी (Front Page Content Editor)
                    </h3>
                    <p className="text-xs text-slate-500">
                      यहाँ से मुख्य शीर्षक, घोषणा पट्टी, संस्था परिचय एवं नियम व शर्तों को सीधे बदलें।
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveFrontContent} className="space-y-4 text-xs">
                  {/* Announcement Ticker */}
                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-1.5">
                    <label className="block text-amber-950 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>शीर्ष सूचना पट्टी (Top Announcement Ticker):</span>
                    </label>
                    <input
                      type="text"
                      value={frontForm.announcementTicker}
                      onChange={(e) =>
                        setFrontForm({ ...frontForm, announcementTicker: e.target.value })
                      }
                      className="w-full p-2.5 border border-amber-300 rounded-xl bg-white font-semibold text-slate-900 text-xs"
                      placeholder="उदा. सूचना: वित्तीय वर्ष 2024-25 हेतु नवीन ऋण योजना चालू है..."
                    />
                    <span className="text-[10px] text-amber-800 block">
                      यह सूचना मुख्य पृष्ठ पर सबसे ऊपर चलती हुई अथवा प्रमुखता से दिखाई देगी।
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        फ्रंट पेज मुख्य शीर्षक (Hero Main Heading):
                      </label>
                      <input
                        type="text"
                        value={frontForm.heroHeading}
                        onChange={(e) => setFrontForm({ ...frontForm, heroHeading: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        फ्रंट पेज उपशीर्षक (Hero Subheading):
                      </label>
                      <input
                        type="text"
                        value={frontForm.heroSubheading}
                        onChange={(e) =>
                          setFrontForm({ ...frontForm, heroSubheading: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">
                        संस्था परिचय शीर्षक (About Society Title):
                      </label>
                      <input
                        type="text"
                        value={frontForm.aboutTitle}
                        onChange={(e) => setFrontForm({ ...frontForm, aboutTitle: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-xs font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">
                        संस्था परिचय विस्तृत विवरण (About Society Paragraph):
                      </label>
                      <textarea
                        rows={4}
                        value={frontForm.aboutText}
                        onChange={(e) => setFrontForm({ ...frontForm, aboutText: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-xs leading-relaxed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">
                        ऋण नियम व शर्तें (Rules & Terms Guidelines):
                      </label>
                      <textarea
                        rows={4}
                        value={frontForm.rulesText}
                        onChange={(e) => setFrontForm({ ...frontForm, rulesText: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-xs font-mono"
                        placeholder="1. 24 या 36 माह की किस्तें...&#10;2. 2 जमानतदार..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    {frontSaveMessage ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>{frontSaveMessage}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        सहेजने पर फ्रंट पेज पर समस्त सामग्री तत्काल अद्यतन हो जाएगी।
                      </span>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4 text-amber-300" />
                      <span>फ्रंट पेज सामग्री सहेजें</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUB-TAB 3: BRANCH CONTACT & LEGAL DETAILS */}
            {websiteActiveTab === 'CONTACT' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-purple-50 text-purple-800 rounded-xl">
                      <Globe className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        शाखा कार्यालय एवं संपर्क विवरण संशोधन (Branch Contact & Legal Details)
                      </h3>
                      <p className="text-xs text-slate-500">
                        यहाँ से संशोधित किया गया फोन, ईमेल, पता, कार्य समय मुख्य पृष्ठ, फुटर, पावती रसीद व सदस्य पासबुक में स्वतः अद्यतन हो जाएगी।
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveContactInfo} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>शाखा कार्यालय का पूरा पता (Branch Office Address):</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.address}
                        onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold"
                        placeholder="उदा. साईं परिसर, कोलार रोड, भोपाल (म.प्र.) - 462042"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>मुख्य संपर्क / मोबाइल नंबर (Phone):</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-xs font-mono font-semibold"
                        placeholder="+91 755 2489012, +91 94250 12345"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>आधिकारिक ईमेल (Official Email):</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-xs font-mono"
                        placeholder="samajotthan.sai.bhopal@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>कार्यालय समय (Working Hours):</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.workingHours}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, workingHours: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-xs"
                        placeholder="प्रातः 10:00 बजे से सायं 05:00 बजे तक (रविवार अवकाश)"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        पंजीयन क्रमांक (Registration No.):
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.regNo}
                        onChange={(e) => setContactForm({ ...contactForm, regNo: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-xs font-mono"
                        placeholder="भोपाल/ARCS/2014/1042"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">
                        संस्था का ध्येय वाक्य (Society Tagline / Slogan):
                      </label>
                      <input
                        type="text"
                        value={contactForm.tagline}
                        onChange={(e) => setContactForm({ ...contactForm, tagline: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-xs"
                        placeholder="परस्पर सहयोग से स्वावलंबन एवं सामाजिक उत्थान"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        संस्था संक्षिप्त नाम (Short Name):
                      </label>
                      <input
                        type="text"
                        value={contactForm.shortName}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, shortName: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-xs"
                        placeholder="साईं साख संस्था"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    {contactSaveMessage ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>{contactSaveMessage}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        सहेजने पर फ्रंट पेज, संपर्क कार्ड, पावती रसीद व फुटर पर तत्काल नया विवरण दिखाई देगा।
                      </span>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4 text-amber-400" />
                      <span>वेबसाइट एवं संपर्क विवरण सहेजें</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 7 Guided Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveStep('STEP6_BOARD_BACKUP')}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                ⬅ पिछला चरण 6: संचालक मंडल व बैकअप
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveStep('STEP0_DASHBOARD')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>संस्था डैशबोर्ड पर लौटें ➔</span>
                </button>
                <button
                  onClick={() => setActiveStep('STEP1_LOANS')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <span>चरण 1: ऋण खाते व लेजर ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ARCHIVE CONFIRMATION MODAL */}
        {loanToArchive && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-2 border-amber-400 overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white p-6 border-b border-amber-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                      <Archive className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">
                        ऋण खाता आर्काइव (हटाना) करें
                      </h3>
                      <p className="text-xs text-amber-300">
                        वित्तीय गणना से अप्रभावित (Recalculate) सुरक्षित प्रक्रिया
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLoanToArchive(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-xs">
                {/* Target Borrower Card */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-900 text-xs">
                      #{loanToArchive.membershipNo} • खाता: {loanToArchive.accountNo}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900">
                      स्वीकृत: {formatINR(loanToArchive.loanAmount)}
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-950 text-sm">
                    {loanToArchive.borrowerName}
                  </div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <span>📱 {loanToArchive.phone}</span>
                    <span>•</span>
                    <span>अवधि: {loanToArchive.tenureMonths} माह</span>
                  </div>
                </div>

                {/* Clear Financial Explanation */}
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2.5 border border-slate-800">
                  <h4 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>आर्काइव करने से क्या होगा?</span>
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed list-disc list-inside">
                    <li>
                      यह सदस्य खाता मुख्य सक्रिय ऋण सूची से हटकर <strong>'आर्काइव फ़ाइल'</strong> में सुरक्षित रहेगा।
                    </li>
                    <li>
                      संस्था के <strong>डैशबोर्ड, कुल वितरित ऋण, शेष वसूली व देय ब्याज से इसकी राशि शून्य</strong> हो जाएगी (Recalculate)।
                    </li>
                    <li>
                      वेबसाइट के फ्रंट पेज पासबुक चयन से भी यह खाता तुरंत <strong>हट (बंद)</strong> जाएगा।
                    </li>
                    <li>
                      <strong>कभी भी पुनः सक्रिय:</strong> आप जब चाहें 'आर्काइव ऋण फ़ाइल' मेनू में जाकर 'पुनः सक्रिय करें' बटन दबाकर इसे वापस जोड़ सकते हैं, जिससे सारे वित्तीय आंकड़े स्वतः <strong>Recalculate</strong> हो जाएंगे।
                    </li>
                  </ul>
                </div>

                {/* Reason Selection */}
                <div>
                  <label className="block text-slate-800 font-extrabold mb-1.5 text-xs">
                    आर्काइव करने का कारण (Select Reason):
                  </label>
                  <select
                    value={archiveReason}
                    onChange={(e) => setArchiveReason(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-xs font-semibold"
                  >
                    <option value="सदस्य द्वारा खाता बंद / हटाया गया">सदस्य द्वारा खाता बंद / हटाया गया</option>
                    <option value="ऋण पूर्ण चुकता एवं खाता विलोपित">ऋण पूर्ण चुकता एवं खाता विलोपित</option>
                    <option value="दोहराव / गलत प्रविष्टि होने के कारण हटाया गया">दोहराव / गलत प्रविष्टि होने के कारण हटाया गया</option>
                    <option value="जांच अथवा ऑडिट हेतु अस्थाई रूप से निलंबित">जांच अथवा ऑडिट हेतु अस्थाई रूप से निलंबित</option>
                    <option value="अन्य प्रशासनिक कारण">अन्य प्रशासनिक कारण</option>
                  </select>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLoanToArchive(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = loanToArchive.borrowerName;
                    const acc = loanToArchive.accountNo;
                    archiveLoan(loanToArchive.id, archiveReason);
                    setLoanToArchive(null);
                    setArchiveSuccessMsg(
                      `ऋण खाता '${name}' (${acc}) को सुरक्षित आर्काइव में भेज दिया गया है। सभी कुल वित्तीय आंकड़े व देय राशि स्वतः रीकैलकुलेट हो चुकी है!`
                    );
                    setTimeout(() => setArchiveSuccessMsg(null), 6000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <Archive className="w-4 h-4" />
                  <span>हां, आर्काइव करें और गणना रीकैलकुलेट करें</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PERMANENT DELETE CONFIRMATION MODAL */}
        {loanToDeletePermanent && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-rose-500 overflow-hidden animate-fadeIn">
              <div className="bg-rose-950 text-white p-5 border-b border-rose-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-black text-white">
                    स्थाई रूप से डिलीट करें (Permanent Delete)
                  </h3>
                </div>
                <button
                  onClick={() => setLoanToDeletePermanent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950">
                  <p className="font-extrabold">
                    चेतावनी: यह क्रिया अपूरणीय है!
                  </p>
                  <p className="text-[11px] mt-1 text-rose-800">
                    सदस्य '{loanToDeletePermanent.borrowerName}' (खाता: {loanToDeletePermanent.accountNo}) का ऋण रिकॉर्ड सिस्टम से हमेशा के लिए मिट जाएगा।
                  </p>
                </div>
                <p className="text-slate-600 text-xs">
                  यदि आप इसे भविष्य के लिए सुरक्षित रखना चाहते हैं, तो इसे आर्काइव में ही रहने दें।
                </p>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLoanToDeletePermanent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = loanToDeletePermanent.borrowerName;
                    deleteLoanPermanent(loanToDeletePermanent.id);
                    setLoanToDeletePermanent(null);
                    setArchiveSuccessMsg(
                      `सदस्य '${name}' का रिकॉर्ड स्थाई रूप से हटा दिया गया है।`
                    );
                    setTimeout(() => setArchiveSuccessMsg(null), 5000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-md"
                >
                  स्थाई रूप से हटाएं
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: MEMBER LOAN PROGRESS GRAPH PREVIEW */}
        {previewGraphLoan && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border-2 border-rose-300 overflow-hidden animate-fadeIn my-auto">
              <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white p-4 sm:p-5 border-b border-rose-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-600 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      ऋण भुगतान व आउटस्टैंडिंग विश्लेषण: {previewGraphLoan.borrowerName}
                    </h3>
                    <p className="text-xs text-rose-200 font-mono">
                      खाता क्र. {previewGraphLoan.accountNo} • सदस्यता #{previewGraphLoan.membershipNo}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewGraphLoan(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <MemberLoanProgressGraph loan={previewGraphLoan} />

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">
                    स्वीकृत ऋण राशि: <strong className="text-slate-900 font-mono">{formatINR(previewGraphLoan.loanAmount)}</strong> • अवधि: {previewGraphLoan.tenureMonths} माह
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const target = previewGraphLoan;
                        setPreviewGraphLoan(null);
                        onOpenLedger(target);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      पूर्ण लेजर बही खोलें →
                    </button>
                    <button
                      onClick={() => setPreviewGraphLoan(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                    >
                      बंद करें
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

