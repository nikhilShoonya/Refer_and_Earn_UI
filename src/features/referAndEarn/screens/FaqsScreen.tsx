import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppHeader } from '../../../components/AppHeader';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { spacing } from '../../../theme/tokens';
import { useReferralClient } from '../api/ReferralProvider';
import { useAsync } from '../api/useAsync';
import { FaqAccordion } from '../components/FaqAccordion';
import { ReferralFooter } from '../components/ReferralFooter';
import { QrSheet } from '../sheets/QrSheet';

/** FAQ accordion — 11 questions, first one expanded. */
export function FaqsScreen({ onBack }: { onBack?: () => void }) {
  const client = useReferralClient();
  const { data: faqs } = useAsync(() => client.getFaqs(), [client]);
  const { data: code } = useAsync(() => client.getReferralCode(), [client]);
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <ScreenBackground overlay={<QrSheet visible={qrOpen} onClose={() => setQrOpen(false)} />}>
      <AppHeader title="FAQs" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {faqs ? <FaqAccordion items={faqs} /> : null}
      </ScrollView>

      <ReferralFooter code={code} onShowQr={() => setQrOpen(true)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
});
