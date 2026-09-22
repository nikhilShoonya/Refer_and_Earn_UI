import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

import { colors } from '../../../theme/tokens';

/**
 * The 80x80 rounded tile that holds each step's illustration.
 *
 * The tile itself (size, radius and #EEFFF2 ground) is Figma's own frame, so it
 * is reproduced here. The artwork inside must come from Figma's export — see
 * `scripts/fetch-figma-assets.mjs`. Until an export is present the tile renders
 * empty rather than showing invented artwork.
 */
export function StepIllustration({
  source,
  size = 80,
  radius = 24,
  tinted = true,
}: {
  source?: ImageSourcePropType;
  size?: number;
  radius?: number;
  tinted?: boolean;
}) {
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: tinted ? colors.surfaceGreenTint : 'transparent',
        },
      ]}
    >
      {source ? <Image source={source} style={styles.art} resizeMode="contain" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  art: {
    width: '100%',
    height: '100%',
  },
});
