import { BannerSlide, BoardMember, FrontPageConfig, LoanRecord, LoanSlab } from '../types';
import { generateSchedule } from '../utils/loanCalculations';

export const SOCIETY_INFO = {
  name: 'समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल',
  shortName: 'साई साख सहकारी संस्था',
  regNo: 'भोपाल/ARCS/2014/1042',
  tagline: 'परस्पर सहयोग से स्वावलंबन एवं सामाजिक उत्थान',
  address: 'साईं परिसर, कोलार रोड, भोपाल (म.प्र.) - 462042',
  phone: '+91 755 2489012, +91 94250 12345',
  email: 'samajotthan.sai.bhopal@gmail.com',
  workingHours: 'प्रातः 10:00 बजे से सायं 05:00 बजे तक (रविवार अवकाश)',
  establishedYear: '2014',
  defaultInterestRate: 14,
  penaltyRatePerDay: 2.6,
  processingFee: 500,
  buildingFund: 300,
};

export const INITIAL_LOAN_SLABS: LoanSlab[] = [
  {
    amount: 50000,
    label: '₹ 50,000 (पचास हजार)',
    tenureMonths: 24,
    interestRate: 14,
    processingFee: 500,
    buildingFund: 300,
    estimatedPreEmi: 2500,
    description: 'छोटे व्यवसाय व घरेलू आवश्यकताओं हेतु सुलभ ऋण योजना',
  },
  {
    amount: 100000,
    label: '₹ 1,00,000 (एक लाख)',
    tenureMonths: 24,
    interestRate: 14,
    processingFee: 500,
    buildingFund: 300,
    estimatedPreEmi: 5000,
    description: 'लघु उद्योग, व्यापार विस्तार व कृषि संबंधित कार्यों हेतु',
  },
  {
    amount: 150000,
    label: '₹ 1,50,000 (डेढ़ लाख)',
    tenureMonths: 24,
    interestRate: 14,
    processingFee: 500,
    buildingFund: 300,
    estimatedPreEmi: 7500,
    description: 'व्यावसायिक उपकरण व मध्यम अवधि ऋण योजना',
  },
  {
    amount: 200000,
    label: '₹ 2,00,000 (दो लाख)',
    tenureMonths: 24,
    interestRate: 14,
    processingFee: 500,
    buildingFund: 300,
    estimatedPreEmi: 10000,
    description: 'स्वरोजगार एवं पूंजी संवर्धन सहायता ऋण',
  },
  {
    amount: 300000,
    label: '₹ 3,00,000 (तीन लाख)',
    tenureMonths: 36,
    interestRate: 14,
    processingFee: 500,
    buildingFund: 300,
    estimatedPreEmi: 15000,
    description: 'मध्यम व्यावसायिक विस्तार एवं पूंजीगत निवेश ऋण',
  },
  {
    amount: 350000,
    label: '₹ 3,50,000 (साढ़े तीन लाख)',
    tenureMonths: 36,
    interestRate: 14,
    processingFee: 500,
    buildingFund: 300,
    estimatedPreEmi: 17500,
    description: 'दीर्घकालिक 36 माह की आसान किस्तों पर विशेष ऋण',
  },
  {
    amount: 400000,
    label: '₹ 4,00,000 (चार लाख)',
    tenureMonths: 36,
    interestRate: 14,
    processingFee: 500,
    buildingFund: 300,
    estimatedPreEmi: 20000,
    description: 'उच्चतम स्लैब 36 माह की सुगम घटते क्रम की ईएमआई योजना',
  },
];

