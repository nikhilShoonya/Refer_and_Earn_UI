import React, { useEffect } from 'react';
import { BackHandler, Image, Platform, StyleSheet, View } from 'react-native';

import { Scrim } from '../../../components/Scrim';
import { colors } from '../../../theme/tokens';

const QR_ASSET = require('../../../../assets/figma/images/qr-large.png');

/**
 * Geometry from Figma node 2283:530806 ("QR").
 *
 * This is NOT a bottom sheet: the design centres a square card over a light
 * scrim, with the referral footer still visible (dimmed) underneath. There is
 * no title, caption or code box on it — just the code itself.
 */
const CARD = {
  /** 358 on the 390 frame — i.e. the standard 16pt gutter either side. */
  gutter: 16,
  radius: 24,
  borderWidth: 4.5,
  borderColor: '#FEE1BA',
  /** QR artwork inside the card. */
  qrWidth: 283,
  qrHeight: 298,
};

/** Scrim is #C0CCC4 at 25% — much lighter than the sheet scrim. */
export function QrSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <View style={styles.root}>
      <Scrim onPress={onClose} accessibilityLabel="Close" />
      <View style={styles.card} pointerEvents="none">
        <Image source={QR_ASSET} style={styles.qr} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignSelf: 'stretch',
    marginHorizontal: CARD.gutter,
    // Square, per the 358x358 frame.
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CARD.radius,
    borderWidth: CARD.borderWidth,
    borderColor: CARD.borderColor,
    backgroundColor: colors.surface,
  },
  qr: {
    width: CARD.qrWidth,
    height: CARD.qrHeight,
  },
});
