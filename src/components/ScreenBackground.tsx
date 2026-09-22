import { BlurTargetView } from 'expo-blur';
import React, { useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { colors } from '../theme/tokens';

import { BlurTargetProvider } from './BlurTarget';

const BACKDROP = require('../../assets/figma/images/screen-background.png');

/**
 * The "Background" component every Figma frame sits on (node 2265:13696) — the
 * soft green wash bleeding down from the top of the screen.
 *
 * Figma builds it from a gradient plus two ellipses under three layer blurs.
 * React Native has no layer-blur primitive, so rather than approximate it this
 * ships Figma's own render. It is pinned to the top and sized to the design's
 * 390x844 aspect; below that the flat canvas colour takes over, which is what
 * the artwork fades into anyway.
 */
export function ScreenBackground({
  children,
  overlay,
}: {
  children: React.ReactNode;
  /**
   * Sheets, scrims and anything else that dims the page. These MUST render
   * outside the blur target: a blur view nested inside the target it blurs
   * recurses on every draw and takes the process down with it. See
   * `BlurTarget`.
   */
  overlay?: React.ReactNode;
}) {
  const targetRef = useRef<View | null>(null);

  return (
    <BlurTargetProvider value={targetRef}>
      <View style={styles.root}>
        {/* Wash and content together are what an overlay blurs on Android. */}
        <BlurTargetView ref={targetRef} style={styles.target}>
          <Image source={BACKDROP} style={styles.backdrop} resizeMode="cover" />
          {children}
        </BlurTargetView>

        {overlay}
      </View>
    </BlurTargetProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  target: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Design aspect ratio (390x844), so the wash lands where Figma places it
    // regardless of device height.
    aspectRatio: 390 / 844,
    width: '100%',
    height: undefined,
    pointerEvents: 'none',
  },
});
