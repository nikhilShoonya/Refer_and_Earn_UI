import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { StatusBarRightIcon } from '../icons';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/typography';

import { IPHONE_16 } from './DeviceFrame';

const IS_WEB = Platform.OS === 'web';

function clockLabel(date: Date): string {
  const hours = date.getHours() % 12 === 0 ? 12 : date.getHours() % 12;
  return `${hours}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Clock rendered into the Dynamic Island's row for the browser mockup only.
 *
 * On a real handset iOS paints the status bar over the app, so this renders
 * nothing there. The signal/Wi-Fi/battery cluster is Figma's own export, not
 * hand-drawn.
 */
export function DeviceStatusBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!IS_WEB) return undefined;
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!IS_WEB) return null;

  return (
    <View style={styles.root}>
      <Text style={styles.time}>{clockLabel(now)}</Text>
      <View style={styles.spacer} />
      <StatusBarRightIcon width={77} height={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: IPHONE_16.island.top,
    left: 0,
    right: 0,
    height: IPHONE_16.island.height,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    pointerEvents: 'none',
  },
  spacer: {
    flex: 1,
  },
  time: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.ink,
  },
});
