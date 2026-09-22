import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { FaqAccordion } from '../features/referAndEarn/components/FaqAccordion';
import { FAQS } from '../features/referAndEarn/data/mockData';

describe('FaqAccordion', () => {
  it('opens the first item and keeps the rest collapsed', async () => {
    await render(<FaqAccordion items={FAQS} />);

    // The first answer's opening paragraph is visible...
    expect(screen.getByText(/Refer & Earn lets you invite/)).toBeTruthy();
    // ...while a later item shows only its question.
    expect(screen.getByText('Is brokerage sharing lifetime?')).toBeTruthy();
    expect(screen.queryByText(/There is no expiry/)).toBeNull();
  });

  it('renders each answer paragraph as its own block', async () => {
    await render(<FaqAccordion items={FAQS} />);

    // The design breaks the first answer after "...referral code or link."
    expect(screen.getByText(/referral code or link\.$/)).toBeTruthy();
    expect(screen.getByText(/When your referred friend successfully/)).toBeTruthy();
  });

  it('strips the emphasis markers from the rendered copy', async () => {
    await render(<FaqAccordion items={FAQS} />);

    // `**` is markup, not content — it must never reach the screen.
    expect(screen.queryByText(/\*\*/)).toBeNull();
    expect(screen.getByText('₹50 reward')).toBeTruthy();
    expect(screen.getByText('20% of the brokerage')).toBeTruthy();
  });

  it('expands another item on tap', async () => {
    await render(<FaqAccordion items={FAQS} />);

    await fireEvent.press(screen.getByText('Is brokerage sharing lifetime?'));
    expect(screen.getByText(/There is no expiry/)).toBeTruthy();
  });

  it('gives every answer at least one paragraph', () => {
    for (const faq of FAQS) {
      expect(Array.isArray(faq.answer)).toBe(true);
      expect(faq.answer.length).toBeGreaterThan(0);
      for (const paragraph of faq.answer) {
        // Unbalanced markers would leak a stray ** into the UI.
        expect((paragraph.match(/\*\*/g) ?? []).length % 2).toBe(0);
      }
    }
  });
});
