import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckCircleIcon } from '../icons';
import { colors, footerHeight, radii, shadows, spacing } from '../theme/tokens';
import { fontFamily } from '../theme/typography';

/**
 * The CSV-export confirmation.
 *
 * Figma draws this as a compact white pill that hugs its label and centres
 * itself over the list — not the full-width dark bar this shipped as. It is
 * outlined in the same success green as the check glyph, and carries the
 * cards' soft shadow so it reads as floating above the content.
 */
/** The green of the check glyph in check-circle.svg — the pill's outline matches it. */
const SUCCESS_GREEN = '#37B750';
export function Toast({ label }: { label: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      // Figma sits the pill 16 above the sticky footer. The footer grows with
      // the safe area, so a fixed offset drifts — derive it instead.
      style={[styles.root, { bottom: footerHeight(insets.bottom) + spacing.lg }]}
      pointerEvents="none"
      accessibilityRole="alert"
    >
      <View style={styles.pill}>
        {/* Figma scales the 16-unit glyph up to 24 in the toast. */}
        <CheckCircleIcon width={24} height={24} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // A full-width, non-interactive layer so the pill can centre itself without
  // the screen needing to know how wide the label is.
  //
  // The sticky footer and the list rows are later siblings, so without an
  // explicit zIndex they paint over the pill. 50 clears them while staying
  // under the sheets and scrims, which sit at 100.
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: SUCCESS_GREEN,
    // Figma's 213x48 carries its 1pt stroke INSIDE; Yoga adds the border on
    // top of the padding, so 11/15 lands the same outer box.
    paddingVertical: 11,
    paddingHorizontal: 15,
    ...shadows.card,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.body,
  },
});
