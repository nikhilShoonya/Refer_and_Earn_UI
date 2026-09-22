import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoDot } from '../../../components/primitives';
import { colors, radii, shadows, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';
import { formatCurrency } from '../../../utils/format';
import { BrokerageByReferral } from '../api/types';

import { Avatar } from './ReferralRow';

/**
 * Geometry from Figma node 2265:12763.
 *
 * The card is 352 wide inside a 358 row so the "Earned" ribbon can overhang its
 * right edge — the ribbon is rounded on the left only and runs flush to the
 * content edge, with a small folded corner tucked underneath.
 */
const ROW = {
  cardInset: 6,
  ribbonHeight: 25,
  /** "Vector 2" is a 7x6 triangle, not a square. */
  foldWidth: 7,
  foldHeight: 6,
};

export function BrokerageRow({
  row,
  columns = 2,
}: {
  row: BrokerageByReferral;
  /**
   * Figma ships two fills of the amounts row. Brokerage's preview cards show
   * two columns with Pending right-aligned; Referral Wise Brokerage shows
   * three — the generated total first — separated by rules and all
   * left-aligned. Everything above the rule is identical.
   */
  columns?: 2 | 3;
}) {
  const detailed = columns === 3;
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.head}>
          <Avatar name={row.name} avatarUrl={row.avatarUrl} ring />
          <View style={styles.identity}>
            <Text style={styles.name} numberOfLines={1}>
              {row.name}
            </Text>
            <Text style={styles.phone}>{row.maskedPhone}</Text>
          </View>
        </View>

        {/* "Vector 3009": a 320-wide #E0FAE7 rule between the two blocks. */}
        <View style={styles.rule} />

        <View style={styles.amounts}>
          {detailed ? (
            <>
              {/* Hugs its label, so the rules shift with it — "Affiliate
                  Sales" pulls them 37pt left of "Brokerage Generated". */}
              <View style={styles.amountHug}>
                <Text style={styles.amountLabel} numberOfLines={1}>
                  {row.generatedLabel ?? 'Brokerage Generated'}
                </Text>
                <Text style={[styles.amountValue, styles.generated]}>
                  {formatCurrency(row.generated)}
                </Text>
              </View>
              <View style={styles.columnRule} />
            </>
          ) : null}

          <View style={styles.amount}>
            <Text style={styles.amountLabel}>Paid</Text>
            <Text style={[styles.amountValue, styles.paid]}>{formatCurrency(row.paid)}</Text>
          </View>

          {detailed ? <View style={styles.columnRule} /> : null}

          <View style={[styles.amount, !detailed && styles.amountEnd]}>
            <View style={styles.pendingLabel}>
              <Text
                style={[
                  styles.amountLabel,
                  detailed ? styles.pendingLabelTextWide : styles.pendingLabelText,
                ]}
                numberOfLines={1}
              >
                Pending
              </Text>
              {/* Figma fills all three paths #888888 here, not the amber
                  duotone used on the Day 1 earnings tiles. */}
              <InfoDot tone="muted" style={styles.pendingLabelIcon} />
            </View>
            <Text style={[styles.amountValue, styles.pending]}>{formatCurrency(row.pending)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.ribbon}>
        <Text style={styles.ribbonLabel}>Earned {formatCurrency(row.earned)}</Text>
      </View>
      <View style={styles.ribbonFold} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  card: {
    marginRight: ROW.cardInset,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    gap: spacing.md,
    ...shadows.card,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Figma draws this as a zero-height vector with a 1pt centred stroke, so it
  // costs the card no height. The negative margins reproduce that: without
  // them the card grows to 133 against Figma's 132.
  rule: {
    height: 1,
    marginVertical: -0.5,
    backgroundColor: '#E0FAE7',
  },
  identity: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 20,
    color: '#03140F',
  },
  phone: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#888888',
  },
  amounts: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  amount: {
    flex: 1,
    gap: spacing.xs,
  },
  // The generated column is sized by its own label; the other two split what
  // is left equally (Figma: HUG, then two FILLs).
  amountHug: {
    gap: spacing.xs,
    flexShrink: 1,
  },
  // Second column hugs the card's right edge, per Figma — two-column fill only.
  amountEnd: {
    alignItems: 'flex-end',
  },
  // Zero-width vector in Figma, stretched to the amounts row's 36pt height, so
  // it costs the row no width and the 16pt gaps land either side of it.
  columnRule: {
    width: 1,
    marginHorizontal: -0.5,
    alignSelf: 'stretch',
    backgroundColor: '#E0FAE7',
  },
  // Label yields so the info icon cannot be pushed outside the card when
  // the system font is scaled up.
  pendingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  // flex:1 (basis 0), not flexShrink. React Native on Android does not
  // reliably shrink a <Text> from its intrinsic width, so a scaled-up system
  // font pushed the info icon outside the card. Basis 0 forces the label to
  // fit the row and truncate instead.
  pendingLabelText: {
    flex: 1,
  },
  // Three-column fill left-aligns the label group, so the icon has to sit
  // right after the text rather than being pushed to the column's edge.
  pendingLabelTextWide: {
    flexShrink: 1,
  },
  pendingLabelIcon: {
    flexShrink: 0,
  },
  amountLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#888888',
  },
  amountValue: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  // The generated total is ink, not one of the paid/pending tones.
  generated: { color: '#03140F' },
  paid: { color: '#206C58' },
  pending: { color: '#F15A25' },

  // Rounded on the left only, running off the card's right edge.
  ribbon: {
    position: 'absolute',
    top: spacing.lg,
    right: 0,
    height: ROW.ribbonHeight,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderTopLeftRadius: radii.sm,
    borderBottomLeftRadius: radii.sm,
    backgroundColor: '#B5FFC5',
  },
  ribbonLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 14.4,
    color: colors.ink,
  },
  // The darker folded corner tucked under the ribbon's right end. Figma draws
  // a 7x6 right triangle with the square corner at the top left and the
  // hypotenuse running down to the card edge; a transparent right border
  // clips the filled top border into that shape.
  ribbonFold: {
    position: 'absolute',
    top: spacing.lg + ROW.ribbonHeight,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: ROW.foldHeight,
    borderTopColor: '#33A346',
    borderRightWidth: ROW.foldWidth,
    borderRightColor: 'transparent',
  },
});
