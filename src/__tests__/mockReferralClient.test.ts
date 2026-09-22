import { createMockReferralClient } from '../features/referAndEarn/api/mockReferralClient';

describe('mock referral client', () => {
  it('returns the populated Day 1 figures by default', async () => {
    const client = createMockReferralClient('day1');
    const summary = await client.getEarningsSummary();

    expect(summary.total).toBe(6200);
    expect(summary.referralBonus).toEqual({ total: 2600, paid: 2000, pending: 600 });
    expect(summary.payoutCycle).toBe('7th of every month');
  });

  it('zeroes every figure on Day 0', async () => {
    const client = createMockReferralClient('day0');

    await expect(client.getEarningsSummary()).resolves.toMatchObject({ total: 0 });
    await expect(client.getFunnel('current_month')).resolves.toEqual({
      registered: 0,
      kycCompleted: 0,
      activated: 0,
    });
    await expect(client.getReferrals()).resolves.toEqual([]);
    await expect(client.getTopContributors()).resolves.toEqual([]);
  });

  it('seeds exactly one referral in the first-referral state', async () => {
    const client = createMockReferralClient('firstReferral');

    await expect(client.getFunnel('current_month')).resolves.toEqual({
      registered: 1,
      kycCompleted: 0,
      activated: 0,
    });
    const referrals = await client.getReferrals();
    expect(referrals).toHaveLength(1);
  });

  it('filters referrals by the requested status', async () => {
    const client = createMockReferralClient('day1');

    const kyc = await client.getReferrals({ status: 'kyc_completed' });
    expect(kyc.length).toBeGreaterThan(0);
    expect(kyc.every((r) => r.status === 'kyc_completed')).toBe(true);
  });

  describe('validateReferralCode', () => {
    const client = createMockReferralClient('day1');

    it('accepts a known code and names the referrer', async () => {
      await expect(client.validateReferralCode('FN184272')).resolves.toEqual({
        valid: true,
        referrerName: 'Rahul Sharma',
      });
    });

    it('is case and whitespace insensitive', async () => {
      await expect(client.validateReferralCode('  fn184272 ')).resolves.toMatchObject({
        valid: true,
      });
    });

    it('rejects anything else with the message from the design', async () => {
      await expect(client.validateReferralCode('NOPE123')).resolves.toEqual({
        valid: false,
        message: 'Invalid referral code',
      });
    });
  });

  describe('getReferralJourney', () => {
    const client = createMockReferralClient('day1');

    it('marks only Registered complete for a registered referral', async () => {
      const journey = await client.getReferralJourney('r1');
      const done = journey.steps.filter((s) => s.completedAt !== null).map((s) => s.key);

      expect(done).toEqual(['registered']);
      expect(journey.canRemind).toBe(true);
    });

    it('completes every step once activated, and stops offering a reminder', async () => {
      const journey = await client.getReferralJourney('r2');

      expect(journey.steps.every((s) => s.completedAt !== null)).toBe(true);
      expect(journey.canRemind).toBe(false);
    });

    it('always returns the four stages from the design', async () => {
      const journey = await client.getReferralJourney('r3');
      expect(journey.steps.map((s) => s.key)).toEqual([
        'registered',
        'kyc_completed',
        'activated',
        'bonus_credited',
      ]);
    });
  });
});