export const INITIAL_BOARD_MEMBERS: BoardMember[] = [
  {
    id: 'bm-1',
    name: 'श्री राजेश शर्मा',
    designationHindi: 'अध्यक्ष',
    role: 'ADHYAKSHA',
    phone: '9826012345',
    order: 1,
  },
  {
    id: 'bm-2',
    name: 'श्री विजय वर्मा',
    designationHindi: 'उपाध्यक्ष',
    role: 'UPADHYAKSHA',
    phone: '9425023456',
    order: 2,
  },
  {
    id: 'bm-3',
    name: 'श्रीमती सुनीता पाटिल',
    designationHindi: 'उपाध्यक्ष',
    role: 'UPADHYAKSHA',
    phone: '9893034567',
    order: 3,
  },
  {
    id: 'bm-4',
    name: 'श्री रमेश चंद्र गुप्ता',
    designationHindi: 'संचालक',
    role: 'SANCHALAK',
    phone: '9827045678',
    order: 4,
  },
  {
    id: 'bm-5',
    name: 'श्री अशोक कुमार जैन',
    designationHindi: 'संचालक',
    role: 'SANCHALAK',
    phone: '9425156789',
    order: 5,
  },
  {
    id: 'bm-6',
    name: 'श्रीमती माया देवी कुशवाह',
    designationHindi: 'संचालक',
    role: 'SANCHALAK',
    phone: '9752067890',
    order: 6,
  },
  {
    id: 'bm-7',
    name: 'श्री दिनेश कुमार मालवीय',
    designationHindi: 'संचालक',
    role: 'SANCHALAK',
    phone: '9826278901',
    order: 7,
  },
  {
    id: 'bm-8',
    name: 'श्री संतोष सोलंकी',
    designationHindi: 'संचालक',
    role: 'SANCHALAK',
    phone: '9926389012',
    order: 8,
  },
  {
    id: 'bm-9',
    name: 'श्रीमती रेखा रघुवंशी',
    designationHindi: 'संचालक',
    role: 'SANCHALAK',
    phone: '9425490123',
    order: 9,
  },
  {
    id: 'bm-10',
    name: 'श्री प्रदीप चौहान',
    designationHindi: 'संचालक',
    role: 'SANCHALAK',
    phone: '9893501234',
    order: 10,
  },
  {
    id: 'bm-11',
    name: 'श्री मुकुल सक्सेना',
    designationHindi: 'संचालक',
    role: 'SANCHALAK',
    phone: '9755612345',
    order: 11,
  },
  {
    id: 'bm-12',
    name: 'श्री हेमंत पाटीदार',
    designationHindi: 'संचालक प्रतिनिधि',
    role: 'SANCHALAK_PRATINIDHI',
    phone: '9826723456',
    order: 12,
  },
  {
    id: 'bm-13',
    name: 'श्रीमति तन्‍मयी कोरसने',
    designationHindi: 'प्रबंधक',
    role: 'PRABANDHAK',
    phone: '9425034567',
    order: 13,
  },
];

// Helper to build pre-seeded Kanta Dongre installments (matching Images 1, 2, 3)
function createKantaDongreInstallments() {
  const base = generateSchedule(50000, 14, 24, '2023-05-02', 2.6);
  
  // Installment 1: Paid on time
  base[0].depositDate = '02/06/2023';
  base[0].delayDays = 0;
  base[0].paymentMode = 'चेक (Cheque)';
  base[0].chequeOrTxnNo = 'CHQ-88912';
  base[0].totalPaid = 2666;
  base[0].paidPrincipal = 2083;
  base[0].paidInterest = 583;
  base[0].penaltyCalculated = 0;
  base[0].penaltyCollected = 0;
  base[0].status = 'PAID';

  // Installment 2: Paid on time
  base[1].depositDate = '02/07/2023';
  base[1].delayDays = 0;
  base[1].paymentMode = 'नकद (Cash)';
  base[1].totalPaid = 2642;
  base[1].paidPrincipal = 2083;
  base[1].paidInterest = 559;
  base[1].penaltyCalculated = 0;
  base[1].penaltyCollected = 0;
  base[1].status = 'PAID';

  // Installment 3: Paid with 4 days delay
  base[2].depositDate = '06/08/2023';
  base[2].delayDays = 4;
  base[2].paymentMode = 'यूपीआई (UPI)';
  base[2].chequeOrTxnNo = 'UPI-239102';
  base[2].penaltyCalculated = 10; // 4 days * 2.6 = 10 (rounded)
  base[2].penaltyCollected = 10;
  base[2].totalPaid = 2628;
  base[2].paidPrincipal = 2083;
  base[2].paidInterest = 535;
  base[2].status = 'DELAYED_PAID';

  // Installment 4: Paid on time
  base[3].depositDate = '02/09/2023';
  base[3].delayDays = 0;
  base[3].paymentMode = 'नकद (Cash)';
  base[3].totalPaid = 2594;
  base[3].paidPrincipal = 2083;
  base[3].paidInterest = 511;
  base[3].penaltyCalculated = 0;
  base[3].penaltyCollected = 0;
  base[3].status = 'PAID';

  return base;
}

