import React, { createContext, useContext, useEffect, useState } from 'react';
import { BannerSlide, BoardMember, EmiInstallment, FrontPageConfig, LoanRecord, LoanStatus, PaymentStatus, SocietyInfo } from '../types';
import {
  DEFAULT_FRONT_PAGE_CONFIG,
  INITIAL_BANNER_SLIDES,
  INITIAL_BOARD_MEMBERS,
  INITIAL_DUMMY_LOANS,
  INITIAL_LIVE_LOANS,
  SOCIETY_INFO,
} from '../data/initialData';
import { calculateDelayDays, calculatePenalty, evaluateDefaulterStatus, getStandardPreEmi } from '../utils/loanCalculations';

const normalizeLoanDeductions = (l: LoanRecord): LoanRecord => {
  const stdPreEmi = getStandardPreEmi(l.loanAmount);
  const pFee = l.preEmiDeductions?.processingFee || 500;
  const bFund = l.preEmiDeductions?.buildingFund || 300;
  return {
    ...l,
    preEmiDeductions: {
      preEmiAmount: stdPreEmi,
      processingFee: pFee,
      buildingFund: bFund,
      otherDeductions: l.preEmiDeductions?.otherDeductions || 0,
      netDisbursed: Math.round(l.loanAmount - (stdPreEmi + pFee + bFund)),
    },
  };
};

type WorkingMode = 'LIVE' | 'DUMMY';

export interface SingleEmiPayment {
  emiNo: number;
  paidPrincipal: number;
  paidInterest: number;
  penaltyCollected: number;
  penaltyWaived?: number;
  pendingInterest?: number;
  totalPaid: number;
  delayDays: number;
  penaltyCalculated?: number;
  paymentSplitType?: 'FULL' | 'PRINCIPAL_ONLY' | 'INTEREST_ONLY' | 'CUSTOM';
  remarks?: string;
}

export interface MultiPaymentPayload {
  loanId: string;
  depositDate: string;
  paymentMode: string;
  chequeOrTxnNo?: string;
  payments: SingleEmiPayment[];
  notes?: string;
}

interface SocietyContextType {
  mode: WorkingMode;
  setMode: (mode: WorkingMode) => void;
  loans: LoanRecord[];
  allLiveLoans: LoanRecord[];
  allDummyLoans: LoanRecord[];
  boardMembers: BoardMember[];
  
  // Website & Society Contact Info
  societyInfo: SocietyInfo;
  updateSocietyInfo: (info: Partial<SocietyInfo>) => void;

  // Banner Slides Operations
  bannerSlides: BannerSlide[];
  updateBannerSlide: (slide: BannerSlide) => void;
  addBannerSlide: (slide: Omit<BannerSlide, 'id'>) => void;
  deleteBannerSlide: (id: string) => void;
  resetBannerSlides: () => void;

  // Front Page Full Content Config
  frontPageConfig: FrontPageConfig;
  updateFrontPageConfig: (config: Partial<FrontPageConfig>) => void;
  
  // Loan Operations
  addLoan: (loanData: Omit<LoanRecord, 'id' | 'isDummy' | 'createdAt' | 'updatedAt'>) => LoanRecord;
  updateLoan: (loan: LoanRecord) => void;
  deleteLoan: (id: string) => boolean;
  toggleLockLoan: (id: string) => void;
  
  // Payment Operations (Single & Multi-EMI)
  recordMultiPayment: (payload: MultiPaymentPayload) => boolean;
  recordLumpSumPayment: (
    loanId: string,
    depositDate: string,
    totalCashAmount: number,
    paymentMode: string,
    chequeOrTxnNo?: string
  ) => boolean;
  manualOverrideInstallment: (
    loanId: string,
    emiNo: number,
    updatedFields: Partial<EmiInstallment>,
    reason?: string
  ) => boolean;
  
  // Defaulter Admin Decision
  setLoanDefaulterStatus: (loanId: string, isDefaulter: boolean, reason?: string) => void;
  
  // Board Member Operations
  addBoardMember: (member: Omit<BoardMember, 'id'>) => void;
  updateBoardMember: (member: BoardMember) => void;
  deleteBoardMember: (id: string) => void;

  // Data persistence & export
  exportBackupData: () => string;
  importBackupData: (jsonString: string) => boolean;
  resetAllData: () => void;
}

