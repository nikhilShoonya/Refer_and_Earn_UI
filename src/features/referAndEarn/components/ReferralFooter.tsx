import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, PrimaryButton } from '../../../components/primitives';
import { CopyIcon, ShareIcon, WhatsappIcon } from '../../../icons';
import { colors, footerBottomPadding, radii, spacing } from '../../../theme/tokens';
import { typography } from '../../../theme/typography';
import { ReferralCodeInfo } from '../api/types';

const QR_ASSET = require('../../../../assets/figma/images/qr-code.png');

/**
 * The sticky footer present on every Refer & Earn screen: code box with copy
 * affordance, QR thumbnail, WhatsApp CTA and a generic share button.
 */
export function ReferralFooter({
  code,
  onShowQr,
}: {
  code: ReferralCodeInfo | null;
  onShowQr?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);

  const value = code?.code ?? '—';

  async function handleCopy() {
    if (!code) return;
    await Clipboard.setStringAsync(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function handleShare(message: string) {
    if (!code) return;
    try {
      await Share.share({ message });
    } catch {
      // The user dismissed the share sheet — nothing to recover from.
    }
  }

  const inviteText = `Join me on Shoonya and start earning for life. Use my referral code ${value}: ${code?.shareUrl ?? ''}`;

  return (
    <View style={[styles.root, { paddingBottom: footerBottomPadding(insets.bottom) }]}>
      <View style={styles.codeRow}>
        <Pressable
          style={styles.codeBox}
          onPress={handleCopy}
          accessibilityRole="button"
          accessibilityLabel={`Copy referral code ${value}`}
        >
          <Text style={styles.codeLabel}>{copied ? 'Code copied' : 'Your Referral Code'}</Text>
          <View style={styles.codeValueGroup}>
            <Text style={styles.codeValue}>{value}</Text>
            {/* Duotone in Figma (#424242 front square, #EFA145 back square) —
                passing a colour flattened both to amber. */}
            <CopyIcon width={24} height={24} />
          </View>
        </Pressable>

        <Pressable
          style={styles.qr}
          onPress={onShowQr}
          accessibilityRole="button"
          accessibilityLabel="Show referral QR code"
        >
          <Image source={QR_ASSET} style={styles.qrImage} resizeMode="contain" />
        </Pressable>
      </View>

      <View style={styles.ctaRow}>
        <PrimaryButton
          label="Invite via Whatsapp"
          style={styles.whatsapp}
          onPress={() => handleShare(inviteText)}
          icon={<WhatsappIcon width={24} height={24} />}
        />
        <IconButton accessibilityLabel="Share referral code" onPress={() => handleShare(inviteText)}>
          <ShareIcon width={24} height={24} color={colors.accent} />
        </IconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    // Figma "Share" is 358 wide inside the 390 frame — the sheet is inset by
    // the screen gutter, not full-bleed, which is what makes its 16pt top
    // corners read.
    marginHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    boxShadow: '0px -4px 15px rgba(0, 0, 0, 0.05)',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  codeBox: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    // Figma outlines the code box; this was previously borderless.
    borderWidth: 1,
    borderColor: colors.borderCode,
    paddingHorizontal: spacing.sm,
  },
  codeLabel: {
    ...typography.labelStrong,
    lineHeight: 14.4,
    color: colors.muted,
  },
  codeValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codeValue: {
    ...typography.titleSm,
    color: colors.ink,
  },
  qr: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    // Figma scales this frame down, leaving a 0.67 inside stroke rather than 1.
    borderWidth: 0.67,
    borderColor: colors.borderQr,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 4,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  whatsapp: {
    flex: 1,
  },
});