// Defaulter sample with 3 consecutive missed installments
function createDefaulterSampleInstallments() {
  const base = generateSchedule(150000, 14, 24, '2023-11-01', 2.6);
  // Installments 1 & 2 paid
  base[0].depositDate = '01/12/2023';
  base[0].paymentMode = 'नकद (Cash)';
  base[0].totalPaid = base[0].totalDue;
  base[0].paidPrincipal = base[0].duePrincipal;
  base[0].paidInterest = base[0].dueInterest;
  base[0].status = 'PAID';

  base[1].depositDate = '01/01/2024';
  base[1].paymentMode = 'नकद (Cash)';
  base[1].totalPaid = base[1].totalDue;
  base[1].paidPrincipal = base[1].duePrincipal;
  base[1].paidInterest = base[1].dueInterest;
  base[1].status = 'PAID';

  // Installments 3, 4, 5 are MISSED (past due and unpaid => Defaulter!)
  base[2].status = 'OVERDUE';
  base[2].delayDays = 85;
  base[2].penaltyCalculated = Math.round(85 * 2.6);

  base[3].status = 'OVERDUE';
  base[3].delayDays = 55;
  base[3].penaltyCalculated = Math.round(55 * 2.6);

  base[4].status = 'OVERDUE';
  base[4].delayDays = 25;
  base[4].penaltyCalculated = Math.round(25 * 2.6);

  return base;
}

export const INITIAL_LIVE_LOANS: LoanRecord[] = [
  {
    id: 'loan-live-213',
    isDummy: false,
    isLocked: true, // Protected live record
    borrowerName: 'कांता डोंगरे',
    fatherOrHusbandName: 'श्री रामेश्वर डोंगरे',
    membershipNo: '213',
    accountNo: 'SB-2023-0213',
    phone: '9826054321',
    address: 'म.नं. 45, गांधी नगर, कोलार रोड, भोपाल (म.प्र.)',
    loanDate: '2023-05-02',
    loanAmount: 50000,
    interestRate: 14,
    lateFeeRatePerDay: 2.6,
    tenureMonths: 24,
    advanceChequeNo: 'CHQ-649201',
    guarantor1: {
      name: 'श्री मुकेश डोंगरे',
      phone: '9826011223',
      address: 'कोलार रोड, भोपाल',
      chequeNo: 'CHQ-410291',
      relation: 'भाई',
      occupation: 'दुकानदार',
    },
    guarantor2: {
      name: 'श्री सुनील कुमार',
      phone: '9425099881',
      address: 'एमपी नगर, भोपाल',
      chequeNo: 'CHQ-301824',
      relation: 'मित्र',
      occupation: 'शासकीय सेवा',
    },
    preEmiDeductions: {
      preEmiAmount: 2500,
      processingFee: 500,
      buildingFund: 300,
      otherDeductions: 0,
      netDisbursed: 46700,
    },
    installments: createKantaDongreInstallments(),
    status: 'ACTIVE',
    passbookEnabled: true,
    createdAt: '2023-05-02T10:00:00Z',
    updatedAt: '2023-09-03T11:30:00Z',
    notes: 'नियमित भुगतान, सहकारी साख सदस्य।',
  },
  {
    id: 'loan-live-214',
    isDummy: false,
    isLocked: true,
    borrowerName: 'श्री मोहनलाल अहिरवार',
    fatherOrHusbandName: 'श्री ग्यारसीराम अहिरवार',
    membershipNo: '214',
    accountNo: 'SB-2023-0214',
    phone: '9893012345',
    address: 'वार्ड 12, बैरागढ़, भोपाल (म.प्र.)',
    loanDate: '2023-07-15',
    loanAmount: 100000,
    interestRate: 14,
    lateFeeRatePerDay: 2.6,
    tenureMonths: 24,
    advanceChequeNo: 'CHQ-778201',
    guarantor1: {
      name: 'श्री पूरन सिंह',
      phone: '9827011224',
      address: 'बैरागढ़, भोपाल',
      chequeNo: 'CHQ-552190',
      relation: 'संबधी',
      occupation: 'व्यापार',
    },
    guarantor2: {
      name: 'श्री जगदीश प्रसाद',
      phone: '9425123456',
      address: 'भोपाल',
      chequeNo: 'CHQ-552191',
      relation: 'सहकर्मी',
      occupation: 'निजी कार्य',
    },
    preEmiDeductions: {
      preEmiAmount: 5000,
      processingFee: 500,
      buildingFund: 300,
      otherDeductions: 0,
      netDisbursed: 94200,
    },
    installments: generateSchedule(100000, 14, 24, '2023-07-15', 2.6),
    status: 'ACTIVE',
    passbookEnabled: true,
    createdAt: '2023-07-15T11:00:00Z',
    updatedAt: '2023-07-15T11:00:00Z',
    notes: 'व्यापार विस्तार ऋण।',
  },
  {
    id: 'loan-live-215',
    isDummy: false,
    isLocked: true,
    borrowerName: 'श्रीमती सीमा परमार',
    fatherOrHusbandName: 'श्री विक्रम परमार',
    membershipNo: '215',
    accountNo: 'SB-2023-0215',
    phone: '9752098765',
    address: 'म.नं. 89, शाहपुरा, भोपाल (म.प्र.)',
    loanDate: '2023-11-01',
    loanAmount: 150000,
    interestRate: 14,
    lateFeeRatePerDay: 2.6,
    tenureMonths: 24,
    advanceChequeNo: 'CHQ-991204',
    guarantor1: {
      name: 'श्री विक्रम परमार',
      phone: '9752011225',
      address: 'शाहपुरा, भोपाल',
      chequeNo: 'CHQ-882190',
      relation: 'पति',
      occupation: 'व्यवसाय',
    },
    guarantor2: {
      name: 'श्री दीपक अहूजा',
      phone: '9826099882',
      address: 'अरेरा कॉलोनी, भोपाल',
      chequeNo: 'CHQ-882191',
      relation: 'मित्र',
      occupation: 'दुकानदार',
    },
    preEmiDeductions: {
      preEmiAmount: 7500,
      processingFee: 500,
      buildingFund: 300,
      otherDeductions: 0,
      netDisbursed: 141700,
    },
    installments: createDefaulterSampleInstallments(),
    status: 'DEFAULTER',
    passbookEnabled: false,
    isDefaulterByAdmin: true,
    adminDefaulterReason: '3 किश्तें मिस होने पर एडमिन द्वारा डिफ़ॉल्टर घोषित',
    createdAt: '2023-11-01T12:00:00Z',
    updatedAt: '2024-02-15T14:00:00Z',
    notes: '3 लगातार किश्तें बकाया - वसूली नोटिस प्रेषित।',
  },
];

