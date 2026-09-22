import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ReferralProvider } from '../features/referAndEarn/api/ReferralProvider';
import { ReferralCodeSheet } from '../features/referAndEarn/sheets/ReferralCodeSheet';

/** The sheet reads safe-area insets, so tests need deterministic metrics. */
const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

async function renderSheet(onApply = jest.fn()) {
  await render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <ReferralProvider scenario="day1">
        <ReferralCodeSheet visible onClose={jest.fn()} onApply={onApply} />
      </ReferralProvider>
    </SafeAreaProvider>,
  );
  return { onApply };
}

/** Flow 2 of the Referee Journey — the referral code sheet on signup. */
describe('ReferralCodeSheet', () => {
  it('opens on the Verify action with no referrer named yet', async () => {
    await renderSheet();

    expect(screen.getByText('Verify')).toBeTruthy();
    expect(screen.queryByText(/Referred by/)).toBeNull();
  });

  it('verifies a valid code and names the referrer', async () => {
    await renderSheet();

    await fireEvent.changeText(screen.getByLabelText('Referral code'), 'FN184272');
    await fireEvent.press(screen.getByText('Verify'));

    await waitFor(() => expect(screen.getByText('Referred by Rahul Sharma')).toBeTruthy());
    // Once verified the primary action advances rather than re-verifying.
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('surfaces the error message from the design for an unknown code', async () => {
    await renderSheet();

    await fireEvent.changeText(screen.getByLabelText('Referral code'), 'BADCODE');
    await fireEvent.press(screen.getByText('Verify'));

    await waitFor(() => expect(screen.getByText('Invalid referral code')).toBeTruthy());
    expect(screen.queryByText(/Referred by/)).toBeNull();
  });

  it('hands the verified code back to the signup screen on Continue', async () => {
    const { onApply } = await renderSheet();

    await fireEvent.changeText(screen.getByLabelText('Referral code'), 'fn184272');
    await fireEvent.press(screen.getByText('Verify'));
    await waitFor(() => screen.getByText('Continue'));

    await fireEvent.press(screen.getByText('Continue'));
    expect(onApply).toHaveBeenCalledWith('FN184272', 'Rahul Sharma');
  });

  it('clears a stale error once the code is edited again', async () => {
    await renderSheet();
    const input = screen.getByLabelText('Referral code');

    await fireEvent.changeText(input, 'BADCODE');
    await fireEvent.press(screen.getByText('Verify'));
    await waitFor(() => screen.getByText('Invalid referral code'));

    await fireEvent.changeText(input, 'FN18');
    expect(screen.queryByText('Invalid referral code')).toBeNull();
  });
});
