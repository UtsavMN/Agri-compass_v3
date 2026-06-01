// src/data/bankSchemes.ts

export interface BankScheme {
  id: string;
  bank: string;
  bankShort: string;
  bankLogo: string;
  schemeName: string;
  type: string;
  interestRate: string;
  loanAmount: string;
  eligibility: string;
  benefit: string;
  applyUrl: string;
  documents: string[];
  processingTime: string;
  tag: string;
}

export const BANK_SCHEMES: BankScheme[] = [
  {
    id: 'sbi-kcc',
    bank: 'State Bank of India',
    bankShort: 'SBI',
    bankLogo: '🏦',
    schemeName: 'Kisan Credit Card (KCC)',
    type: 'Crop Loan',
    interestRate: '7% p.a. (2% after subvention)',
    loanAmount: 'Up to ₹3 lakh (short term) — higher for term loans',
    eligibility: 'All farmers, tenant farmers, SHGs',
    benefit: 'RuPay debit card, revolving credit, harvest-linked repayment',
    applyUrl: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card',
    documents: ['Aadhaar', 'Land records', 'Cropping pattern', '2 passport photos'],
    processingTime: '7-15 working days',
    tag: 'Most Popular',
  },
  {
    id: 'sbi-gold-loan',
    bank: 'State Bank of India',
    bankShort: 'SBI',
    bankLogo: '🏦',
    schemeName: 'SBI Gold Loan for Agriculture',
    type: 'Gold Loan',
    interestRate: 'From 8.70% p.a.',
    loanAmount: 'Based on gold weight — up to 75% of gold value',
    eligibility: 'Farmers owning gold ornaments/coins',
    benefit: 'Quick disbursal in 30 minutes. No income proof needed.',
    applyUrl: 'https://sbi.co.in',
    documents: ['Aadhaar', 'PAN', 'Gold to pledge'],
    processingTime: '30 minutes',
    tag: 'Fast Approval',
  },
  {
    id: 'nabard-refinance',
    bank: 'NABARD',
    bankShort: 'NABARD',
    bankLogo: '🌾',
    schemeName: 'NABARD Refinance Scheme',
    type: 'Investment Credit',
    interestRate: 'Varies — refinanced via RRBs and Cooperative Banks',
    loanAmount: 'No upper limit for eligible projects',
    eligibility: 'Farmers accessing credit via RRBs or cooperative banks',
    benefit: 'Lower interest via refinanced credit. Long repayment up to 15 years.',
    applyUrl: 'https://www.nabard.org',
    documents: ['Project report', 'Land records', 'Bank account'],
    processingTime: '30-45 days',
    tag: 'Long Term',
  },
  {
    id: 'boi-kcc',
    bank: 'Bank of India',
    bankShort: 'BOI',
    bankLogo: '🏛️',
    schemeName: 'BOI Kisan Credit Card',
    type: 'Crop Loan',
    interestRate: '7% p.a. (2% after subvention)',
    loanAmount: 'Up to ₹3 lakh',
    eligibility: 'All cultivating farmers and tenant farmers',
    benefit: 'Animal husbandry and fishery also covered under same KCC.',
    applyUrl: 'https://www.bankofindia.co.in',
    documents: ['Aadhaar', 'Land records', 'Crop pattern'],
    processingTime: '7-10 working days',
    tag: 'Animal Husbandry',
  },
  {
    id: 'indian-bank-kcc',
    bank: 'Indian Bank',
    bankShort: 'Indian Bank',
    bankLogo: '🏦',
    schemeName: 'IND-DIGI-KCC',
    type: 'Crop Loan',
    interestRate: '7% p.a. (2% effective with subvention)',
    loanAmount: 'Up to ₹3 lakh digitally',
    eligibility: 'Farmers with Aadhaar-linked bank account',
    benefit: 'Fully digital application process. No branch visit needed.',
    applyUrl: 'https://www.indianbank.in',
    documents: ['Aadhaar', 'Mobile number', 'Land records (digital)'],
    processingTime: '3-5 working days',
    tag: 'Fully Digital',
  },
  {
    id: 'canara-agri',
    bank: 'Canara Bank',
    bankShort: 'Canara',
    bankLogo: '🏦',
    schemeName: 'Canara Kisan OD',
    type: 'Overdraft',
    interestRate: 'From 7% p.a.',
    loanAmount: 'Based on land holding and crop value',
    eligibility: 'Karnataka farmers with Canara Bank accounts',
    benefit: 'Overdraft facility linked to savings account. Use as needed.',
    applyUrl: 'https://canarabank.com',
    documents: ['Land records', 'Aadhaar', 'Bank statement'],
    processingTime: '10-15 working days',
    tag: 'Flexible Use',
  },
  {
    id: 'ksccb',
    bank: 'Karnataka State Cooperative',
    bankShort: 'KSCCB',
    bankLogo: '🤝',
    schemeName: 'KSCCB Crop Loan',
    type: 'Cooperative Loan',
    interestRate: '0% — interest-free for timely repayment',
    loanAmount: 'Up to ₹3 lakh for short-term crop needs',
    eligibility: 'Karnataka cooperative society members',
    benefit: 'Interest-free if repaid on time. Local branch in every taluk.',
    applyUrl: 'https://kscard.karnataka.gov.in',
    documents: ['Society membership', 'Land records', 'Aadhaar'],
    processingTime: '5-7 working days',
    tag: '0% Interest',
  },
  {
    id: 'mudra-agri',
    bank: 'All Banks (MUDRA)',
    bankShort: 'MUDRA',
    bankLogo: '💼',
    schemeName: 'MUDRA Agri Loan — Kishor/Tarun',
    type: 'MSME Loan',
    interestRate: 'From 8.5% p.a.',
    loanAmount: 'Kishor: ₹50,000–₹5 lakh | Tarun: ₹5 lakh–₹10 lakh',
    eligibility: 'Agri-allied activities, food processing, rural non-farm income',
    benefit: 'No collateral required. Covers agri-processing, dairy, poultry.',
    applyUrl: 'https://www.mudra.org.in',
    documents: ['Aadhaar', 'Business plan', 'Bank statement'],
    processingTime: '7-14 working days',
    tag: 'No Collateral',
  },
];
