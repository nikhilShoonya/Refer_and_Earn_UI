/**
 * Public surface of the Refer & Earn feature.
 *
 * Everything a host application needs is exported from here. When this ships as
 * an SDK, this file becomes the package entry point — the internal folder
 * layout stays private.
 */
export { ReferAndEarnNavigator } from './navigation/ReferAndEarnNavigator';
export type { ReferAndEarnParamList } from './navigation/ReferAndEarnNavigator';

export { ReferralProvider, useReferralClient } from './api/ReferralProvider';
export { createMockReferralClient } from './api/mockReferralClient';
export type { MockScenario } from './api/mockReferralClient';

export { ReferEarnHomeScreen } from './screens/ReferEarnHomeScreen';
export { MyReferralsScreen } from './screens/MyReferralsScreen';
export { BrokerageScreen } from './screens/BrokerageScreen';
export { ReferralWiseBrokerageScreen } from './screens/ReferralWiseBrokerageScreen';
export { HowItWorksScreen } from './screens/HowItWorksScreen';
export { FaqsScreen } from './screens/FaqsScreen';
export { SignupScreen } from './screens/SignupScreen';

export type {
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
  ReferralStage,
  ReferralStatus,
} from './api/types';
