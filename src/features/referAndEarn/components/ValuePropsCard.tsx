import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ValuePercentIcon, ValueShieldIcon } from '../../../icons';
import { colors, radii, shadows, spacing } from '../../../theme/tokens';
import { typography } from '../../../theme/typography';

/**
 * The divider plus.
 *
 * Figma's glyph is 6.1875 long by 0.6875 thick, rounded here to whole dp. The
 * bars carry no border radius on purpose: a radius moves Android off its plain
 * rect fill and onto a Path-based background that degenerates at this size,
 * which is what left only a dash on device. The neighbouring 1dp rail, which
 * has no radius, always drew fine.
 */
const PLUS = { length: 6, thickness: 1 };
/** Offset that centres one bar across the other. */
const PLUS_INSET = (PLUS.length - PLUS.thickness) / 2;

/** Figma draws the divider as a dashed 1pt rule: 2 on, 2 off, in #ABCEB7. */
const DASH = { size: 2, gap: 2, colour: '#ABCEB7' };

/**
 * Dashed vertical rule. Built from plain rects because React Native has no
 * dashed-border style for a View, and because rects render identically on
 * both platforms.
 *
 * The rail sizes itself with flex, so the dash count is measured rather than
 * fixed — a fixed count left a blank gap at the end of the rail on taller
 * cards, which made the centre badge look adrift.
 */
function DashedRail() {
  const [height, setHeight] = useState(0);
  const count = Math.ceil(height / (DASH.size + DASH.gap));

  return (
    <View
      style={styles.rail}
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.dash} />
      ))}
    </View>
  );
}

/** Day 0 "₹50 on activation / 20% lifetime brokerage share" props card. */
export function ValuePropsCard() {
  return (
    <View style={styles.root}>
      <View style={styles.prop}>
        <View style={styles.iconTile}>
          <ValueShieldIcon width={32} height={32} />
        </View>
        <Text style={styles.value}>₹50</Text>
        <Text style={styles.caption}>On account activation</Text>
      </View>

      <View style={styles.middle}>
        <DashedRail />
        <View style={styles.plusBadge}>
          {/*
            Drawn with two views rather than the exported SVG. Figma's glyph is
            0.6875 units thick inside an 11-unit box, so at its 11pt render size
            the bars are sub-pixel — Android's SVG renderer rounds them away and
            only the horizontal one survived. Views are laid out in dp and scale
            with screen density, so they survive. Geometry is the export's own:
            bars 6.1875 long (5.5 plus the round caps) by 0.6875 thick.
          */}
          <View style={styles.plusBox}>
            <View style={[styles.plusBar, styles.plusBarH]} />
            <View style={[styles.plusBar, styles.plusBarV]} />
          </View>
        </View>
        <DashedRail />
      </View>

      {/* Figma mirrors this column to the card's right edge. */}
      <View style={[styles.prop, styles.propEnd]}>
        <View style={styles.iconTile}>
          <ValuePercentIcon width={32} height={32} />
        </View>
        <Text style={styles.value}>20%</Text>
        <Text style={styles.caption}>Lifetime brokerage share</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    // The Day 0 column centres its children, so claim the full width
    // explicitly — otherwise the card shrink-wraps and the captions wrap.
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderGreen,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    // No gap: Figma butts the two content-sized columns against the divider
    // column and lets that absorb all the slack (58pt at the 393 design
    // width). Adding 8pt either side cost 16pt that a 360dp handset does not
    // have, which pushed the right column past the card's padding.
  },
  // Figma sizes these columns to their content — 120 and 135 — rather than
  // splitting the card in half. Forcing `flex: 1` gave each an equal share,
  // which is wide enough for "Lifetime brokerage share" (135) only at the
  // 393pt design width; on a 360dp handset the column fell to ~124 and the
  // caption wrapped. Hugging the content needs 255 for the pair, which fits
  // with room to spare, and the divider between them takes up the slack.
  // flexShrink stays on so that below ~355dp, where even the hugged columns
  // no longer fit, the caption wraps as it used to rather than overflowing
  // the card — a worse failure than a second line.
  prop: {
    flexShrink: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  propEnd: {
    alignItems: 'flex-end',
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    // Figma drops a shadow on these tiles so they lift off the card.
    ...shadows.tile,
  },
  value: {
    ...typography.displayXl,
  },
  caption: {
    ...typography.label,
    color: colors.muted,
  },
  // Takes the leftover width so the rule sits centred between the two
  // content-sized columns, as it does in the design.
  middle: {
    flex: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  rail: {
    flex: 1,
    width: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  dash: {
    width: 1,
    height: DASH.size,
    marginBottom: DASH.gap,
    backgroundColor: DASH.colour,
  },
  plusBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.tintSoftGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Fixed box with explicit insets: absolute children without insets fall back
  // to the parent's alignment, which Android and web resolve differently.
  plusBox: {
    width: PLUS.length,
    height: PLUS.length,
  },
  // No borderRadius on purpose. Any non-zero radius moves Android off the
  // plain rect fill and onto a Path-based background, which degenerates at
  // this size and dropped the vertical bar entirely. At 1dp thick the rounded
  // ends were never visible anyway.
  plusBar: {
    position: 'absolute',
    backgroundColor: colors.body,
  },
  plusBarH: {
    left: 0,
    top: PLUS_INSET,
    width: PLUS.length,
    height: PLUS.thickness,
  },
  plusBarV: {
    top: 0,
    left: PLUS_INSET,
    width: PLUS.thickness,
    height: PLUS.length,
  },
});