export const INITIAL_DUMMY_LOANS: LoanRecord[] = [
  {
    id: 'loan-dummy-001',
    isDummy: true,
    isLocked: false,
    borrowerName: 'टेस्ट ऋणी (डमी प्रविष्टि)',
    fatherOrHusbandName: 'श्री परीक्षण लाल',
    membershipNo: 'TEST-999',
    accountNo: 'DUMMY-001',
    phone: '9999900000',
    address: 'डमी पता, परीक्षण हेतु केवल, भोपाल',
    loanDate: '2024-01-10',
    loanAmount: 50000,
    interestRate: 14,
    lateFeeRatePerDay: 2.6,
    tenureMonths: 24,
    advanceChequeNo: 'DUMMY-CHQ-001',
    guarantor1: {
      name: 'डमी जमानतदार 1',
      phone: '9999911111',
      address: 'भोपाल',
      chequeNo: 'DUMMY-G1',
      relation: 'मित्र',
    },
    guarantor2: {
      name: 'डमी जमानतदार 2',
      phone: '9999922222',
      address: 'भोपाल',
      chequeNo: 'DUMMY-G2',
      relation: 'सहकर्मी',
    },
    preEmiDeductions: {
      preEmiAmount: 2500,
      processingFee: 500,
      buildingFund: 300,
      otherDeductions: 0,
      netDisbursed: 46700,
    },
    installments: generateSchedule(50000, 14, 24, '2024-01-10', 2.6),
    status: 'ACTIVE',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
    notes: 'यह डमी रिकॉर्ड है। यह मुख्य गणना में नहीं जुड़ेगा।',
  },
];

