import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppHeader } from '../../../components/AppHeader';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { spacing } from '../../../theme/tokens';
import { useReferralClient } from '../api/ReferralProvider';
import { useAsync } from '../api/useAsync';
import { FaqAccordion } from '../components/FaqAccordion';

/**
 * FAQ accordion — 11 questions, first one expanded.
 *
 * Geometry from Figma node 2265:15505. Note the frame carries no sticky
 * referral footer: the list runs to the bottom edge, so the QR sheet that the
 * footer used to open is not part of this screen either.
 */
export function FaqsScreen({ onBack }: { onBack?: () => void }) {
  const client = useReferralClient();
  const { data: faqs } = useAsync(() => client.getFaqs(), [client]);

  return (
    <ScreenBackground>
      <AppHeader
        title="FAQs"
        onBack={onBack}
        horizontalPadding={spacing.xl}
        reserveAction
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {faqs ? <FaqAccordion items={faqs} /> : null}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    // Figma puts the first card at y=104 under a 46pt nav.
    paddingTop: 14,
    paddingBottom: spacing.xxl,
  },
});
