import {
  BrokerageByReferral,
  BrokerageSummary,
  Contributor,
  EarningsSummary,
  FaqItem,
  FunnelCounts,
  Referral,
  ReferralCodeInfo,
} from '../api/types';

/**
 * Fixture data transcribed from the Figma frames so the running app matches the
 * design screen-for-screen. Numbers are the designer's sample values.
 */

export const REFERRAL_CODE: ReferralCodeInfo = {
  // Figma shows both "FN184272" and "FNI84272"; the numeral-1 spelling is used
  // on every screen except two (open issue #2 in the spec).
  code: 'FN184272',
  shareUrl: 'https://shoonya.com/refer/FN184272',
};

/**
 * Day 1 earnings. Note the design's own totals do not reconcile
 * (2,600 + 5,900 != 6,200) — open issue #1. The headline is kept verbatim from
 * Figma rather than recomputed, so the screen matches the design; swap to a
 * derived total once product confirms the formula.
 */
export const EARNINGS_DAY1: EarningsSummary = {
  total: 6200,
  referralBonus: { total: 2600, paid: 2000, pending: 600 },
  brokerage: { total: 5900, paid: 5000, pending: 900 },
  payoutCycle: '7th of every month',
};

export const EARNINGS_EMPTY: EarningsSummary = {
  total: 0,
  referralBonus: { total: 0, paid: 0, pending: 0 },
  brokerage: { total: 0, paid: 0, pending: 0 },
  payoutCycle: '7th of every month',
};

export const FUNNEL_DAY1: FunnelCounts = { registered: 36, kycCompleted: 24, activated: 12 };
export const FUNNEL_FIRST: FunnelCounts = { registered: 1, kycCompleted: 0, activated: 0 };

export const CONTRIBUTORS: Contributor[] = [
  { id: 'c2', name: 'Akshay Thakur', amount: 1240, rank: 2 },
  { id: 'c1', name: 'Harsh Arora', amount: 2460, rank: 1 },
  { id: 'c3', name: 'Sachin Kumar', amount: 840, rank: 3 },
];

export const RECENT_REFERRALS: Referral[] = [
  { id: 'r1', name: 'Akshay Thakur', maskedPhone: '98*****602', status: 'registered', joinedAt: '2026-08-16' },
  { id: 'r2', name: 'Harsh Arora', maskedPhone: '98*****775', status: 'activated', joinedAt: '2026-08-16' },
  { id: 'r3', name: 'Sachin Kumar', maskedPhone: '82*****024', status: 'kyc_completed', joinedAt: '2026-08-16' },
];

/** "My Referrals / All" — the six rows drawn in Figma. */
export const ALL_REFERRALS: Referral[] = [
  ...RECENT_REFERRALS,
  { id: 'r4', name: 'Harsh Arora', maskedPhone: '62*****963', status: 'activated', joinedAt: '2026-08-16' },
  { id: 'r5', name: 'Harsh Arora', maskedPhone: '98*****236', status: 'activated', joinedAt: '2026-08-16' },
  { id: 'r6', name: 'Harsh Arora', maskedPhone: '82*****321', status: 'activated', joinedAt: '2026-08-16' },
];

export const REGISTERED_REFERRALS: Referral[] = [
  { id: 'g1', name: 'Akshay Thakur', maskedPhone: '98*****602', status: 'registered', joinedAt: '2026-08-16' },
  { id: 'g2', name: 'Brenda Diaz', maskedPhone: '87*****314', status: 'registered', joinedAt: '2026-09-22' },
  { id: 'g3', name: 'Carlos Perez', maskedPhone: '76*****829', status: 'registered', joinedAt: '2026-10-05' },
  { id: 'g4', name: 'Emily Moore', maskedPhone: '65*****193', status: 'registered', joinedAt: '2026-11-14' },
  { id: 'g5', name: 'Jin Kim', maskedPhone: '54*****720', status: 'registered', joinedAt: '2026-12-01' },
  // Figma shows a "Pending" pill on this row — open issue #6.
  { id: 'g6', name: 'Lara Michaels', maskedPhone: '43*****855', status: 'pending', joinedAt: '2027-01-10' },
];

export const KYC_REFERRALS: Referral[] = [
  { id: 'k1', name: 'Divya Singh', maskedPhone: '93*****543', status: 'kyc_completed', joinedAt: '2027-01-18' },
  { id: 'k2', name: 'Mohan Kapoor', maskedPhone: '85*****678', status: 'kyc_completed', joinedAt: '2026-12-01' },
  { id: 'k3', name: 'Lina Patel', maskedPhone: '88*****219', status: 'kyc_completed', joinedAt: '2026-11-12' },
  { id: 'k4', name: 'Anita Nair', maskedPhone: '91*****135', status: 'kyc_completed', joinedAt: '2026-09-22' },
  { id: 'k5', name: 'Ravi Verma', maskedPhone: '78*****432', status: 'kyc_completed', joinedAt: '2026-10-05' },
  { id: 'k6', name: 'Sachin Kumar', maskedPhone: '82*****024', status: 'kyc_completed', joinedAt: '2026-08-16' },
];

export const ACTIVATED_REFERRALS: Referral[] = [
  { id: 'a1', name: 'Zack Thompson', maskedPhone: '94*****567', status: 'activated', joinedAt: '2023-10-10' },
  { id: 'a2', name: 'Maya Joshi', maskedPhone: '95*****234', status: 'activated', joinedAt: '2026-01-30' },
  { id: 'a3', name: 'Sana Mirza', maskedPhone: '99*****123', status: 'activated', joinedAt: '2027-02-12' },
  { id: 'a4', name: 'Lina Nguyen', maskedPhone: '96*****789', status: 'activated', joinedAt: '2024-11-20' },
  { id: 'a5', name: 'Rohit Kumar', maskedPhone: '97*****456', status: 'activated', joinedAt: '2025-05-05' },
  { id: 'a6', name: 'Harsh Arora', maskedPhone: '98*****775', status: 'activated', joinedAt: '2026-08-16' },
];

