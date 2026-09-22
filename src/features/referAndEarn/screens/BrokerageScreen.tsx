import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/AppHeader';
import { Card, PeriodSwitcher, SectionHeader } from '../../../components/primitives';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { ChevronRightDuotoneIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';
import { formatCurrency, formatShortDate } from '../../../utils/format';
import { useReferralClient } from '../api/ReferralProvider';
import { useAsync } from '../api/useAsync';
import { BrokerageRow } from '../components/BrokerageRow';
import { ReferralFooter } from '../components/ReferralFooter';
import { HowBrokerageWorksSheet } from '../sheets/HowBrokerageWorksSheet';
import { QrSheet } from '../sheets/QrSheet';

/** Geometry from Figma node 2265:12732. */
const SUMMARY = { padding: 24 };

interface Props {
  onBack?: () => void;
  onOpenAll: () => void;
  onOpenFaqs: () => void;
}

/** Brokerage overview — headline earnings, the paid/pending split, and a preview list. */
export function BrokerageScreen({ onBack, onOpenAll, onOpenFaqs }: Props) {
  const client = useReferralClient();
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const { data: summary } = useAsync(() => client.getBrokerageSummary(), [client]);
  const { data: rows } = useAsync(() => client.getBrokerageByReferral(), [client]);
  const { data: code } = useAsync(() => client.getReferralCode(), [client]);

  // The page paints as a unit; otherwise the ungated FAQs row lands first.
  const ready = summary !== null && rows !== null;

  return (
    <ScreenBackground
      overlay={
        <>
          <HowBrokerageWorksSheet
            visible={explainerOpen}
            onClose={() => setExplainerOpen(false)}
          />
          <QrSheet visible={qrOpen} onClose={() => setQrOpen(false)} />
        </>
      }
    >
      <AppHeader
        title="Brokerage"
        onBack={onBack}
        onHelp={() => setExplainerOpen(true)}
        horizontalPadding={spacing.xl}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {ready && summary ? (
          <Card style={styles.summary} padded={false}>
            <View style={styles.summaryHead}>
              <View style={styles.summaryTitle}>
                <Text style={styles.sectionLabel}>Your Brokerage Earnings</Text>
                {/* Figma nests the figure and its caption in a gap-0 frame —
                    only the label above it gets the 4pt gap. */}
                <View>
                  <Text style={styles.total}>{formatCurrency(summary.total)}</Text>
                  <Text style={styles.share}>
                    {summary.sharePercent}% share of brokerage generated
                  </Text>
                </View>
              </View>
              <PeriodSwitcher label="Lifetime" />
            </View>

            {/* "Vector 3014": 297 wide, flush to the content's left edge. */}
            <View style={styles.summaryRule} />

            <View style={styles.split}>
              <View style={styles.splitCol}>
                <Text style={styles.sectionLabel}>Paid</Text>
                <View>
                  <Text style={[styles.splitValue, styles.paid]}>
                    {formatCurrency(summary.paid)}
                  </Text>
                  <Text style={styles.splitCaption}>Credited to your account</Text>
                </View>
              </View>

              {/* "Vector 3016": a 1pt rule down the middle of the split. */}
              <View style={styles.splitRule} />

              <View style={[styles.splitCol, styles.splitColEnd]}>
                <Text style={styles.sectionLabel}>Pending</Text>
                <View style={styles.splitBlockEnd}>
                  <Text style={[styles.splitValue, styles.pending]}>
                    {formatCurrency(summary.pending)}
                  </Text>
                  <Text style={styles.splitCaption}>
                    {summary.settlementDate
                      ? `Settlement on ${formatShortDate(summary.settlementDate)}`
                      : 'Awaiting first settlement'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ) : null}

        {ready ? (
        <View style={styles.listBlock}>
          <SectionHeader
            title="Referral Wise Brokerage"
            actionLabel="View All"
            onAction={onOpenAll}
            large
          />
          {/* Figma gaps the header from the list by 16 and the cards by 12. */}
          <View style={styles.listCards}>
            {(rows ?? []).slice(0, 3).map((row) => (
              <BrokerageRow key={row.id} row={row} />
            ))}
          </View>
        </View>
        ) : null}

        {ready ? (
        <Pressable style={styles.faqRow} onPress={onOpenFaqs} accessibilityRole="button">
          <Text style={styles.faqLabel}>FAQs</Text>
          <ChevronRightDuotoneIcon width={16} height={16} />
        </Pressable>
        ) : null}
      </ScrollView>

      <ReferralFooter code={code} onShowQr={() => setQrOpen(true)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xxl,
  },

  // --- Summary card -----------------------------------------------------
  summary: {
    // Figma node 1000005538: r12, not the shared Card's r16.
    borderRadius: radii.md,
    padding: SUMMARY.padding,
    gap: spacing.lg,
  },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 14.4,
    color: colors.body,
  },
  total: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    lineHeight: 33.6,
    color: colors.ink,
  },
  share: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#888888',
  },
  // A zero-height vector in Figma, so it costs the card no height — see the
  // same treatment on BrokerageRow. It stops 13pt short of the content's
  // right edge (297 of 310), which is how the vector is drawn.
  summaryRule: {
    height: 1,
    marginVertical: -0.5,
    marginRight: 13,
    backgroundColor: colors.borderGreen,
  },
  split: {
    flexDirection: 'row',
  },
  splitCol: {
    flex: 1,
    gap: spacing.xs,
  },
  // Zero-width vector between the two columns, stretched to the row's height.
  splitRule: {
    width: 1,
    marginHorizontal: -0.5,
    alignSelf: 'stretch',
    backgroundColor: colors.borderGreen,
  },
  // Figma right-aligns the whole Pending column.
  splitColEnd: {
    alignItems: 'flex-end',
  },
  // The caption is the widest child, so the value needs explicit right
  // alignment inside the block rather than inheriting the column's.
  splitBlockEnd: {
    alignItems: 'flex-end',
  },
  splitValue: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    lineHeight: 21.6,
  },
  paid: { color: '#206C58' },
  pending: { color: '#F15A25' },
  splitCaption: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#888888',
  },

  // --- List + FAQs ------------------------------------------------------
  listBlock: { gap: spacing.lg },
  listCards: { gap: spacing.md },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: colors.surface,
  },
  faqLabel: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: '#03140F',
  },
});
