import { BorrowerCategory, EmiInstallment, LoanRecord, LoanStatus, PaymentStatus } from '../types';

/**
 * Generates reducing-balance EMI schedule matching cooperative society formula (Image 3)
 */
export function generateSchedule(
  principal: number,
  annualRate: number = 14,
  tenureMonths: number = 24,
  startDateStr: string = new Date().toISOString().split('T')[0],
  lateFeeRatePerDay: number = 2.6
): EmiInstallment[] {
  const installments: EmiInstallment[] = [];
  // Complete whole number monthly principal for customer collection
  const monthlyPrincipal = Math.floor(principal / tenureMonths);
  
  const start = new Date(startDateStr);
  const startDay = start.getDate();

  let remainingPrincipal = Math.round(principal);

  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(start.getFullYear(), start.getMonth() + i, startDay);
    const dueDateFormatted = formatDateToDisplay(dueDate);

    // Complete whole number interest (no paise decimals)
    const interest = Math.round(remainingPrincipal * (annualRate / 100) / 12);

    let currentPrincipal = monthlyPrincipal;
    if (i === tenureMonths) {
      currentPrincipal = remainingPrincipal; // Last installment balances exactly to principal
    }

    const totalDue = currentPrincipal + interest;
    const balanceAfter = Math.max(0, remainingPrincipal - currentPrincipal);

    installments.push({
      emiNo: i,
      dueDate: dueDateFormatted,
      duePrincipal: currentPrincipal,
      dueInterest: interest,
      totalDue: totalDue,
      depositDate: null,
      delayDays: 0,
      paymentMode: '',
      chequeOrTxnNo: '',
      totalPaid: 0,
      paidPrincipal: 0,
      paidInterest: 0,
      penaltyCalculated: 0,
      penaltyCollected: 0,
      lateFee: lateFeeRatePerDay,
      remainingPrincipal: balanceAfter,
      status: 'PENDING',
    });

    remainingPrincipal = balanceAfter;
  }

  return installments;
}

