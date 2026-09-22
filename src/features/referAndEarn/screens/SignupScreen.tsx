import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../components/primitives';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { CheckCircleIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { typography } from '../../../theme/typography';
import { ReferralCodeSheet } from '../sheets/ReferralCodeSheet';

interface AppliedCode {
  code: string;
  referrerName: string;
}

/**
 * Signup screen implementing **Flow 2** of the Referee Journey: the referral
 * code is collapsed behind a "Have a Referral Code?" link that opens a bottom
 * sheet, and once verified it collapses back to a chip with a Change action.
 *
 * Flows 1 and 3 from the design are intentionally not built — see open issue
 * #10 in docs/figma-design-spec.txt.
 */
export function SignupScreen({ onBack }: { onBack?: () => void }) {
  // No AppHeader on this screen, so it has to clear the status bar itself.
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [applied, setApplied] = useState<AppliedCode | null>(null);

  const canContinue = phone.replace(/\D/g, '').length === 10;

  return (
    <ScreenBackground
      overlay={
        <ReferralCodeSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onApply={(code, referrerName) => setApplied({ code, referrerName })}
        />
      }
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {onBack ? (
          <Pressable onPress={onBack} accessibilityRole="button" hitSlop={8} style={styles.exit}>
            <Text style={styles.exitLabel}>Back to Refer &amp; Earn demo</Text>
          </Pressable>
        ) : null}

        <Text style={styles.title}>Welcome to Shoonya</Text>
        <Text style={styles.subtitle}>
          Enter your mobile number to begin your investment journey with Shoonya!
        </Text>

        <View style={styles.field}>
          <Text style={styles.prefix}>+91</Text>
          <View style={styles.fieldDivider} />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter mobile number"
            placeholderTextColor={colors.subtle}
            keyboardType="number-pad"
            maxLength={10}
            style={styles.input}
            accessibilityLabel="Mobile number"
          />
        </View>

        {applied ? (
          <View style={styles.appliedChip}>
            <CheckCircleIcon width={16} height={16} />
            <Text style={styles.appliedLabel}>Referred by {applied.referrerName}</Text>
            <Pressable
              onPress={() => setApplied(null)}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.change}>Change</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setSheetOpen(true)}
            accessibilityRole="button"
            hitSlop={8}
            style={styles.codeLinkWrap}
          >
            <Text style={styles.codeLink}>Have a Referral Code?</Text>
          </Pressable>
        )}

        <PrimaryButton label="Continue" disabled={!canContinue} style={styles.cta} />

        <View style={styles.dividerRow}>
          <View style={styles.rule} />
          <Text style={styles.or}>Or</Text>
          <View style={styles.rule} />
        </View>

        <Pressable style={styles.secondary} accessibilityRole="button">
          <Text style={styles.secondaryLabel}>Enter email ID</Text>
        </Pressable>
        <Pressable style={styles.secondary} accessibilityRole="button">
          <Text style={styles.secondaryLabel}>Continue with google</Text>
        </Pressable>

        <Text style={styles.legal}>
          By continuing, I agree to the Privacy Policy and Terms &amp; Condition.
        </Text>
        <Text style={styles.legal}>
          Note: Online account opening Is not available for NRI, HUF, minor, joint, and
          non-Individual accounts.
        </Text>
        <Text style={styles.legal}>
          NSE, BSE &amp; MCX - SEBI Reg no: INZ000176037 SEBI Reg no: IN-DP-317-2017 Version
          1.4.0.0
        </Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  exit: { alignSelf: 'flex-start' },
  exitLabel: { ...typography.caption, color: colors.accentText },
  title: { ...typography.displayLg, fontSize: 24, lineHeight: 30 },
  subtitle: { ...typography.bodyMd, color: colors.muted, marginTop: -spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  prefix: { ...typography.titleSm },
  fieldDivider: { width: 1, height: 20, backgroundColor: colors.border },
  input: {
    flex: 1,
    ...typography.titleSm,
    color: colors.ink,
    outlineStyle: 'none' as never,
  },
  codeLinkWrap: { alignSelf: 'flex-start' },
  codeLink: {
    ...typography.titleSm,
    color: colors.accentText,
    textDecorationLine: 'underline',
  },
  appliedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.statusActivatedBg,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  appliedLabel: { ...typography.captionStrong, color: colors.positive, flex: 1 },
  change: {
    ...typography.captionStrong,
    color: colors.accentText,
    textDecorationLine: 'underline',
  },
  cta: { marginTop: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rule: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { ...typography.caption, color: colors.subtle },
  secondary: {
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  secondaryLabel: { ...typography.titleSm, color: colors.ink },
  legal: { ...typography.legal, color: colors.subtle, lineHeight: 12 },
});
