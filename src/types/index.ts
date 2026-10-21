export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'DEFAULTER';

export type PaymentStatus = 'PAID' | 'DELAYED_PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';

export type BorrowerCategory = 'REGULAR' | 'WATCHLIST' | 'DEFAULTER' | 'CLOSED';

export interface GuarantorInfo {
  name: string;
  phone: string;
  address: string;
  chequeNo: string;
  relation?: string;
  occupation?: string;
}

export interface PreEmiDeductions {
  preEmiAmount: number;
  processingFee: number; // ₹ 500
  buildingFund: number;  // ₹ 300 (भवन निधि)
  otherDeductions: number;
  netDisbursed: number;  // Principal - (PreEmi + 500 + 300 + other)
}

export interface EmiInstallment {
  emiNo: number;                   // ईएमआई क्र.
  dueDate: string;                 // ईएमआई देय तिथि (DD/MM/YYYY)
  duePrincipal: number;            // देय मूलधन (₹)
  dueInterest: number;             // देय ब्याज (₹)
  totalDue: number;                // कुल देय राशि (₹)
  depositDate: string | null;      // जमा दिनांक
  delayDays: number;               // विलंब दिन (ऑटो)
  paymentMode: string;             // जमा का माध्यम (Cash / Cheque / UPI / NEFT)
  chequeOrTxnNo?: string;          // चेक या ट्रांजेक्शन क्र.
  totalPaid: number;               // कुल जमा राशि (₹)
  paidPrincipal: number;           // जमा मूलधन (₹)
  paidInterest: number;            // जमा ब्याज (ऑटो) (₹)
  penaltyCalculated: number;       // पेनल्टी (₹ 2.6 / day)
  penaltyCollected: number;        // ली गई पेनल्टी (₹)
  lateFee: number;                 // लेट फीस दर
  remainingPrincipal: number;      // शेष ऋण (मूलधन)
  status: PaymentStatus;
  pendingInterest?: number;        // बकाया ब्याज (यदि मूलधन जमा किया और ब्याज बाद में देगा)
  penaltyWaived?: number;          // संस्था द्वारा छूट दी गई लेट फीस
  paymentSplitType?: 'FULL' | 'PRINCIPAL_ONLY' | 'INTEREST_ONLY' | 'CUSTOM';
  paymentRemarks?: string;         // टिप्पणी (उदा. 'मूलधन जमा, ब्याज ₹559 बाद में देगा')
  isManualOverride?: boolean;      // Admin manually adjusted
  overrideReason?: string;
}

export interface LoanRecord {
  id: string;
  isDummy: boolean;                // Separates dummy test data from live cooperative data!
  isLocked: boolean;               // Live data lock protection
  borrowerName: string;            // ऋणी का नाम
  fatherOrHusbandName?: string;    // पिता/पति का नाम
  membershipNo: string;            // सदस्यता क्र.
  accountNo: string;               // खाता क्रमांक
  phone: string;                   // मोबाइल नंबर
  address: string;                 // पता
  loanDate: string;                // ऋण की तिथि (YYYY-MM-DD or DD/MM/YYYY)
  loanAmount: number;              // ऋण की राशि (50k, 1L, 1.5L, 2L, 3.5L, 4L, etc.)
  interestRate: number;            // ब्याज दर (14% वार्षिक घटते क्रम में)
  lateFeeRatePerDay: number;       // लेट फीस दर (Rs 2.6/Day)
  tenureMonths: number;            // अवधि (24 या 36 माह)
  advanceChequeNo: string;         // अग्रिम चेक क्र.
  guarantor1: GuarantorInfo;       // जमानतदार 1
  guarantor2: GuarantorInfo;       // जमानतदार 2
  preEmiDeductions: PreEmiDeductions;
  installments: EmiInstallment[];
  status: LoanStatus;
  isDefaulterByAdmin?: boolean;    // Admin explicit decision on defaulter status
  adminDefaulterReason?: string;   // Admin reason for marking or removing from defaulter
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type BoardRole = 
  | 'ADHYAKSHA' 
  | 'UPADHYAKSHA' 
  | 'SANCHALAK' 
  | 'SANCHALAK_PRATINIDHI' 
  | 'PRABANDHAK';

export interface BoardMember {
  id: string;
  name: string;                    // नाम
  designationHindi: string;        // पद (अध्यक्ष, उपाध्यक्ष, संचालक, संचालक प्रतिनिधि, प्रबंधक)
  role: BoardRole;
  phone?: string;
  photoUrl?: string;
  order: number;
}

export interface LoanSlab {
  amount: number;
  label: string;
  tenureMonths: number;
  interestRate: number;
  processingFee: number;
  buildingFund: number;
  estimatedPreEmi: number;
  description: string;
}

export interface MultiEmiPaymentItem {
  emiNo: number;
  paidPrincipal: number;
  paidInterest: number;
  penaltyCollected: number;
  totalPaid: number;
  delayDays: number;
  penaltyCalculated: number;
}

export interface BannerSlide {
  id: string;
  title: string;                 // मुख्य शीर्षक
  subtitle: string;              // उपशीर्षक
  description: string;           // विस्तृत विवरण
  badgeText: string;             // टैग / बैज
  imageUrl: string;              // स्लाइड फोटो (URL or base64 data)
  buttonText: string;            // प्राथमिक बटन
  buttonAction: 'CALCULATOR' | 'PASSBOOK' | 'BOARD' | 'CONTACT' | 'ADMIN';
  secondaryButtonText?: string;  // द्वितीयक बटन
  secondaryButtonAction?: 'CALCULATOR' | 'PASSBOOK' | 'BOARD' | 'CONTACT' | 'ADMIN';
  accentColor?: string;          // amber, emerald, blue, purple
  isActive: boolean;
  order: number;
}

export interface FrontPageConfig {
  announcementTicker: string;       // मुख्य सूचना पट्टी
  heroHeading: string;              // मुख्य शीर्षक
  heroSubheading: string;           // उपशीर्षक
  aboutTitle: string;               // संस्था परिचय शीर्षक
  aboutText: string;                // संस्था परिचय विस्तृत विवरण
  rulesText?: string;               // नियम व शर्तें
}

export interface SocietyInfo {
  name: string;
  shortName: string;
  regNo: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  establishedYear: string;
  defaultInterestRate: number;
  penaltyRatePerDay: number;
  processingFee: number;
  buildingFund: number;
}
