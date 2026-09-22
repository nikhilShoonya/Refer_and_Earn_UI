/**
 * Domain types for the Refer & Earn feature.
 *
 * These are deliberately transport-agnostic: when the real SDK lands it only
 * has to satisfy `ReferralClient`, and no screen or component changes.
 */

/** The three lifecycle stages defined in the Figma design. */
export type ReferralStage = 'registered' | 'kyc_completed' | 'activated';

/**
 * The Figma file also shows a "Pending" pill on one Registered-tab row
 * (open issue #6 in docs/figma-design-spec.txt). It is modelled here so the UI
 * can render it, but it is not part of the documented funnel.
 */
export type ReferralStatus = ReferralStage | 'pending';

export interface Referral {
  id: string;
  name: string;
  /** Already masked by the backend, e.g. "98*****602". */
  maskedPhone: string;
  status: ReferralStatus;
  /** ISO-8601. Formatted for display at the edge. */
  joinedAt: string;
}

export interface JourneyStep {
  key: 'registered' | 'kyc_completed' | 'activated' | 'bonus_credited';
  label: string;
  /** ISO-8601 when complete, null while pending. */
  completedAt: string | null;
}

export interface ReferralJourney {
  referralId: string;
  name: string;
  maskedPhone: string;
  steps: JourneyStep[];
  /** Whether a nudge can be sent right now. */
  canRemind: boolean;
}

export interface PaidPendingSplit {
  paid: number;
  pending: number;
}

export interface EarningsSummary {
  /** Headline figure shown as "Your Total Earnings". */
  total: number;
  referralBonus: PaidPendingSplit & { total: number };
  brokerage: PaidPendingSplit & { total: number };
  /** Human-readable cadence, e.g. "7th of every month". */
  payoutCycle: string;
}

export interface FunnelCounts {
  registered: number;
  kycCompleted: number;
  activated: number;
}

export interface Contributor {
  id: string;
  name: string;
  amount: number;
  rank: 1 | 2 | 3;
  /** Figma fills the podium avatar with a photo; initials are the fallback. */
  avatarUrl?: string;
}

export interface BrokerageSummary {
  /** "Your Brokerage Earnings". */
  total: number;
  paid: number;
  pending: number;
  /** Null until the first settlement has been scheduled. */
  settlementDate: string | null;
  /** Gross brokerage the referred users generated. */
  totalGenerated: number | null;
  sharePercent: number;
}

export interface BrokerageByReferral {
  id: string;
  name: string;
  maskedPhone: string;
  generated: number;
  /**
   * Heading for the `generated` column. Figma varies it per row — most say
   * "Brokerage Generated", Olivia Brown's says "Affiliate Sales".
   */
  generatedLabel?: string;
  paid: number;
  pending: number;
  earned: number;
  /** Figma fills the row avatar with a photo; initials are the fallback. */
  avatarUrl?: string;
}

export interface ReferralCodeInfo {
  code: string;
  shareUrl: string;
}

export interface FaqItem {
  id: string;
  question: string;
  /**
   * One entry per paragraph. `**...**` marks the phrases the design sets in
   * semibold, e.g. the reward amounts.
   */
  answer: string[];
}

/** Result of validating a referral code during signup (Flow 2). */
export type ReferralCodeValidation =
  | { valid: true; referrerName: string }
  | { valid: false; message: string };

export type DateRangeFilter =
  | { kind: 'current_month' }
  | { kind: 'previous_month' }
  | { kind: 'range'; from: string; to: string };

/**
 * The single seam between this feature and the outside world.
 *
 * Today it is fulfilled by `createMockReferralClient`. Packaging the feature as
 * an SDK means shipping a client that talks to the real service — nothing in
 * the UI layer needs to know which one it got.
 */
export interface ReferralClient {
  getEarningsSummary(): Promise<EarningsSummary>;
  getFunnel(period: string): Promise<FunnelCounts>;
  /** Lifetime totals for My Referrals — distinct from the funnel's period counts. */
  getReferralTotals(): Promise<FunnelCounts>;
  getTopContributors(): Promise<Contributor[]>;
  getReferrals(filter?: {
    status?: ReferralStatus | 'all';
    date?: DateRangeFilter;
  }): Promise<Referral[]>;
  getReferralJourney(referralId: string): Promise<ReferralJourney>;
  remindReferral(referralId: string): Promise<void>;
  getBrokerageSummary(): Promise<BrokerageSummary>;
  getBrokerageByReferral(date?: DateRangeFilter): Promise<BrokerageByReferral[]>;
  getReferralCode(): Promise<ReferralCodeInfo>;
  getFaqs(): Promise<FaqItem[]>;
  validateReferralCode(code: string): Promise<ReferralCodeValidation>;

}