export const INITIAL_BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    title: 'समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल',
    subtitle: '14% वार्षिक घटती ब्याज दर पर आसान व पारदर्शी ऋण',
    description: 'मध्य प्रदेश शासन सहकारिता विभाग द्वारा विधिवत पंजीकृत। भोपाल नगर में सदस्यों के आर्थिक स्वावलंबन एवं व्यवसाय संवर्धन हेतु विश्वसनीय साख सेवाएँ।',
    badgeText: 'म.प्र. सहकारिता विभाग पंजीकृत • पंजीयन: भोपाल/ARCS/2014/1042',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'सदस्य ऑनलाइन पासबुक',
    buttonAction: 'PASSBOOK',
    secondaryButtonText: 'ऋण कैलकुलेटर व स्लैब',
    secondaryButtonAction: 'CALCULATOR',
    accentColor: 'amber',
    isActive: true,
    order: 1,
  },
  {
    id: 'slide-2',
    title: 'व्यापार, कृषि एवं लघु उद्योग संवर्धन ऋण योजनाएँ',
    subtitle: '₹50,000 से ₹4,00,000 तक सुगम किस्तों में त्वरित स्वीकृति',
    description: 'न्यूनतम औपचारिक दस्तावेज, 2 साख जमानतदारों के आधार पर 24 से 36 माह की सुगम घटती किस्तों में ऋण सुविधा।',
    badgeText: 'त्वरित ऋण वितरण • पारदर्शी 24/36 माह किस्तें',
    imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'ऋण स्लैब व ब्याज दरें',
    buttonAction: 'CALCULATOR',
    secondaryButtonText: 'शाखा संपर्क करें',
    secondaryButtonAction: 'CONTACT',
    accentColor: 'emerald',
    isActive: true,
    order: 2,
  },
  {
    id: 'slide-3',
    title: 'महिला स्व-सहायता एवं स्वावलंबन सहायता',
    subtitle: 'परस्पर सहयोग से सामाजिक उत्थान एवं बचत संवर्धन',
    description: 'प्रत्येक किश्त भुगतान पर तत्काल डिजिटल पावती रसीद। समय से पूर्व भुगतान पर ब्याज की पूर्ण बचत एवं लेट फीस छूट।',
    badgeText: 'विश्वसनीय साख • 10+ वर्षों की निरंतर समर्पित सेवा',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'संचालक मंडल देखें',
    buttonAction: 'BOARD',
    secondaryButtonText: 'ऑनलाइन पासबुक',
    secondaryButtonAction: 'PASSBOOK',
    accentColor: 'blue',
    isActive: true,
    order: 3,
  },
  {
    id: 'slide-4',
    title: 'पूर्ण ऋण चुकता होने पर त्वरित No Dues एवं NOC सुविधा',
    subtitle: 'डिजिटल रसीद, तत्काल अदेयता प्रमाण पत्र व बैंक अनापत्ति पत्र',
    description: 'ऋण खाता शून्य होते ही संस्था की मुहर व अध्यक्ष/प्रबंधक के हस्ताक्षरयुक्त आधिकारिक No Dues एवं बैंक NOC प्राप्त करें।',
    badgeText: 'पारदर्शी डिजिटल साख प्रणाली • शून्य विलंब',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'पासबुक में स्थिति देखें',
    buttonAction: 'PASSBOOK',
    secondaryButtonText: 'कैलकुलेटर चार्ट',
    secondaryButtonAction: 'CALCULATOR',
    accentColor: 'purple',
    isActive: true,
    order: 4,
  },
];

export const DEFAULT_FRONT_PAGE_CONFIG: FrontPageConfig = {
  announcementTicker: 'सूचना: वित्तीय वर्ष 2024-25 हेतु नवीन ऋण आवेदन एवं नियमित किश्त जमा पर ब्याज बचत सुविधा उपलब्ध है। शाखा समय: प्रातः 10:00 से सायं 05:00 बजे तक। हेल्पलाइन: +91 755 2489012',
  heroHeading: 'समाजोत्थान साई साख सहकारी संस्था मर्यादित, भोपाल',
  heroSubheading: 'भोपाल (मध्य प्रदेश) • मध्य प्रदेश शासन सहकारिता विभाग द्वारा पंजीकृत',
  aboutTitle: 'संस्था का उद्देश्य एवं साख सेवाएँ',
  aboutText: 'समाजोत्थान साई साख सहकारी संस्था मर्यादित भोपाल, मध्य प्रदेश सहकारिता अधिनियम के अंतर्गत पंजीकृत एक प्रतिष्ठित संस्था है। हमारा उद्देश्य समाज के सभी वर्गों, लघु व्यापारियों, किसानों एवं स्व-रोजगार में संलग्न बंधुओं को आसान शर्तों और 14% वार्षिक घटती ब्याज दर पर ऋण सुविधा उपलब्ध कराकर आत्मनिर्भर बनाना है।',
  rulesText: '1. ऋण की अदायगी 24 अथवा 36 माह की घटते क्रम की मासिक किस्तों में होगी।\n2. प्रत्येक ऋण खाते हेतु 2 साख जमानतदार एवं अग्रिम चेक आवश्यक हैं।\n3. देय तिथि के उपरांत विलंब होने पर नियमानुसार लेट फीस देय होगी।\n4. पूर्ण ऋण चुकता होने पर संस्था द्वारा तत्काल No Dues एवं बैंक NOC जारी की जाएगी।',
};
