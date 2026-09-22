import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowLeftIcon, HelpDuotoneIcon, SearchDuotoneIcon } from '../icons';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

/**
 * Fallback when no safe-area inset is reported. iPhone 16 reports 59pt for
 * the Dynamic Island; the provider supplies that on web, so this only ever
 * applies in a bare test renderer.
 */
const STATUS_BAR_HEIGHT = 59;

/**
 * "Top Nav/Default" from Figma: padded 8 above and 12 below its tallest child,
 * back arrow at the left, optional help affordance at the right.
 *
 * The bar hugs rather than taking a fixed height, which is how Figma derives
 * it: 8 + 24 (arrow) + 12 = 44 on the plain frames, and 8 + 26 (help icon) +
 * 12 = 46 on Brokerage. A fixed height with centred contents put every child
 * 2pt low.
 */
export function AppHeader({
  title,
  onBack,
  onHelp,
  onSearch,
  transparent = true,
  horizontalPadding = spacing.lg,
  reserveAction = false,
}: {
  title: string;
  onBack?: () => void;
  onHelp?: () => void;
  onSearch?: () => void;
  transparent?: boolean;
  /** Figma uses 16 on the dashboard frames and 24 on Brokerage / How it Works. */
  horizontalPadding?: number;
  /**
   * How it Works keeps the right-hand action frame at opacity 0 rather than
   * hiding it, so the bar is still 46 tall with nothing drawn there. Set this
   * to hold that height on screens with no action.
   */
  reserveAction?: boolean;
}) {
  const insets = useSafeAreaInsets();
  // Figma draws a 44pt status bar above the nav. On web there is no inset to
  // report, so fall back to the design value rather than collapsing to zero.
  const topInset = insets.top || STATUS_BAR_HEIGHT;

  return (
    <View
      style={[
        styles.root,
        { paddingTop: topInset, paddingHorizontal: horizontalPadding },
        !transparent && styles.opaque,
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.left}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
            >
              {/* Duotone in Figma (#424242 chevron, #EFA145 upper stroke and
                  shaft) — passing a colour flattened all three to amber. */}
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
          ) : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={[styles.actions, reserveAction && styles.actionsReserved]}>
          {onSearch ? (
            <Pressable
              onPress={onSearch}
              accessibilityRole="button"
              accessibilityLabel="Search referrals"
              hitSlop={12}
            >
              <SearchDuotoneIcon width={24} height={24} />
            </Pressable>
          ) : null}

          {onHelp ? (
            <Pressable
              onPress={onHelp}
              accessibilityRole="button"
              accessibilityLabel="How it works"
              hitSlop={12}
            >
              {/* Duotone in Figma (#424242 glass, #EFA145 mark) — do not tint. */}
              <HelpDuotoneIcon width={26} height={26} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  opaque: {
    backgroundColor: colors.surface,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  // Matches the 26pt `op=0` frame Figma leaves in place, so the bar measures
  // 8 + 26 + 12 = 46 even with no action rendered.
  actionsReserved: {
    height: 26,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Figma "Top Nav/Default" pad=[8,_,12,_].
    paddingTop: 8,
    paddingBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexShrink: 1,
  },
  // Bricolage Grotesque 600 16/19.2 in Figma, not the Figtree 18/22 this
  // shipped as (node "Top Nav/Default" on every frame).
  title: {
    ...typography.displaySm,
    flexShrink: 1,
  },
});
