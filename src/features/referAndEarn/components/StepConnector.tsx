import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * The dashed rail running behind the How it Works step cards.
 *
 * Figma draws this as a single 2pt vertical stroke (dash [4,4], #899A8D) that
 * spans the whole stack; the opaque cards cover it, so it only shows through
 * the 32pt gaps between them. Reproduced the same way rather than as three
 * separate segments, so it stays correct if a step is added or removed.
 */
export function StepConnector({ top, height }: { top: number; height: number }) {
  const dashCount = Math.ceil(height / 8);

  return (
    <View style={[styles.rail, { top, height }]}>
      {Array.from({ length: dashCount }).map((_, i) => (
        <View key={i} style={styles.dash} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    alignSelf: 'center',
    width: 2,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  // 4pt of ink, 4pt of gap — the dash pattern Figma specifies.
  dash: {
    width: 2,
    height: 4,
    marginBottom: 4,
    backgroundColor: '#899A8D',
  },
});
