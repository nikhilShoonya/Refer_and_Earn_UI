import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '../../../components/AppHeader';
import { ScreenBackground } from '../../../components/ScreenBackground';
import { Toast } from '../../../components/Toast';
import { SearchDuotoneIcon, TabCalendarIcon, TabFilterIcon } from '../../../icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { fontFamily, typography } from '../../../theme/typography';
import { CsvColumn, datedFileName, toCsv } from '../../../utils/csv';
import { EXPORT_MESSAGE } from '../../../utils/exportMessage';
import { formatJoinDate } from '../../../utils/format';
import { saveTextFile } from '../../../utils/saveFile';
import { useReferralClient } from '../api/ReferralProvider';
import { DateRangeFilter, Referral, ReferralStatus } from '../api/types';
import { useAsync } from '../api/useAsync';
import { ReferralFooter } from '../components/ReferralFooter';
import { ReferralRow } from '../components/ReferralRow';
import { ReferralStatsCard } from '../components/ReferralStatsCard';
import { FilterByDateSheet } from '../sheets/FilterByDateSheet';
import { QrSheet } from '../sheets/QrSheet';
import { ReferralJourneySheet } from '../sheets/ReferralJourneySheet';

/** Figma fades the tab strip behind the actions with #F0FFF4. */
const TAB_FADE = '#F0FFF4';

type Tab = 'all' | ReferralStatus;

/** Human-readable status for the export, rather than the wire value. */
const STATUS_LABEL: Record<ReferralStatus, string> = {
  registered: 'Registered',
  kyc_completed: 'KYC Completed',
  activated: 'Activated',
  pending: 'Pending',
};

const REFERRAL_COLUMNS: CsvColumn<Referral>[] = [
  { header: 'Name', value: (r) => r.name },
  { header: 'Mobile', value: (r) => r.maskedPhone },
  { header: 'Status', value: (r) => STATUS_LABEL[r.status] ?? r.status },
  { header: 'Joined On', value: (r) => formatJoinDate(r.joinedAt) },
];

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'registered', label: 'Registered' },
  { key: 'kyc_completed', label: 'KYC Completed' },
  { key: 'activated', label: 'Activated' },
];

/** My Referrals — stat cards, status tabs, the referral list and CSV export. */
export function MyReferralsScreen({ onBack }: { onBack?: () => void }) {
  const client = useReferralClient();
  const [tab, setTab] = useState<Tab>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateRangeFilter | undefined>();
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [qrOpen, setQrOpen] = useState(false);

  const { data: referrals } = useAsync(
    () => client.getReferrals({ status: tab, date: dateFilter }),
    [client, tab, dateFilter],
  );
  const { data: code } = useAsync(() => client.getReferralCode(), [client]);
  const { data: totals } = useAsync(() => client.getReferralTotals(), [client]);

  // Stats, tabs and list appear together rather than the static chrome first.
  const ready = totals !== null && referrals !== null;

  // Name or masked number, so the digits a user can actually see are searchable.
  const needle = query.trim().toLowerCase();
  const digits = needle.replace(/\D/g, '');
  const visible = (referrals ?? []).filter((referral) => {
    if (!needle) return true;
    if (referral.name.toLowerCase().includes(needle)) return true;
    // Guard the digit match: "".includes("") is true, which would match every
    // row for a text-only query.
    return digits.length > 0 && referral.maskedPhone.replace(/\D/g, '').includes(digits);
  });

  async function handleExport() {
    // Exports exactly what the list is showing — the active tab, date filter
    // and search all already narrowed `visible`, so the file matches the
    // screen rather than dumping every referral.
    if (visible.length === 0) {
      setToast('Nothing to export');
      setTimeout(() => setToast(null), 2200);
      return;
    }

    const csv = toCsv(REFERRAL_COLUMNS, visible);
    const outcome = await saveTextFile(datedFileName('my-referrals'), csv);
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
          <ReferralJourneySheet
            visible={journeyId !== null}
            referralId={journeyId}
            onClose={() => setJourneyId(null)}
          />
          <QrSheet visible={qrOpen} onClose={() => setQrOpen(false)} />
        </>
      }
    >
      <AppHeader
        title="My Referrals"
        onBack={onBack}
        onSearch={() => {
          setSearchOpen((open) => !open);
          setQuery('');
        }}
      />

      {searchOpen ? (
        <View style={styles.searchField}>
          <SearchDuotoneIcon width={20} height={20} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or number"
            placeholderTextColor={colors.subtle}
            style={styles.searchInput}
            accessibilityLabel="Search referrals by name or number"
            autoFocus
          />
        </View>
      ) : null}

      {ready ? (
        <View style={styles.statsWrap}>
          <ReferralStatsCard
            counts={totals ?? { registered: 0, kycCompleted: 0, activated: 0 }}
          />
        </View>
      ) : null}

      {/* The tab strip scrolls under a fade, with the actions pinned over it. */}
      {ready ? (
      <View style={styles.tabRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabStrip}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.tabActions}>
          <LinearGradient
            colors={['rgba(240, 255, 244, 0.35)', TAB_FADE, TAB_FADE]}
            locations={[0, 0.6, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.tabFade}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter by date"
            onPress={() => setFilterOpen(true)}
            hitSlop={8}
          >
            <TabCalendarIcon width={24} height={24} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export referrals as CSV"
            onPress={handleExport}
            hitSlop={8}
          >
            <TabFilterIcon width={24} height={24} />
          </Pressable>
        </View>
      </View>
      ) : null}

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {visible.map((referral: Referral) => (
          <ReferralRow
            key={referral.id}
            referral={referral}
            onViewJourney={(r) => setJourneyId(r.id)}
          />
        ))}
        {referrals && visible.length === 0 ? (
          <Text style={styles.empty}>
            {query ? `No referrals match "${query}".` : 'No referrals in this view yet.'}
          </Text>
        ) : null}
      </ScrollView>

      {toast ? <Toast label={toast} /> : null}

      <ReferralFooter code={code} onShowQr={() => setQrOpen(true)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  statsWrap: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 10,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 42,
    marginHorizontal: spacing.gutter,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#D8EFDE',
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.ink,
    outlineStyle: 'none' as never,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  // Without this the strip is treated as a flex child, gets squeezed by the
  // list below, and crushes each pill's vertical padding away.
  tabStrip: {
    flexGrow: 1,
    flexShrink: 1,
  },
  tabs: {
    gap: 11,
    paddingHorizontal: spacing.gutter,
  },
  // Figma's pill is 34 tall: pad 8 around an 18pt line with a 1pt INSIDE
  // stroke. Yoga adds the border to the box instead, so the padding comes down
  // to 7 to land the same 34 (and the same width).
  tab: {
    flexShrink: 0,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#899A8D',
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
  tabActive: { borderColor: colors.ink },
  tabLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 18,
    color: '#899A8D',
  },
  tabLabelActive: {
    fontFamily: fontFamily.semibold,
    color: colors.ink,
  },
  tabActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingRight: spacing.gutter,
    paddingLeft: spacing.sm,
  },
  // Lets the tabs scroll out of sight behind the actions rather than collide.
  tabFade: {
    position: 'absolute',
    left: -28,
    top: -12,
    bottom: -12,
    width: 28,
  },
  listScroll: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  empty: {
    ...typography.bodyMd,
    color: colors.subtle,
    textAlign: 'center',
    paddingTop: spacing.xxl,
  },
});