const STORAGE_KEY_LIVE = 'SAMAJOTTHAN_SAI_LIVE_DATA_v3';
const STORAGE_KEY_DUMMY = 'SAMAJOTTHAN_SAI_DUMMY_DATA_v3';
const STORAGE_KEY_BOARD = 'SAMAJOTTHAN_SAI_BOARD_MEMBERS_v3';
const STORAGE_KEY_MODE = 'SAMAJOTTHAN_SAI_ACTIVE_MODE_v3';
const STORAGE_KEY_INFO = 'SAMAJOTTHAN_SAI_INFO_v3';
const STORAGE_KEY_SLIDES = 'SAMAJOTTHAN_SAI_SLIDES_v3';
const STORAGE_KEY_FRONT_CONFIG = 'SAMAJOTTHAN_SAI_FRONT_CONFIG_v3';

const SocietyContext = createContext<SocietyContextType | undefined>(undefined);

export const SocietyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<WorkingMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODE);
      return saved === 'DUMMY' ? 'DUMMY' : 'LIVE';
    } catch {
      return 'LIVE';
    }
  });

  const [liveLoans, setLiveLoans] = useState<LoanRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LIVE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeLoanDeductions);
        }
      }
    } catch (e) {
      console.warn('Error reading live loans:', e);
    }
    return INITIAL_LIVE_LOANS;
  });

  const [dummyLoans, setDummyLoans] = useState<LoanRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DUMMY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeLoanDeductions);
        }
      }
    } catch (e) {
      console.warn('Error reading dummy loans:', e);
    }
    return INITIAL_DUMMY_LOANS;
  });

  const [boardMembers, setBoardMembers] = useState<BoardMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOARD);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: BoardMember) =>
            m.role === 'PRABANDHAK' || m.designationHindi === 'प्रबंधक' || m.name.includes('अखिलेश') || m.name.includes('akhilesh') || m.name.includes('तन्मयी')
              ? { ...m, name: 'श्रीमति तन्‍मयी कोरसने', designationHindi: 'प्रबंधक', role: 'PRABANDHAK' }
              : m
          );
        }
      }
    } catch (e) {
      console.warn('Error reading board members:', e);
    }
    return INITIAL_BOARD_MEMBERS;
  });

  const [societyInfo, setSocietyInfo] = useState<SocietyInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INFO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...SOCIETY_INFO, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Error reading society info:', e);
    }
    return SOCIETY_INFO;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INFO, JSON.stringify(societyInfo));
    } catch (e) {
      console.error('Failed to sync society info:', e);
    }
  }, [societyInfo]);

  const updateSocietyInfo = (updates: Partial<SocietyInfo>) => {
    setSocietyInfo((prev) => ({ ...prev, ...updates }));
  };

  // Banner Slides State & Management
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SLIDES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading banner slides:', e);
    }
    return INITIAL_BANNER_SLIDES;
  });

  // Front Page Full Content Config
  const [frontPageConfig, setFrontPageConfig] = useState<FrontPageConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FRONT_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_FRONT_PAGE_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('Error reading front page config:', e);
    }
    return DEFAULT_FRONT_PAGE_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(bannerSlides));
    } catch (e) {
      console.error('Failed to sync banner slides:', e);
    }
  }, [bannerSlides]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FRONT_CONFIG, JSON.stringify(frontPageConfig));
    } catch (e) {
      console.error('Failed to sync front page config:', e);
    }
  }, [frontPageConfig]);

  const updateBannerSlide = (updatedSlide: BannerSlide) => {
    setBannerSlides((prev) =>
      prev.map((s) => (s.id === updatedSlide.id ? updatedSlide : s))
    );
  };

  const addBannerSlide = (newSlideData: Omit<BannerSlide, 'id'>) => {
    const newSlide: BannerSlide = {
      ...newSlideData,
      id: `slide-${Date.now()}`,
    };
    setBannerSlides((prev) => [...prev, newSlide]);
  };

  const deleteBannerSlide = (id: string) => {
    setBannerSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const resetBannerSlides = () => {
    setBannerSlides(INITIAL_BANNER_SLIDES);
  };

  const updateFrontPageConfig = (updates: Partial<FrontPageConfig>) => {
    setFrontPageConfig((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LIVE, JSON.stringify(liveLoans));
    } catch (e) {
      console.error('Failed to sync live loans:', e);
    }
  }, [liveLoans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DUMMY, JSON.stringify(dummyLoans));
    } catch (e) {
      console.error('Failed to sync dummy loans:', e);
    }
  }, [dummyLoans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOARD, JSON.stringify(boardMembers));
    } catch (e) {
      console.error('Failed to sync board members:', e);
    }
  }, [boardMembers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch (e) {
      console.error('Failed to sync mode:', e);
    }
  }, [mode]);

  const setMode = (newMode: WorkingMode) => {
    setModeState(newMode);
  };

  const currentLoans = mode === 'LIVE' ? liveLoans : dummyLoans;

  const addLoan = (loanData: Omit<LoanRecord, 'id' | 'isDummy' | 'createdAt' | 'updatedAt'>): LoanRecord => {
    const isDummy = mode === 'DUMMY';
    const now = new Date().toISOString();
    const newRecord: LoanRecord = {
      ...loanData,
      id: `loan-${isDummy ? 'dummy' : 'live'}-${Date.now()}`,
      isDummy,
      createdAt: now,
      updatedAt: now,
    };

    if (isDummy) {
      setDummyLoans((prev) => [newRecord, ...prev]);
    } else {
      setLiveLoans((prev) => [newRecord, ...prev]);
    }

    return newRecord;
  };

  const updateLoan = (updated: LoanRecord) => {
    const now = new Date().toISOString();
    const withTimestamp = { ...updated, updatedAt: now };

    const defaulterCheck = evaluateDefaulterStatus(withTimestamp.installments);
    if (defaulterCheck.isDefaulter && withTimestamp.status !== 'CLOSED') {
      withTimestamp.status = 'DEFAULTER';
    } else if (!defaulterCheck.isDefaulter && withTimestamp.status === 'DEFAULTER') {
      withTimestamp.status = 'ACTIVE';
    }

    if (withTimestamp.isDummy) {
      setDummyLoans((prev) => prev.map((l) => (l.id === withTimestamp.id ? withTimestamp : l)));
    } else {
      setLiveLoans((prev) => prev.map((l) => (l.id === withTimestamp.id ? withTimestamp : l)));
    }
  };

  const deleteLoan = (id: string): boolean => {
    if (mode === 'LIVE') {
      const target = liveLoans.find((l) => l.id === id);
      if (target?.isLocked) return false;
      setLiveLoans((prev) => prev.filter((l) => l.id !== id));
      return true;
    } else {
      setDummyLoans((prev) => prev.filter((l) => l.id !== id));
      return true;
    }
  };

  const toggleLockLoan = (id: string) => {
    if (mode === 'LIVE') {
      setLiveLoans((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isLocked: !l.isLocked } : l))
      );
    } else {
      setDummyLoans((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isLocked: !l.isLocked } : l))
      );
    }
  };

  // ADMIN DEFAULTER DECISION: Admin explicitly decides who stays in Defaulter list
  const setLoanDefaulterStatus = (loanId: string, isDefaulter: boolean, reason?: string) => {
    const updater = (prev: LoanRecord[]) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;
        return {
          ...l,
          isDefaulterByAdmin: isDefaulter,
          status: isDefaulter ? ('DEFAULTER' as LoanStatus) : (l.status === 'DEFAULTER' ? ('ACTIVE' as LoanStatus) : l.status),
          adminDefaulterReason: reason || (isDefaulter ? 'एडमिन द्वारा डिफ़ॉल्टर घोषित' : 'एडमिन द्वारा डिफ़ॉल्टर से मुक्त'),
          notes: reason
            ? `${l.notes ? l.notes + ' | ' : ''}एडमिन निर्णय: ${isDefaulter ? 'डिफ़ॉल्टर घोषित' : 'डिफ़ॉल्टर सूची से बाहर'} (${reason})`
            : l.notes,
          updatedAt: new Date().toISOString(),
        };
      });

    if (mode === 'LIVE') {
      setLiveLoans(updater);
    } else {
      setDummyLoans(updater);
    }
  };

  // MULTI-EMI PAYMENT: User can pay 1, 2, 3 or multiple EMIs in a single transaction
  const recordMultiPayment = (payload: MultiPaymentPayload): boolean => {
    const loanList = mode === 'LIVE' ? liveLoans : dummyLoans;
    const loan = loanList.find((l) => l.id === payload.loanId);
    if (!loan) return false;

    const paymentMap = new Map<number, SingleEmiPayment>();
    payload.payments.forEach((p) => paymentMap.set(p.emiNo, p));

    let runningPrincipal = loan.loanAmount;
    const updatedInstallments = loan.installments.map((inst) => {
      const paymentItem = paymentMap.get(inst.emiNo);
      if (paymentItem) {
        const delayDays = paymentItem.delayDays;
        const autoPenalty = calculatePenalty(delayDays, loan.lateFeeRatePerDay || 2.6);
        
        let status: PaymentStatus = 'PAID';
        const isPrincipalOnly = paymentItem.paymentSplitType === 'PRINCIPAL_ONLY' || ((paymentItem.pendingInterest || 0) > 0);
        const isInterestOnly = paymentItem.paymentSplitType === 'INTEREST_ONLY' || (paymentItem.paidPrincipal === 0 && paymentItem.paidInterest > 0);

        if (isPrincipalOnly || isInterestOnly) {
          status = 'PARTIAL';
        } else if (delayDays > 0) {
          status = 'DELAYED_PAID';
        } else {
          status = 'PAID';
        }

        const paidPrincipal = Math.round(paymentItem.paidPrincipal || 0);
        runningPrincipal = Math.max(0, runningPrincipal - paidPrincipal);

        return {
          ...inst,
          depositDate: payload.depositDate,
          delayDays,
          paymentMode: payload.paymentMode,
          chequeOrTxnNo: payload.chequeOrTxnNo || '',
          totalPaid: Math.round(paymentItem.totalPaid),
          paidPrincipal,
          paidInterest: Math.round(paymentItem.paidInterest || 0),
          penaltyCalculated: autoPenalty,
          penaltyCollected: Math.round(paymentItem.penaltyCollected || 0),
          penaltyWaived: Math.round(paymentItem.penaltyWaived || 0),
          pendingInterest: Math.round(paymentItem.pendingInterest || 0),
          paymentSplitType: paymentItem.paymentSplitType || 'FULL',
          paymentRemarks: paymentItem.remarks || '',
          remainingPrincipal: runningPrincipal,
          status,
        };
      } else {
        const prevPaidP = inst.paidPrincipal || 0;
        runningPrincipal = Math.max(0, runningPrincipal - prevPaidP);
        return {
          ...inst,
          remainingPrincipal: runningPrincipal,
        };
      }
    });

    const allPaid = updatedInstallments.every((i) => i.status === 'PAID' || i.status === 'DELAYED_PAID');
    const defaulterCheck = evaluateDefaulterStatus(updatedInstallments);

    let nextStatus: LoanStatus = loan.status;
    if (allPaid) {
      nextStatus = 'CLOSED';
    } else if (loan.isDefaulterByAdmin === true) {
      nextStatus = 'DEFAULTER';
    } else if (loan.isDefaulterByAdmin === false) {
      nextStatus = 'ACTIVE';
    } else if (defaulterCheck.isDefaulter) {
      nextStatus = 'DEFAULTER';
    } else if (loan.status === 'DEFAULTER') {
      nextStatus = 'ACTIVE';
    }

    const updatedLoan: LoanRecord = {
      ...loan,
      installments: updatedInstallments,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    updateLoan(updatedLoan);
    return true;
  };

  // LUMP SUM AMOUNT ALLOCATION: e.g. member comes with ₹10,000 cash
  const recordLumpSumPayment = (
    loanId: string,
    depositDate: string,
    totalCashAmount: number,
    paymentMode: string,
    chequeOrTxnNo?: string
  ): boolean => {
    const loanList = mode === 'LIVE' ? liveLoans : dummyLoans;
    const loan = loanList.find((l) => l.id === loanId);
    if (!loan || totalCashAmount <= 0) return false;

    let unallocated = totalCashAmount;
    const paymentsToApply: SingleEmiPayment[] = [];

    for (const inst of loan.installments) {
      const isAlreadyPaid = inst.status === 'PAID' || inst.status === 'DELAYED_PAID' || inst.totalPaid >= inst.totalDue;
      if (isAlreadyPaid) continue;

      if (unallocated <= 0) break;

      const delayDays = calculateDelayDays(inst.dueDate, depositDate);
      const penalty = calculatePenalty(delayDays, loan.lateFeeRatePerDay || 2.6);
      const emiRequired = inst.totalDue + penalty;

      if (unallocated >= emiRequired) {
        // Full EMI paid
        paymentsToApply.push({
          emiNo: inst.emiNo,
          paidPrincipal: inst.duePrincipal,
          paidInterest: inst.dueInterest,
          penaltyCollected: penalty,
          totalPaid: emiRequired,
          delayDays,
          penaltyCalculated: penalty,
        });
        unallocated -= emiRequired;
      } else {
        // Partial pay to this EMI
        const paidInterest = Math.min(inst.dueInterest, unallocated);
        const remAfterInterest = unallocated - paidInterest;
        const paidPrincipal = Math.min(inst.duePrincipal, remAfterInterest);
        paymentsToApply.push({
          emiNo: inst.emiNo,
          paidPrincipal,
          paidInterest,
          penaltyCollected: 0,
          totalPaid: unallocated,
          delayDays,
          penaltyCalculated: penalty,
        });
        unallocated = 0;
        break;
      }
    }

    if (paymentsToApply.length === 0) return false;

    return recordMultiPayment({
      loanId,
      depositDate,
      paymentMode,
      chequeOrTxnNo,
      payments: paymentsToApply,
      notes: `एकमुश्त ₹ ${totalCashAmount} का समायोजन`,
    });
  };

  const manualOverrideInstallment = (
    loanId: string,
    emiNo: number,
    updatedFields: Partial<EmiInstallment>,
    reason?: string
  ): boolean => {
    const loanList = mode === 'LIVE' ? liveLoans : dummyLoans;
    const loan = loanList.find((l) => l.id === loanId);
    if (!loan) return false;

    const updatedInstallments = loan.installments.map((inst) => {
      if (inst.emiNo === emiNo) {
        return {
          ...inst,
          ...updatedFields,
          isManualOverride: true,
          overrideReason: reason || 'प्रशासक द्वारा मैन्युअल समायोजन',
        };
      }
      return inst;
    });

    const updatedLoan: LoanRecord = {
      ...loan,
      installments: updatedInstallments,
      updatedAt: new Date().toISOString(),
    };

    updateLoan(updatedLoan);
    return true;
  };

  const addBoardMember = (member: Omit<BoardMember, 'id'>) => {
    const newMember: BoardMember = {
      ...member,
      id: `bm-${Date.now()}`,
    };
    setBoardMembers((prev) => [...prev, newMember]);
  };

  const updateBoardMember = (member: BoardMember) => {
    setBoardMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
  };

  const deleteBoardMember = (id: string) => {
    setBoardMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const exportBackupData = (): string => {
    const exportObject = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      societyInfo,
      liveLoans,
      dummyLoans,
      boardMembers,
      bannerSlides,
      frontPageConfig,
    };
    return JSON.stringify(exportObject, null, 2);
  };

  const importBackupData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data && typeof data.societyInfo === 'object') setSocietyInfo({ ...SOCIETY_INFO, ...data.societyInfo });
      if (data && Array.isArray(data.liveLoans)) setLiveLoans(data.liveLoans);
      if (data && Array.isArray(data.dummyLoans)) setDummyLoans(data.dummyLoans);
      if (data && Array.isArray(data.boardMembers)) setBoardMembers(data.boardMembers);
      if (data && Array.isArray(data.bannerSlides)) setBannerSlides(data.bannerSlides);
      if (data && typeof data.frontPageConfig === 'object') setFrontPageConfig({ ...DEFAULT_FRONT_PAGE_CONFIG, ...data.frontPageConfig });
      return true;
    } catch (e) {
      console.error('Failed to import backup data:', e);
      return false;
    }
  };

  const resetAllData = () => {
    setSocietyInfo(SOCIETY_INFO);
    setLiveLoans(INITIAL_LIVE_LOANS);
    setDummyLoans(INITIAL_DUMMY_LOANS);
    setBoardMembers(INITIAL_BOARD_MEMBERS);
    setBannerSlides(INITIAL_BANNER_SLIDES);
    setFrontPageConfig(DEFAULT_FRONT_PAGE_CONFIG);
    setModeState('LIVE');
    localStorage.removeItem(STORAGE_KEY_INFO);
    localStorage.removeItem(STORAGE_KEY_LIVE);
    localStorage.removeItem(STORAGE_KEY_DUMMY);
    localStorage.removeItem(STORAGE_KEY_BOARD);
    localStorage.removeItem(STORAGE_KEY_MODE);
    localStorage.removeItem(STORAGE_KEY_SLIDES);
    localStorage.removeItem(STORAGE_KEY_FRONT_CONFIG);
  };

  return (
    <SocietyContext.Provider
      value={{
        mode,
        setMode,
        loans: currentLoans,
        allLiveLoans: liveLoans,
        allDummyLoans: dummyLoans,
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
        addLoan,
        updateLoan,
        deleteLoan,
        toggleLockLoan,
        recordMultiPayment,
        recordLumpSumPayment,
        manualOverrideInstallment,
        setLoanDefaulterStatus,
        addBoardMember,
        updateBoardMember,
        deleteBoardMember,
        exportBackupData,
        importBackupData,
        resetAllData,
      }}
    >
      {children}
    </SocietyContext.Provider>
  );
};

export const useSociety = () => {
  const context = useContext(SocietyContext);
  if (!context) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
};
