import * as fixtures from '../data/mockData';

import {
  BrokerageByReferral,
  BrokerageSummary,
  Contributor,
  DateRangeFilter,
  EarningsSummary,
  FaqItem,
  FunnelCounts,
  Referral,
  ReferralClient,
  ReferralCodeInfo,
  ReferralCodeValidation,
  ReferralJourney,
  ReferralStatus,
} from './types';

/**
 * Which lifecycle state the app should present. The Figma file draws three:
 * an empty Day 0, a just-seeded "first referral", and a populated Day 1.
 */
export type MockScenario = 'day0' | 'firstReferral' | 'day1';

const LATENCY_MS = 220;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function journeyFor(referral: Referral): ReferralJourney {
  const reached = (stage: ReferralStatus[]) => stage.includes(referral.status);
  const registeredAt = `${referral.joinedAt}T10:35:00`;

  return {
    referralId: referral.id,
    name: referral.name,
    maskedPhone: referral.maskedPhone,
    canRemind: referral.status !== 'activated',
    steps: [
      { key: 'registered', label: 'Registered', completedAt: registeredAt },
      {
        key: 'kyc_completed',
        label: 'KYC Completed',
        completedAt: reached(['kyc_completed', 'activated']) ? `${referral.joinedAt}T14:02:00` : null,
      },
      {
        key: 'activated',
        label: 'Account Activated',
        completedAt: reached(['activated']) ? `${referral.joinedAt}T16:20:00` : null,
      },
      {
        key: 'bonus_credited',
        label: 'Referral Bonus Credited',
        completedAt: reached(['activated']) ? `${referral.joinedAt}T16:25:00` : null,
      },
    ],
  };
}

function referralsFor(status: ReferralStatus | 'all' | undefined): Referral[] {
  switch (status) {
    case 'registered':
      return fixtures.REGISTERED_REFERRALS;
    case 'kyc_completed':
      return fixtures.KYC_REFERRALS;
    case 'activated':
      return fixtures.ACTIVATED_REFERRALS;
    default:
      return fixtures.ALL_REFERRALS;
  }
}

/**
 * In-memory client used while there is no backend. Every method mirrors the
 * shape the real SDK will return, so swapping implementations is a one-line
 * change at the provider.
 */
export function createMockReferralClient(scenario: MockScenario = 'day1'): ReferralClient {
  const isEmpty = scenario === 'day0';
  const isFirst = scenario === 'firstReferral';

  return {
    getEarningsSummary(): Promise<EarningsSummary> {
      return delay(isEmpty || isFirst ? fixtures.EARNINGS_EMPTY : fixtures.EARNINGS_DAY1);
    },

    getFunnel(): Promise<FunnelCounts> {
      if (isEmpty) return delay({ registered: 0, kycCompleted: 0, activated: 0 });
      return delay(isFirst ? fixtures.FUNNEL_FIRST : fixtures.FUNNEL_DAY1);
    },

    getReferralTotals(): Promise<FunnelCounts> {
      if (isEmpty) return delay({ registered: 0, kycCompleted: 0, activated: 0 });
      if (isFirst) return delay({ registered: 1, kycCompleted: 0, activated: 0 });
      return delay(fixtures.REFERRAL_TOTALS);
    },

    getTopContributors(): Promise<Contributor[]> {
      return delay(isEmpty || isFirst ? [] : fixtures.CONTRIBUTORS);
    },

    getReferrals(filter): Promise<Referral[]> {
      if (isEmpty) return delay([]);
      if (isFirst) return delay(fixtures.RECENT_REFERRALS.slice(0, 1));
      return delay(referralsFor(filter?.status));
    },

    getReferralJourney(referralId): Promise<ReferralJourney> {
      const pool = [
        ...fixtures.ALL_REFERRALS,
        ...fixtures.REGISTERED_REFERRALS,
        ...fixtures.KYC_REFERRALS,
        ...fixtures.ACTIVATED_REFERRALS,
      ];
      const match = pool.find((r) => r.id === referralId) ?? fixtures.RECENT_REFERRALS[0];
      return delay(journeyFor(match));
    },

    remindReferral(): Promise<void> {
      return delay(undefined);
    },

    getBrokerageSummary(): Promise<BrokerageSummary> {
      if (isEmpty || isFirst) {
        return delay({
          total: 0,
          paid: 0,
          pending: 0,
          settlementDate: null,
          totalGenerated: null,
          sharePercent: 20,
        });
      }
      return delay(fixtures.BROKERAGE_SUMMARY);
    },

    getBrokerageByReferral(_date?: DateRangeFilter): Promise<BrokerageByReferral[]> {
      return delay(isEmpty || isFirst ? [] : fixtures.BROKERAGE_BY_REFERRAL);
    },

    getReferralCode(): Promise<ReferralCodeInfo> {
      return delay(fixtures.REFERRAL_CODE);
    },

    getFaqs(): Promise<FaqItem[]> {
      return delay(fixtures.FAQS);
    },

    validateReferralCode(code): Promise<ReferralCodeValidation> {
      const referrer = fixtures.VALID_REFERRAL_CODES[code.trim().toUpperCase()];
      return delay(
        referrer
          ? { valid: true as const, referrerName: referrer }
          : { valid: false as const, message: 'Invalid referral code' },
      );
    },
  };
}
