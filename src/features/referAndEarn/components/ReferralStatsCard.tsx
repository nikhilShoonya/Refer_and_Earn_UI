import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StatActivatedIcon, StatKycIcon, UserAddIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';
import { FunnelCounts } from '../api/types';

/**
 * Geometry from Figma node 2265:13700.
 *
 * One 50pt card holding three segments split by hairline dividers — not three
 * separate cards. Each segment pairs a 24pt tinted icon tile with a stacked
 * label and value.
 */
const SEGMENT = { height: 32, tile: 24, tileRadius: 4, gap: 8 };

function Segment({
  icon,
  tint,
  label,
  value,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.segment}>
      <View style={[styles.tile, { backgroundColor: tint }]}>{icon}</View>
      <View style={styles.text}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

export function ReferralStatsCard({ counts }: { counts: FunnelCounts }) {
  return (
    <View style={styles.card}>
      <Segment
        icon={<UserAddIcon width={12} height={12} />}
        tint="#FAFAFA"
        label="Registered"
        value={counts.registered}
      />
      <View style={styles.divider} />
      <Segment
        icon={<StatKycIcon width={12} height={12} />}
        tint="#F1FBFF"
        label="KYC Done"
        value={counts.kycCompleted}
      />
      <View style={styles.divider} />
      <Segment
        icon={<StatActivatedIcon width={12} height={12} />}
        tint="#F1FFF7"
        label="Activated"
        value={counts.activated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#D8EFDE',
    backgroundColor: colors.surface,
  },
  // Figma leaves the segment's counter axis unset (MIN), so the 24pt tile sits
  // at the top of the 32pt row. The label/value block is exactly 32, so it
  // fills either way.
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SEGMENT.gap,
    height: SEGMENT.height,
  },
  tile: {
    width: SEGMENT.tile,
    height: SEGMENT.tile,
    borderRadius: SEGMENT.tileRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    lineHeight: 12,
    color: colors.body,
  },
  value: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  divider: {
    width: 1,
    height: SEGMENT.height,
    marginHorizontal: spacing.sm,
    backgroundColor: '#D8EFDE',
  },
});
