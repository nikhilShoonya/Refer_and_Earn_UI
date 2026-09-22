import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet } from '../../../components/BottomSheet';
import { PrimaryButton } from '../../../components/primitives';
import { CheckCircleIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { typography } from '../../../theme/typography';
import { useReferralClient } from '../api/ReferralProvider';

type Status =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'valid'; referrerName: string }
  | { kind: 'invalid'; message: string };

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Fires once a code has been verified and the user confirms. */
  onApply: (code: string, referrerName: string) => void;
}

/**
 * Flow 2, step b/c: the signup screen's "Have a Referral Code?" link opens this
 * sheet. The code is verified in place, then applied back to the signup form.
 */
export function ReferralCodeSheet({ visible, onClose, onApply }: Props) {
  const client = useReferralClient();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const verified = status.kind === 'valid';

  function reset() {
    setCode('');
    setStatus({ kind: 'idle' });
  }

  async function handleVerify() {
    if (!code.trim()) return;
    setStatus({ kind: 'checking' });
    const result = await client.validateReferralCode(code);
    setStatus(
      result.valid
        ? { kind: 'valid', referrerName: result.referrerName }
        : { kind: 'invalid', message: result.message },
    );
  }

  function handlePrimary() {
    if (verified) {
      onApply(code.trim().toUpperCase(), status.referrerName);
      reset();
      onClose();
      return;
    }
    void handleVerify();
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Have a Referral Code?"
      maxHeightRatio={0.5}
    >
      <View style={styles.body}>
        <View
          style={[
            styles.field,
            verified && styles.fieldVerified,
            status.kind === 'invalid' && styles.fieldInvalid,
          ]}
        >
          <TextInput
            value={code}
            onChangeText={(next) => {
              setCode(next);
              if (status.kind !== 'idle') setStatus({ kind: 'idle' });
            }}
            placeholder="Enter referral code(optional)"
            placeholderTextColor={colors.subtle}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!verified}
            style={styles.input}
            accessibilityLabel="Referral code"
          />
          {verified ? <CheckCircleIcon width={16} height={16} /> : null}
        </View>

        {verified ? (
          <Text style={styles.referrer}>Referred by {status.referrerName}</Text>
        ) : null}
        {status.kind === 'invalid' ? <Text style={styles.error}>{status.message}</Text> : null}

        <PrimaryButton
          label={verified ? 'Continue' : status.kind === 'checking' ? 'Verifying…' : 'Verify'}
          onPress={handlePrimary}
          disabled={!code.trim() || status.kind === 'checking'}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md, paddingBottom: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  fieldVerified: { borderColor: colors.positive },
  fieldInvalid: { borderColor: colors.warning },
  input: {
    flex: 1,
    ...typography.titleSm,
    color: colors.ink,
    // RN web draws a focus ring on inputs that the design does not have.
    outlineStyle: 'none' as never,
  },
  referrer: { ...typography.caption, color: colors.positive },
  error: { ...typography.caption, color: colors.warning },
});
