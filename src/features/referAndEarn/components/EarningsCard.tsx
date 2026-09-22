import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AmountRow, Card, Divider, InfoDot, PeriodSwitcher } from '../../../components/primitives';
import { CalendarSmallIcon, EarningBrokerageIcon, EarningReferralIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { typography } from '../../../theme/typography';
import { formatCurrency } from '../../../utils/format';
import { EarningsSummary } from '../api/types';

/**
 * Two tiles share the card width, so the label has roughly 90dp to play with.
 * A phone set to the largest system font scale (up to 2x on Android) grew
 * "Brokerage Earned" past that and carried the info badge out over the tile
 * border. Capping the multiplier keeps the label legible at the scales people
 * actually use while leaving the Figma size untouched at 1x; the flex basis
 * below is the backstop beyond the cap.
 */
const LABEL_MAX_SCALE = 1.3;

function SplitTile({
  icon,
  label,
  total,
  paid,
  pending,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  total: number;
  paid: number;
  pending: number;
  compact?: boolean;
}) {
  return (
    <View style={styles.tile}>
      <View style={styles.tileHead}>
        <View style={styles.tileIcon}>{icon}</View>
        <View style={styles.tileHeadText}>
          <View style={styles.tileLabelRow}>
            <Text style={styles.tileLabel} numberOfLines={1} maxFontSizeMultiplier={LABEL_MAX_SCALE}>
              {label}
            </Text>
            <InfoDot style={styles.tileInfo} />
          </View>
          <Text style={styles.tileTotal}>{formatCurrency(total)}</Text>
        </View>
      </View>

      {compact ? null : (
        <>
          <Divider style={styles.tileDivider} />

          <View style={styles.tileAmounts}>
            <AmountRow label="Paid" value={formatCurrency(paid)} tone="paid" />
            <AmountRow label="Pending" value={formatCurrency(pending)} tone="pending" />
          </View>
        </>
      )}
    </View>
  );
}

/**
 * Day 1 "Your Total Earnings" card — headline figure, the Referral Bonus and
 * Brokerage Earned split tiles, and the payout cadence strip.
 */
export function EarningsCard({
  summary,
  period = 'Lifetime',
  onChangePeriod,
  compact = false,
}: {
  summary: EarningsSummary;
  period?: string;
  onChangePeriod?: () => void;
  /**
   * First Referral drops the paid/pending split and the period switcher —
   * there is nothing settled yet to break down (Figma node 2265:15563).
   */
  compact?: boolean;
}) {
  return (
    <Card>
      <View style={styles.header}>
        <View>
          <Text style={typography.bodySm}>Your Total Earnings</Text>
          <Text style={[typography.displayMd, styles.total]}>{formatCurrency(summary.total)}</Text>
        </View>
        {compact ? null : <PeriodSwitcher label={period} onPress={onChangePeriod} />}
      </View>

      <View style={styles.tiles}>
        <SplitTile
          icon={<EarningReferralIcon width={14} height={14} />}
          label="Referral Bonus"
          total={summary.referralBonus.total}
          paid={summary.referralBonus.paid}
          pending={summary.referralBonus.pending}
          compact={compact}
        />
        <SplitTile
          icon={<EarningBrokerageIcon width={14} height={14} />}
          label="Brokerage Earned"
          total={summary.brokerage.total}
          paid={summary.brokerage.paid}
          pending={summary.brokerage.pending}
          compact={compact}
        />
      </View>

      <View style={styles.payout}>
        <CalendarSmallIcon width={20} height={20} color="#899A8D" />
        <Text style={styles.payoutLabel}>Payout Cycle</Text>
        <Text style={styles.payoutValue}>{summary.payoutCycle}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  total: {
    marginTop: spacing.xs,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  tile: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderGreen,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  // Figma top-aligns the badge against the label block rather than centring
  // it: 'Brokerage Earned' is a longer label than 'Referral Bonus', so
  // centring left the two tiles' icons at different heights.
  tileHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceGreenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileHeadText: {
    flex: 1,
    gap: 2,
  },
  tileLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  // flex:1 (basis 0), not flexShrink. React Native on Android does not reliably
  // shrink a <Text> from its intrinsic width, so a scaled-up system font pushed
  // the info icon outside the card. Basis 0 forces the label to fit and
  // truncate instead.
  tileLabel: {
    ...typography.caption,
    // Figma 11/13.2 here; the shared caption token is 11/16 for the funnel
    // and phone rows, so override locally rather than move the token.
    lineHeight: 13.2,
    flex: 1,
  },
  tileInfo: {
    flexShrink: 0,
  },
  tileTotal: {
    ...typography.titleSm,
  },
  tileDivider: {
    // Figma tints the in-tile rule to match the tile border.
    backgroundColor: colors.borderGreen,
    marginHorizontal: -spacing.sm,
  },
  tileAmounts: {
    gap: spacing.sm,
  },
  payout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  payoutLabel: {
    ...typography.caption,
    color: colors.body,
  },
  payoutValue: {
    ...typography.labelStrong,
    color: colors.body,
  },
});
