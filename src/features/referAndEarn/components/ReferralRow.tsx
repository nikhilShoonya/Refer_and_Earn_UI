import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/primitives';
import { CalendarSmallIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { fontFamily, typography } from '../../../theme/typography';
import { STATUS_LABEL, formatJoinDate, initialsOf } from '../../../utils/format';
import { Referral, ReferralStatus } from '../api/types';

/**
 * Per-status palette, read from Figma node 2265:14616 (the Recent Referrals
 * list). Every badge is a gradient with its own hairline, and the avatar disc
 * is keyed to the status too — not to a hash of the name, which is what this
 * used to do.
 *
 * Registered fades grey to white; the other two fade their own colour from
 * full to 30%.
 */
interface StatusTone {
  avatarBg: string;
  avatarInk: string;
  from: string;
  to: string;
  border: string;
  fg: string;
}

const NEUTRAL: StatusTone = {
  avatarBg: '#F7F7F7',
  avatarInk: '#888888',
  from: '#E3E3E3',
  to: '#FFFFFF',
  border: '#E7E7E7',
  fg: '#424242',
};

const STATUS_STYLE: Record<ReferralStatus, StatusTone> = {
  registered: NEUTRAL,
  activated: {
    avatarBg: '#D9FCE4',
    avatarInk: '#33A346',
    from: 'rgba(227, 254, 239, 1)',
    to: 'rgba(227, 254, 239, 0.3)',
    border: '#C7F6D3',
    fg: '#33A346',
  },
  kyc_completed: {
    avatarBg: '#F1FAFF',
    avatarInk: '#2453A5',
    from: 'rgba(252, 243, 217, 1)',
    to: 'rgba(252, 243, 217, 0.3)',
    border: '#FEE1BA',
    fg: '#BE660F',
  },
  // Not drawn in Figma; follow the neutral chip.
  pending: NEUTRAL,
};

export function StatusPill({ status }: { status: ReferralStatus }) {
  const tone = STATUS_STYLE[status];
  return (
    <LinearGradient
      // Figma's handles run [0.5,1] -> [0.5,0], so the first stop sits at the
      // BOTTOM: grey/saturated below, white/30% above.
      colors={[tone.from, tone.to]}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={[styles.pill, { borderColor: tone.border }]}
    >
      <Text style={[styles.pillLabel, { color: tone.fg }]} numberOfLines={1}>
        {STATUS_LABEL[status]}
      </Text>
    </LinearGradient>
  );
}

/**
 * The disc and initials are tinted by status (node 2265:14616). Callers with
 * no status — the brokerage list, the journey sheet — get the neutral chip.
 */
export function Avatar({
  name,
  status,
  avatarUrl,
  ring,
  backgroundColor,
}: {
  name: string;
  status?: ReferralStatus;
  /** Figma fills the disc with a photo on Brokerage and the podium. */
  avatarUrl?: string;
  /** 1pt #ABCEB7 hairline, as Figma rings the photo variants. */
  ring?: boolean;
  /** Overrides the status tint — the journey sheet sits it on white. */
  backgroundColor?: string;
}) {
  const tone = status ? STATUS_STYLE[status] : NEUTRAL;
  return (
    <View
      style={[
        styles.avatar,
        { backgroundColor: backgroundColor ?? tone.avatarBg },
        ring && styles.avatarRing,
      ]}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <Text style={[styles.avatarLabel, { color: tone.avatarInk }]}>{initialsOf(name)}</Text>
      )}
    </View>
  );
}

/**
 * One referral in a list: avatar, name, masked phone, status pill, join date
 * and the "View Journey" action.
 */
export function ReferralRow({
  referral,
  onViewJourney,
}: {
  referral: Referral;
  onViewJourney?: (referral: Referral) => void;
}) {
  return (
    <Card padded={false} style={styles.card}>
      <View style={styles.top}>
        <Avatar name={referral.name} status={referral.status} />
        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>
            {referral.name}
          </Text>
          <Text style={styles.phone}>{referral.maskedPhone}</Text>
        </View>
        <StatusPill status={referral.status} />
      </View>

      <View style={styles.bottom}>
        <View style={styles.joined}>
          {/* Figma tints this one #206C58; the 20x20 payout calendar is #899A8D. */}
          <CalendarSmallIcon width={16} height={16} color={colors.inkDisplay} />
          <Text style={styles.joinedLabel} numberOfLines={1}>
            Joined on:{' '}
            <Text style={styles.joinedDate}>{formatJoinDate(referral.joinedAt)}</Text>
          </Text>
        </View>
        <Pressable
          onPress={() => onViewJourney?.(referral)}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.journeyAction}
        >
          <Text style={styles.journeyLink} numberOfLines={1}>
            View Journey
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  // Figma: radius 12 (not the 16 the shared Card uses), padding 16, gap 16.
  card: {
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  // Figma leaves counterAxisAlignItems unset on this row, i.e. MIN: the avatar
  // and identity fill its 40pt height anyway, but the 26pt badge sits at the top
  // rather than centring.
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  identity: {
    flex: 1,
    gap: spacing.xs,
  },
  // Figtree 600 / 16 / 20 in #424242.
  name: {
    ...typography.titleMd,
    color: colors.body,
  },
  phone: {
    ...typography.caption,
    color: '#888888',
  },
  pill: {
    flexShrink: 0,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pillLabel: {
    ...typography.caption,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    borderWidth: 1,
    borderColor: '#ABCEB7',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  // Figtree 600 / 16 / 20 in #888888 — was titleSm (14/18) in a rotating ink.
  avatarLabel: {
    ...typography.titleMd,
    color: '#888888',
  },
  // No rule above this row in Figma — the card just uses its 16pt gap.
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // The date yields first when space is tight, so the action never wraps.
  joined: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  // One Figma text node with a character override: "Joined on:" is Figtree
  // 400 and the date is the node's base 600, both #6D6D6D. Read from
  // characterStyleOverrides on node 2265:15558.
  joinedLabel: {
    flexShrink: 1,
    ...typography.bodySm,
    lineHeight: 14.4,
    color: colors.subtle,
  },
  joinedDate: {
    fontFamily: fontFamily.semibold,
  },
  // Figma draws a 1pt rule along the frame, pad=[2,0,2,0] around a 12pt line.
  // The border adds to the box in Yoga, so 2 + 12 + 1 + 1 lands the 16pt frame.
  journeyAction: {
    flexShrink: 0,
    marginLeft: spacing.sm,
    paddingTop: 2,
    paddingBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.accentText,
  },
  // Figma sets this action at 10/12 — noticeably smaller than the 14/18
  // "View All" at section level.
  journeyLink: {
    ...typography.micro,
    fontSize: 10,
    lineHeight: 12,
    color: colors.accentText,
  },
});