export function formatDateToDisplay(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function parseDisplayDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function calculateDelayDays(dueDateStr: string, paymentDateStr?: string | null): number {
  const dueDate = parseDisplayDate(dueDateStr);
  if (!dueDate) return 0;

  const compareDate = paymentDateStr ? parseDisplayDate(paymentDateStr) : new Date();
  if (!compareDate) return 0;

  dueDate.setHours(0, 0, 0, 0);
  compareDate.setHours(0, 0, 0, 0);

  const diffMs = compareDate.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function calculatePenalty(delayDays: number, dailyRate: number = 2.6): number {
  if (delayDays <= 0) return 0;
  // Complete whole number rupees for customer collection
  return Math.round(delayDays * dailyRate);
}

export function evaluateDefaulterStatus(installments: EmiInstallment[]): {
  isDefaulter: boolean;
  consecutiveMissedCount: number;
  totalMissedCount: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentConsecutive = 0;
  let maxConsecutive = 0;
  let totalMissed = 0;

  for (const inst of installments) {
    const due = parseDisplayDate(inst.dueDate);
    const isPastDue = due ? due < today : false;
    const isPaid = inst.status === 'PAID' || inst.status === 'DELAYED_PAID' || inst.totalPaid >= inst.totalDue;

    if (!isPaid && isPastDue) {
      currentConsecutive++;
      totalMissed++;
      if (currentConsecutive > maxConsecutive) {
        maxConsecutive = currentConsecutive;
      }
    } else if (isPaid) {
      currentConsecutive = 0;
    }
  }

  return {
    isDefaulter: maxConsecutive >= 3,
    consecutiveMissedCount: maxConsecutive,
    totalMissedCount: totalMissed,
  };
}

/**
 * Classifies borrower performance:
 * - Admin explicit decision takes first priority (isDefaulterByAdmin)
 * - REGULAR: 'सही समय पर देने वाले' (No overdue installments)
 * - WATCHLIST: 'दिक्कत करने वाले' (1-2 overdue installments)
 * - DEFAULTER: 'डिफ़ॉल्टर' (Admin declared OR 3+ consecutive missed installments)
 * - CLOSED: 'पूर्ण चुकता'
 */
export function classifyBorrower(loan: LoanRecord): BorrowerCategory {
  if (loan.status === 'CLOSED') return 'CLOSED';
  
  // 1. Admin explicit decision
  if (loan.isDefaulterByAdmin === true || loan.status === 'DEFAULTER') {
    return 'DEFAULTER';
  }
  if (loan.isDefaulterByAdmin === false) {
    // Admin explicitly took member out of defaulters
    const def = evaluateDefaulterStatus(loan.installments);
    if (def.totalMissedCount > 0) return 'WATCHLIST';
    return 'REGULAR';
  }

  // 2. System recommendation based on 3+ consecutive missed installments
  const def = evaluateDefaulterStatus(loan.installments);
  if (def.isDefaulter) return 'DEFAULTER';
  if (def.totalMissedCount > 0) return 'WATCHLIST';
  return 'REGULAR';
}

export function calculateInstallmentTotals(installments: EmiInstallment[]) {
  return installments.reduce(
    (acc, inst) => {
      acc.totalDuePrincipal += inst.duePrincipal || 0;
      acc.totalDueInterest += inst.dueInterest || 0;
      acc.totalDueAmount += inst.totalDue || 0;
      acc.totalDelayDays += inst.delayDays || 0;
      acc.totalPaidAmount += inst.totalPaid || 0;
      acc.totalPaidPrincipal += inst.paidPrincipal || 0;
      acc.totalPaidInterest += inst.paidInterest || 0;
      acc.totalPenaltyCalculated += inst.penaltyCalculated || 0;
      acc.totalPenaltyCollected += inst.penaltyCollected || 0;
      return acc;
    },
    {
      totalDuePrincipal: 0,
      totalDueInterest: 0,
      totalDueAmount: 0,
      totalDelayDays: 0,
      totalPaidAmount: 0,
      totalPaidPrincipal: 0,
      totalPaidInterest: 0,
      totalPenaltyCalculated: 0,
      totalPenaltyCollected: 0,
    }
  );
}

/**
 * Calculates high-clarity dashboard tracking:
 * - kitnaDiya (Total Disbursed)
 * - kitnaAaya (Total Recovered)
 * - kitnaBacha (Total Outstanding)
 * - sahiSeDeneWale (Good Regular Payers count)
 * - dikkatKarneWale (Delayed Payers count)
 * - defaulters (3+ consecutive missed)
 */
export function calculateComprehensiveStats(loans: LoanRecord[]) {
  let kitnaDiya = 0;
  let totalPaidPrincipal = 0;
  let totalPaidInterest = 0;
  let totalPenaltyCollected = 0;
  let totalPenaltyWaived = 0;
  let totalPendingInterest = 0;
  let totalProcessingFees = 0;
  let totalBuildingFund = 0;
  let totalPreEmiDeducted = 0;
  let totalOutstandingPrincipal = 0;

  let sahiSeDeneWale = 0;
  let dikkatKarneWale = 0;
  let defaultersCount = 0;
  let closedCount = 0;

  let defaulterAmountAtRisk = 0;
  let watchlistAmount = 0;
  let regularAmount = 0;

  let tenure24Count = 0;
  let tenure24Amount = 0;
  let tenure36Count = 0;
  let tenure36Amount = 0;

  let totalInstallmentsCount = 0;
  let paidInstallmentsCount = 0;
  let delayedPaidCount = 0;
  let overdueInstallmentsCount = 0;
  let partialInstallmentsCount = 0;
  let totalDelayDaysSum = 0;
  let delayedInstallmentItemsCount = 0;
  let futureProjectedInterest = 0;
  let upcomingCycleDues = 0;

  let womenBorrowersCount = 0;
  let menBorrowersCount = 0;

  loans.forEach((loan) => {
    kitnaDiya += loan.loanAmount;
    totalProcessingFees += loan.preEmiDeductions?.processingFee || 500;
    totalBuildingFund += loan.preEmiDeductions?.buildingFund || 300;
    totalPreEmiDeducted += loan.preEmiDeductions?.preEmiAmount || 0;

    if (loan.tenureMonths === 36) {
      tenure36Count++;
      tenure36Amount += loan.loanAmount;
    } else {
      tenure24Count++;
      tenure24Amount += loan.loanAmount;
    }

    const name = loan.borrowerName.toLowerCase();
    if (
      name.includes('श्रीमति') ||
      name.includes('श्रीमती') ||
      name.includes('कु.') ||
      name.includes('बाई') ||
      name.includes('देवी') ||
      name.includes('कांता') ||
      name.includes('मीना') ||
      name.includes('रेखा') ||
      name.includes('अनिता') ||
      name.includes('सुनीता') ||
      name.includes('संगीता') ||
      name.includes('आरती') ||
      name.includes('लता')
    ) {
      womenBorrowersCount++;
    } else {
      menBorrowersCount++;
    }

    let loanPaidPrincipal = 0;
    let hasFoundNextDue = false;

    loan.installments.forEach((inst) => {
      totalInstallmentsCount++;
      const pPrin = inst.paidPrincipal || 0;
      const pInt = inst.paidInterest || 0;
      const pPen = inst.penaltyCollected || 0;
      const pWaived = inst.penaltyWaived || 0;
      const pPendingInt = inst.pendingInterest || 0;

      loanPaidPrincipal += pPrin;
      totalPaidPrincipal += pPrin;
      totalPaidInterest += pInt;
      totalPenaltyCollected += pPen;
      totalPenaltyWaived += pWaived;
      totalPendingInterest += pPendingInt;

      if (inst.status === 'PAID') {
        paidInstallmentsCount++;
      } else if (inst.status === 'DELAYED_PAID') {
        delayedPaidCount++;
        totalDelayDaysSum += inst.delayDays || 0;
        delayedInstallmentItemsCount++;
      } else if (inst.status === 'PARTIAL') {
        partialInstallmentsCount++;
      } else if (inst.status === 'OVERDUE' || (inst.delayDays > 0 && inst.totalPaid < inst.totalDue)) {
        overdueInstallmentsCount++;
        totalDelayDaysSum += inst.delayDays || 0;
        delayedInstallmentItemsCount++;
      }

      if (inst.status !== 'PAID' && inst.status !== 'DELAYED_PAID' && inst.totalPaid < inst.totalDue) {
        futureProjectedInterest += Math.max(0, inst.dueInterest - pInt);
        if (!hasFoundNextDue) {
          upcomingCycleDues += inst.totalDue;
          hasFoundNextDue = true;
        }
      }
    });

    const balance = Math.max(0, loan.loanAmount - loanPaidPrincipal);
    totalOutstandingPrincipal += balance;

    const cat = classifyBorrower(loan);
    if (cat === 'REGULAR') {
      sahiSeDeneWale++;
      regularAmount += balance;
    } else if (cat === 'WATCHLIST') {
      dikkatKarneWale++;
      watchlistAmount += balance;
    } else if (cat === 'DEFAULTER') {
      defaultersCount++;
      defaulterAmountAtRisk += balance;
    } else if (cat === 'CLOSED') {
      closedCount++;
    }
  });

  const totalSocietyIncome = totalPaidInterest + totalPenaltyCollected + totalProcessingFees + totalBuildingFund;
  const kitnaAaya = totalPaidPrincipal + totalPaidInterest + totalPenaltyCollected;
  const kitnaBacha = totalOutstandingPrincipal;
  const totalLoansCount = loans.length;
  const onTimePaymentRate =
    paidInstallmentsCount + delayedPaidCount > 0
      ? Math.round((paidInstallmentsCount / (paidInstallmentsCount + delayedPaidCount)) * 100)
      : 100;
  const averageDelayDays =
    delayedInstallmentItemsCount > 0
      ? Math.round(totalDelayDaysSum / delayedInstallmentItemsCount)
      : 0;

  return {
    kitnaDiya,
    kitnaAaya,
    kitnaBacha,
    totalPaidPrincipal,
    totalPaidInterest,
    totalPenaltyCollected,
    totalPenaltyWaived,
    totalPendingInterest,
    totalProcessingFees,
    totalBuildingFund,
    totalPreEmiDeducted,
    totalSocietyIncome,
    totalLoansCount,
    sahiSeDeneWale,
    dikkatKarneWale,
    defaultersCount,
    closedCount,
    defaulterAmountAtRisk,
    watchlistAmount,
    regularAmount,
    tenure24Count,
    tenure24Amount,
    tenure36Count,
    tenure36Amount,
    averageLoanSize: totalLoansCount > 0 ? Math.round(kitnaDiya / totalLoansCount) : 0,
    recoveryPercentage: kitnaDiya > 0 ? Math.round((totalPaidPrincipal / kitnaDiya) * 1000) / 10 : 0,
    onTimePaymentRate,
    averageDelayDays,
    totalInstallmentsCount,
    paidInstallmentsCount,
    delayedPaidCount,
    overdueInstallmentsCount,
    partialInstallmentsCount,
    futureProjectedInterest,
    upcomingCycleDues,
    womenBorrowersCount,
    menBorrowersCount,
  };
}

export function formatINR(val: number, showDecimals: boolean = false): string {
  if (isNaN(val)) return '₹ 0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(Math.round(val));
}

/**
 * Downloads a formatted CSV file
 */
export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        let text = val === null || val === undefined ? '' : String(val);
        text = text.replace(/"/g, '""');
        if (text.search(/("|,|\n)/g) >= 0) {
          text = `"${text}"`;
        }
        return text;
      })
      .join(',');
  };

  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculates pre-EMI upfront deduction as per society's exact slab rules:
 * - 50k (₹ 50,000): ₹ 2,500
 * - 1,00,000 (1L): ₹ 5,000
 * - 1,50,000 (1.5L): ₹ 7,500
 * - 2,00,000 (2L): ₹ 10,000
 * - 3,00,000 (3L): ₹ 15,000
 * - 3,50,000 (3.5L): ₹ 17,500
 * - 4,00,000 (4L): ₹ 20,000
 * Rule: exactly 5% of loan amount
 */
export function getStandardPreEmi(amount: number): number {
  if (amount === 50000) return 2500;
  if (amount === 100000) return 5000;
  if (amount === 150000) return 7500;
  if (amount === 200000) return 10000;
  if (amount === 300000) return 15000;
  if (amount === 350000) return 17500;
  if (amount === 400000) return 20000;
  return Math.round(amount * 0.05);
}

export function calculateNetChequeDisbursed(
  loanAmount: number,
  processingFee: number = 500,
  buildingFund: number = 300
): {
  preEmi: number;
  processingFee: number;
  buildingFund: number;
  totalDeductions: number;
  netChequeAmount: number;
} {
  const preEmi = getStandardPreEmi(loanAmount);
  const totalDeductions = preEmi + processingFee + buildingFund;
  const netChequeAmount = Math.max(0, loanAmount - totalDeductions);
  return {
    preEmi,
    processingFee,
    buildingFund,
    totalDeductions,
    netChequeAmount,
  };
}
