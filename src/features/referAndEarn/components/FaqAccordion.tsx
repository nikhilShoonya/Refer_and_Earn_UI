import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';

import { Card } from '../../../components/primitives';
import { ChevronDownIcon, ChevronUpIcon } from '../../../icons';
import { colors, spacing } from '../../../theme/tokens';
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
              {open ? (
                <ChevronUpIcon width={16} height={16} color={colors.accent} />
              ) : (
                <ChevronDownIcon width={16} height={16} color={colors.accent} />
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
  list: { gap: spacing.md },
  card: { padding: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  question: { flex: 1 },
  answerBlock: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  answer: {
    ...typography.bodyMd,
    color: colors.muted,
  },
  answerStrong: {
    fontFamily: fontFamily.semibold,
    color: colors.body,
  },
});
