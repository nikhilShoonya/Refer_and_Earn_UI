import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '../../../components/primitives';
import { colors, radii, spacing } from '../../../theme/tokens';
import { typography } from '../../../theme/typography';
import { formatCurrency, initialsOf, tintIndex } from '../../../utils/format';
import { Contributor } from '../api/types';

/** Figma node 2265:14481 — a distinct disc per rank, not one amber for all. */
const RANK_COLOR: Record<1 | 2 | 3, string> = {
  1: '#E9B328',
  2: '#E1E6E2',
  3: '#E78500',
};

function Podium({ contributor }: { contributor: Contributor }) {
  const first = contributor.rank === 1;
  const idx = tintIndex(contributor.name, colors.avatarTints.length);

  return (
    <View style={[styles.podium, first ? styles.podiumFirst : styles.podiumSide]}>
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: colors.avatarTints[idx] }]}>
          {contributor.avatarUrl ? (
            <Image source={{ uri: contributor.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarLabel, { color: colors.avatarInk[idx] }]}>
              {initialsOf(contributor.name)}
            </Text>
          )}
        </View>
        <View style={[styles.rank, { backgroundColor: RANK_COLOR[contributor.rank] }]}>
          <Text style={styles.rankLabel}>{contributor.rank}</Text>
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {contributor.name}
      </Text>
      <Text style={styles.amount}>{formatCurrency(contributor.amount)}</Text>
    </View>
  );
}

/**
 * "Top Brokerage Contributors" — a three-up podium with rank 1 raised and
 * centred, matching the Figma layout.
 */
export function ContributorsCard({
  contributors,
  onViewDetail,
}: {
  contributors: Contributor[];
  onViewDetail?: () => void;
}) {
  if (contributors.length === 0) return null;

  // Figma orders the podium 2 - 1 - 3 left to right.
  const ordered = [...contributors].sort((a, b) => {
    const order = { 2: 0, 1: 1, 3: 2 } as const;
    return order[a.rank] - order[b.rank];
  });

  return (
    <View style={styles.root}>
      <SectionHeader
        title="Top Brokerage Contributors"
        actionLabel="View Detail"
        onAction={onViewDetail}
      />
      <View style={styles.row}>
        {ordered.map((c) => (
          <Podium key={c.id} contributor={c} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Figma: pad [12,8,12,8], gap 12, radius 12 — and no shadow on any of the
  // three. The raised look comes purely from the first card's offset.
  podium: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  podiumFirst: {},
  podiumSide: {
    marginTop: spacing.md,
  },
  avatarWrap: {
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    // Figma rings the photo with a 1pt #ABCEB7 hairline.
    borderWidth: 1,
    borderColor: '#ABCEB7',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLabel: {
    ...typography.titleMd,
  },
  rank: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figtree 600 10/12 in black — not white, and no ring around the disc.
  rankLabel: {
    ...typography.micro,
    lineHeight: 12,
    color: '#000000',
  },
  name: {
    ...typography.caption,
    lineHeight: 13.2,
    color: colors.body,
    textAlign: 'center',
  },
  // Figtree 600 12/14.4 in #206C58 — was titleSm (14/18) in colors.positive.
  amount: {
    ...typography.labelStrong,
    lineHeight: 14.4,
    color: colors.inkDisplay,
  },
});
