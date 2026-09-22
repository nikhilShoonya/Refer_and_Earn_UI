import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';

import { Card } from '../../../components/primitives';
import { ChevronDownIcon, ChevronUpIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { fontFamily, typography } from '../../../theme/typography';
import { FaqItem } from '../api/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Splits a paragraph into plain and emphasised runs on `**` markers, so the
 * design's semibold phrases (the reward amounts) survive into the render.
 */
function runs(paragraph: string): { text: string; bold: boolean }[] {
  return paragraph
    .split('**')
    .filter((part) => part.length > 0)
    .map((text, i) => ({ text, bold: i % 2 === 1 }));
}

/** FAQ list where the first item starts expanded, as drawn in Figma. */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  function toggle(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <Card key={item.id} style={styles.card}>
            <Pressable
              onPress={() => toggle(item.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              style={styles.head}
            >
              <Text style={[typography.titleSm, styles.question]}>{item.question}</Text>
              {/* Duotone in Figma (#424242 base, #EFA145 overlay) — passing a
                  colour flattened both paths to amber. */}
              {open ? (
                <ChevronUpIcon width={16} height={16} />
              ) : (
                <ChevronDownIcon width={16} height={16} />
              )}
            </Pressable>
            {open ? (
              <View style={styles.answerBlock}>
                {item.answer.map((paragraph, pi) => (
                  <Text key={pi} style={styles.answer}>
                    {runs(paragraph).map((run, ri) => (
                      <Text key={ri} style={run.bold ? styles.answerStrong : undefined}>
                        {run.text}
                      </Text>
                    ))}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.lg },
  // Figma: r12 (not the 16 the shared Card defaults to), 16 top and bottom
  // but 24 either side.
  card: {
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  question: { flex: 1, color: colors.inkDeep },
  answerBlock: {
    marginTop: spacing.lg,
    // One extra line of pitch between paragraphs, which is what Figma draws.
    gap: 18,
  },
  // 12/18, not the 14/18 `bodyMd` carries — at 14 the first paragraph wraps to
  // three lines instead of two and the card grows 8pt.
  answer: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  answerStrong: {
    fontFamily: fontFamily.semibold,
    color: colors.body,
  },
});