/** Stat-card totals from the My Referrals header. */
export const REFERRAL_TOTALS = { registered: 120, kycCompleted: 80, activated: 40 };

export const BROKERAGE_SUMMARY: BrokerageSummary = {
  total: 2450,
  paid: 1210,
  pending: 1240,
  settlementDate: '2026-09-07',
  totalGenerated: 9800,
  sharePercent: 20,
};

export const BROKERAGE_MONTH_ONE: BrokerageSummary = {
  total: 1240,
  paid: 0,
  pending: 1240,
  settlementDate: '2026-09-07',
  totalGenerated: 9800,
  sharePercent: 20,
};

export const BROKERAGE_BY_REFERRAL: BrokerageByReferral[] = [
  { id: 'b1', name: 'Noah Davis', maskedPhone: '34*****567', generated: 2200, paid: 110, pending: 220, earned: 330 },
  { id: 'b2', name: 'Liam Smith', maskedPhone: '87*****654', generated: 1800, paid: 90, pending: 180, earned: 270 },
  { id: 'b3', name: 'Jacob Jones', maskedPhone: '98*****236', generated: 2400, paid: 120, pending: 240, earned: 360 },
  { id: 'b4', name: 'Olivia Brown', maskedPhone: '12*****345', generated: 5000, generatedLabel: 'Affiliate Sales', paid: 250, pending: 500, earned: 750 },
  { id: 'b5', name: 'Emma Watson', maskedPhone: '45*****789', generated: 3200, paid: 150, pending: 300, earned: 450 },
  { id: 'b6', name: 'Ava Wilson', maskedPhone: '56*****890', generated: 2800, paid: 140, pending: 280, earned: 420 },
];

export const FAQS: FaqItem[] = [
  {
    id: 'f1',
    question: 'What is Refer & Earn ?',
    answer: [
      'Refer & Earn lets you invite your friends and family to join Shoonya using your unique referral code or link.',
      'When your referred friend successfully completes account activation, you earn a **₹50 reward**. You can also earn **20% of the brokerage** generated by your referred users, subject to the applicable eligibility and settlement terms.',
    ],
  },
  {
    id: 'f2',
    question: 'Where can I find referral code?',
    answer: [
      'Your referral code sits in the footer at the bottom of every Refer & Earn screen.',
      'Tap the **copy icon** beside it to copy the code, or open the **QR code** to let a friend scan it directly.',
    ],
  },
  {
    id: 'f3',
    question: 'What is my referral code?',
    answer: [
      `Your referral code is **${REFERRAL_CODE.code}**.`,
      'It is unique to your account and never changes, so you can share the same code every time.',
    ],
  },
  {
    id: 'f4',
    question: 'How do I refer a friend?',
    answer: [
      'Tap **Invite via Whatsapp** to send your referral link straight from the app, or use the share icon to pick any other app.',
      'Your friend applies the code while signing up — it cannot be added once their account already exists.',
    ],
  },
  {
    id: 'f5',
    question: 'How does my friend use my referral code?',
    answer: [
      'On the Shoonya signup screen they tap **Have a Referral Code?**, enter your code and tap **Verify**.',
      'Your name appears once the code is accepted, so they can confirm it is you before continuing.',
    ],
  },
  {
    id: 'f6',
    question: 'How do I earn ₹50 referral bonus',
    answer: [
      'The **₹50 bonus** is credited once your referred friend completes KYC and activates their account.',
      'Registering alone does not earn the bonus — the account has to reach **Activated**.',
    ],
  },
  {
    id: 'f7',
    question: 'How much brokerage sharing do I earn?',
    answer: [
      'You earn **20% of the brokerage** generated by every friend you refer.',
      'The share is calculated on the brokerage they actually pay, and it keeps accruing for as long as they trade.',
    ],
  },
  {
    id: 'f8',
    question: 'When is brokerage sharing paid?',
    answer: [
      'Eligible earnings accrue as **Pending** and are settled on the **7th of every month**.',
      'On the settlement date they move from Pending to **Paid** and are credited to your account.',
    ],
  },
  {
    id: 'f9',
    question: 'Is brokerage sharing lifetime?',
    answer: [
      'Yes. There is no expiry on brokerage sharing.',
      'You keep earning **20%** for the lifetime of the referred account, subject to the applicable eligibility terms.',
    ],
  },
  {
    id: 'f10',
    question: 'How can I track my referrals?',
    answer: [
      'Open **My Referrals** to see every referral with its current stage.',
      'Tap **View Journey** on any row for a step-by-step timeline of that referral, from registration through to the bonus being credited.',
    ],
  },
  {
    id: 'f11',
    question: 'What do Registered, KYC Completed and Activated mean?',
    answer: [
      'They are the three stages a referral moves through.',
      '**Registered** means your friend signed up. **KYC Completed** means their identity checks passed. **Activated** means the account is live and they can trade — the stage that earns you the **₹50 bonus**.',
    ],
  },
];

/** Codes the mock treats as valid during signup (Flow 2). */
export const VALID_REFERRAL_CODES: Record<string, string> = {
  FN184272: 'Rahul Sharma',
  FNI84272: 'Rahul Sharma',
};
