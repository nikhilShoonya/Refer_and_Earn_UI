import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { ChevronRightDuotoneIcon, InfoIcon, InfoMutedIcon, SwitcherIcon } from '../icons';
import { colors, radii, shadows, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

/** White rounded card — the repeating container on every screen. */
export function Card({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return (
    <View style={[styles.card, padded && styles.cardPadded, style]}>{children}</View>
  );
}

/** Bricolage section heading with an optional amber action on the right. */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
  style,
  large = false,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Figma uses 18/22 on Brokerage and 16/19 on the dashboard. */
  large?: boolean;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={large ? typography.sectionTitle : typography.displaySm}>{title}</Text>
      {actionLabel ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.linkButton}
        >
          <Text style={styles.link}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Amber period control, e.g. "Lifetime" / "Current month". */
export function PeriodSwitcher({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.switcher} onPress={onPress} accessibilityRole="button" hitSlop={8}>
      <SwitcherIcon width={12} height={12} color={colors.accentText} />
      <Text style={styles.switcherLabel}>{label}</Text>
    </Pressable>
  );
}

export function InfoDot({
  style,
  tone = 'duotone',
}: {
  style?: StyleProp<ViewStyle>;
  /**
   * Figma ships two fills of the same 12pt glyph: the amber duotone on the
   * Day 1 earnings tiles, and an all-#888888 one inside the brokerage
   * referral cards. Neither is tinted at the call site.
   */
  tone?: 'duotone' | 'muted';
}) {
  const Icon = tone === 'muted' ? InfoMutedIcon : InfoIcon;
  return (
    <View style={style}>
      <Icon width={12} height={12} />
    </View>
  );
}

/** Full-width amber CTA. */
export function PrimaryButton({
  label,
  onPress,
  icon,
  style,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon}
      <Text style={styles.primaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

/** Square 48pt icon button sitting beside the primary CTA. */
export function IconButton({
  children,
  onPress,
  style,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

/** The "FAQs >" row that appears above the sticky footer. */
export function DisclosureRow({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.disclosure, pressed && styles.pressed, style]}
    >
      <Text style={[typography.titleSm, styles.disclosureLabel]}>{label}</Text>
      {/* Duotone 16x16 in Figma (#424242 + #EFA145). ChevronRightSmallIcon is
          the 9x9 funnel-connector glyph and was being scaled up and tinted. */}
      <ChevronRightDuotoneIcon width={16} height={16} />
    </Pressable>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

/** Paid / Pending key-value line inside the earnings tiles. */
export function AmountRow({
  label,
  value,
  tone,
  labelStyle,
}: {
  label: string;
  value: string;
  tone: 'paid' | 'pending';
  labelStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.amountRow}>
      <Text style={[typography.caption, labelStyle]}>{label}</Text>
      <Text
        style={[
          styles.amountValue,
          // Figma differs per row: Paid is 12/14.4, Pending 12/16.
          {
            color: tone === 'paid' ? colors.positive : colors.warning,
            lineHeight: tone === 'paid' ? 14.4 : 16,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  cardPadded: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Figma rules the whole 53x22 frame rather than underlining the glyphs:
  // pad=[2,0,2,0] around an 18pt line, with a 1pt stroke along the bottom.
  linkButton: {
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.accentText,
  },
  link: {
    ...typography.titleSm,
    color: colors.accentText,
  },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switcherLabel: {
    ...typography.titleSm,
    color: colors.accentText,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonLabel: {
    ...typography.titleSm,
    color: colors.surface,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Figma: 2pt inside stroke on the share button.
    borderWidth: 2,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  /** Figma uses a near-black here, a shade deeper than colors.ink. */
  disclosureLabel: { color: colors.inkDeep },
  disclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    ...shadows.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountValue: {
    fontFamily: typography.labelStrong.fontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
});
