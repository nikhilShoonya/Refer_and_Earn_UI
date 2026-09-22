import React, { createContext, useContext, useMemo } from 'react';

import { createMockReferralClient, MockScenario } from './mockReferralClient';
import { ReferralClient } from './types';

interface ReferralContextValue {
  client: ReferralClient;
  /** Exposed so the demo harness can switch lifecycle states. */
  scenario: MockScenario;
}

const ReferralContext = createContext<ReferralContextValue | null>(null);

interface Props {
  children: React.ReactNode;
  /**
   * Host apps inject their own client here. When omitted the feature falls back
   * to the in-memory mock, which is what the standalone demo uses.
   */
  client?: ReferralClient;
  scenario?: MockScenario;
}

export function ReferralProvider({ children, client, scenario = 'day1' }: Props) {
  const value = useMemo<ReferralContextValue>(
    () => ({ client: client ?? createMockReferralClient(scenario), scenario }),
    [client, scenario],
  );

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}

export function useReferralClient(): ReferralClient {
  const ctx = useContext(ReferralContext);
  if (!ctx) {
    throw new Error('useReferralClient must be used inside <ReferralProvider>');
  }
  return ctx.client;
}

export function useReferralScenario(): MockScenario {
  const ctx = useContext(ReferralContext);
  if (!ctx) {
    throw new Error('useReferralScenario must be used inside <ReferralProvider>');
  }
  return ctx.scenario;
}
