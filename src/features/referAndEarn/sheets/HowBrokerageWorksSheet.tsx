import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';

import { Scrim } from '../../../components/Scrim';
import { CalendarIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';

/**
 * Geometry from Figma node 2265:12896 ("How Brokerage Earning Works").
 *
 * Not built on `BottomSheet`: the design insets the drawer by the 24pt gutter
 * rather than running full-bleed, and opens with its own tinted header band
 * carrying the grabber.
 */
const DRAWER = {
  gutter: 24,
  radius: 16,
  badge: 24,
  stepGap: 24,
  /** Rail runs between the first and last badge centres. */
  railLeft: 12,
  /** Grabber: 80x4 pill, 8 below the sheet edge, 20 above the title. */
  grabberWidth: 80,
  grabberHeight: 4,
  grabberGap: 20,
};

/** Figma dashes the rail rather than drawing it solid: 2pt on, 2pt off. */
const RAIL_DASH = '2 2';
const RAIL_COLOR = '#ABCEB7';

const STEPS = [
  'Your friend trades on Shoonya',
  'We track brokerage from trades made by friends you refer.',
  'Your 20% eligible share of brokerage generated is calculated',
  'The amount is paid to you as per the settlement cycle',
];

const DEFINITIONS = [
  {
    dot: '#206C58',
    term: 'Paid',
    detail: 'Amount transferred to your account',
  },
  {
    dot: '#F15A25',
    term: 'Pending',
    detail: 'Eligible earnings that are accrued but not yet paid',
  },
];

export function HowBrokerageWorksSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  // The rail spans whatever the steps block measures, which depends on how the
  // step copy wraps — so it has to be measured rather than assumed.
  const [railHeight, setRailHeight] = useState(0);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <View style={styles.root}>
      <Scrim onPress={onClose} accessibilityLabel="Close" />

      <View style={[styles.drawer, { paddingBottom: insets.bottom || spacing.lg }]}>
        <View style={styles.header}>
          <View style={styles.grabber} />
          <Text style={styles.title}>How brokerage earning works?</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.steps}>
            {/* Rail sits behind the badges, joining first to last. */}
            <View
              style={styles.rail}
              pointerEvents="none"
              onLayout={(e) => setRailHeight(e.nativeEvent.layout.height)}
            >
              {railHeight > 0 ? (
                <Svg width={1} height={railHeight}>
                  <Line
                    x1={0.5}
                    y1={0}
                    x2={0.5}
                    y2={railHeight}
                    stroke={RAIL_COLOR}
                    strokeWidth={1}
                    strokeDasharray={RAIL_DASH}
                  />
                </Svg>
              ) : null}
            </View>
            {STEPS.map((step, i) => (
              <View key={step} style={styles.step}>
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>{i + 1}</Text>
                </View>
                {/* Figma centres a one-line step against its 24pt badge and
                    top-aligns a wrapped one. Stretching this box to the row
                    height and centring inside it gives both. */}
                <View style={styles.stepTextBox}>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.definitions}>
            <View style={styles.definitionRow}>
              {DEFINITIONS.map((d, i) => (
                <React.Fragment key={d.term}>
                  {i > 0 ? <View style={styles.definitionRule} /> : null}
                  <View style={styles.definition}>
                    <View style={[styles.definitionDot, { backgroundColor: d.dot }]} />
                    <View style={styles.definitionText}>
                      <Text style={styles.term}>{d.term}</Text>
                      <Text style={styles.detail}>{d.detail}</Text>
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>

            <View style={styles.payout}>
              <CalendarIcon width={20} height={20} color={colors.funnelTile} />
              <Text style={styles.payoutLabel}>Payout Cycle</Text>
              <Text style={styles.payoutValue}>7th of every month</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  drawer: {
    zIndex: 1,
    marginHorizontal: DRAWER.gutter,
    borderTopLeftRadius: DRAWER.radius,
    borderTopRightRadius: DRAWER.radius,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  // 8 + grabber 4 + 20 + title 22 + 16 = the 70pt band Figma draws.
  header: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: '#F2F7F4',
  },
  grabber: {
    alignSelf: 'center',
    width: DRAWER.grabberWidth,
    height: DRAWER.grabberHeight,
    borderRadius: DRAWER.grabberHeight / 2,
    backgroundColor: '#B0B0B0',
    marginBottom: DRAWER.grabberGap,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    lineHeight: 22,
    color: colors.body,
  },
  body: {
    padding: spacing.lg,
    gap: DRAWER.stepGap,
  },

  // --- Numbered steps ---------------------------------------------------
  steps: {
    gap: DRAWER.stepGap,
  },
  rail: {
    position: 'absolute',
    left: DRAWER.railLeft,
    top: DRAWER.badge,
    bottom: DRAWER.badge,
    width: 1,
  },
  // Stretch, so the text box can fill the row and centre a single line in it.
  step: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    width: DRAWER.badge,
    height: DRAWER.badge,
    borderRadius: DRAWER.badge / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.funnelTile,
  },
  badgeLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  stepTextBox: {
    flex: 1,
    justifyContent: 'center',
    // Never shorter than the badge, so a one-line step still centres in 24.
    minHeight: DRAWER.badge,
  },
  stepText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 18,
    color: colors.body,
  },

  // --- Paid / Pending definitions ---------------------------------------
  definitions: {
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    backgroundColor: '#F6F6F6',
  },
  definitionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  definition: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  definitionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  definitionText: {
    flex: 1,
  },
  definitionRule: {
    width: 1,
    backgroundColor: '#D8EFDE',
  },
  term: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.body,
  },
  detail: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#888888',
  },
  payout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.ink,
  },
  // No flex: Figma sets the value right after the label, 4pt apart, and leaves
  // the rest of the bar empty rather than pushing it to the far edge.
  payoutLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#F8FFFA',
  },
  payoutValue: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: '#FCFCFC',
  },
});
