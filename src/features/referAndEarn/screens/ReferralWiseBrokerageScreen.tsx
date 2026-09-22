import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/AppHeader';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { Toast } from '../../../components/Toast';
import { TabCalendarIcon, TabFilterIcon } from '../../../icons';
import { colors, spacing } from '../../../theme/tokens';
import { fontFamily } from '../../../theme/typography';
import { CsvColumn, datedFileName, toCsv } from '../../../utils/csv';
import { EXPORT_MESSAGE } from '../../../utils/exportMessage';
import { saveTextFile } from '../../../utils/saveFile';
import { useReferralClient } from '../api/ReferralProvider';
import { BrokerageByReferral, DateRangeFilter } from '../api/types';
import { useAsync } from '../api/useAsync';
import { BrokerageRow } from '../components/BrokerageRow';
import { ReferralFooter } from '../components/ReferralFooter';
import { FilterByDateSheet } from '../sheets/FilterByDateSheet';
import { QrSheet } from '../sheets/QrSheet';


/**
 * Amounts export as plain numbers, not "₹2,460" — a spreadsheet can format
 * and total a number, but a currency string is just text it cannot sum.
 */
const BROKERAGE_COLUMNS: CsvColumn<BrokerageByReferral>[] = [
  { header: 'Name', value: (r) => r.name },
  { header: 'Mobile', value: (r) => r.maskedPhone },
  { header: 'Brokerage Generated (INR)', value: (r) => r.generated },
  { header: 'Earned (INR)', value: (r) => r.earned },
  { header: 'Paid (INR)', value: (r) => r.paid },
  { header: 'Pending (INR)', value: (r) => r.pending },
];

/** The full per-referral brokerage list with date filtering. */
export function ReferralWiseBrokerageScreen({ onBack }: { onBack?: () => void }) {
  const client = useReferralClient();
  const [filterOpen, setFilterOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateRangeFilter | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const { data: rows } = useAsync(
    () => client.getBrokerageByReferral(dateFilter),
    [client, dateFilter],
  );
  const { data: code } = useAsync(() => client.getReferralCode(), [client]);

  // Count row and list appear together.
  const ready = rows !== null;

  async function handleExport() {
    // This screen was exporting the referral list, not brokerage. It now
    // exports its own rows, honouring the active date filter.
    const data = rows ?? [];
    if (data.length === 0) {
      setToast('Nothing to export');
      setTimeout(() => setToast(null), 2200);
      return;
    }

    const csv = toCsv(BROKERAGE_COLUMNS, data);
    const outcome = await saveTextFile(datedFileName('referral-wise-brokerage'), csv);
    setToast(EXPORT_MESSAGE[outcome]);
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <ScreenBackground
      overlay={
        <>
          <FilterByDateSheet
            visible={filterOpen}
            onClose={() => setFilterOpen(false)}
            onApply={setDateFilter}
          />
          <QrSheet visible={qrOpen} onClose={() => setQrOpen(false)} />
        </>
      }
    >
      <AppHeader
        title="Referral Wise Brokerage"
        onBack={onBack}
        horizontalPadding={spacing.xl}
      />

      {ready ? (
      <View style={styles.bar}>
        <Text style={styles.count}>{(rows ?? []).length} Referrals</Text>

        <View style={styles.actions}>
          <Pressable
            onPress={() => setFilterOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Filter by date"
            hitSlop={8}
          >
            <TabCalendarIcon width={24} height={24} />
          </Pressable>
          <Pressable
            onPress={handleExport}
            accessibilityRole="button"
            accessibilityLabel="Export brokerage as CSV"
            hitSlop={8}
          >
            <TabFilterIcon width={24} height={24} />
          </Pressable>
        </View>
      </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {(rows ?? []).map((row) => (
          <BrokerageRow key={row.id} row={row} columns={3} />
        ))}
      </ScrollView>

      {toast ? <Toast label={toast} /> : null}

      <ReferralFooter code={code} onShowQr={() => setQrOpen(true)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  // Figma puts the 24pt action row at y 95-119 and the first card at 140,
  // measured from a 44pt status bar under a 46pt nav. Our nav hugs to 44
  // here (Figma's holds 46 via an invisible right-hand slot), so the 8/12
  // Figma padding becomes 7 above and 21 below to land the same absolute
  // positions.
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: 7,
    paddingBottom: 21,
  },
  count: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.body,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
});
