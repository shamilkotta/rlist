import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TabFilter } from '@/features/home/home-feed.types';
import { useAppColors } from '@/hooks/use-theme';

const FILTERS: { label: string; value: TabFilter }[] = [
  { label: 'Unread', value: 'unread' },
  { label: 'All Items', value: 'all' },
  { label: 'Archive', value: 'archive' },
];

type HomeFilterTabsProps = {
  filter: TabFilter;
  onFilterChange: (filter: TabFilter) => void;
};

export function HomeFilterTabs({ filter, onFilterChange }: HomeFilterTabsProps) {
  const c = useAppColors();

  return (
    <View style={[styles.filterStickyWrapper, { backgroundColor: c.background }]}>
      <View style={styles.filterRowOuter}>
        <View style={styles.filterTabs}>
          {FILTERS.map((filterItem) => (
            <Pressable key={filterItem.value} onPress={() => onFilterChange(filterItem.value)}>
              <Text
                style={
                  filter === filterItem.value
                    ? [styles.filterActive, { color: c.text }]
                    : [styles.filterMuted, { color: c.subtitle }]
                }
              >
                {filterItem.label}
              </Text>
              {filter === filterItem.value ? (
                <View style={[styles.filterIndicator, { backgroundColor: c.text }]} />
              ) : (
                <View style={[styles.filterIndicator]} />
              )}
            </Pressable>
          ))}
          <View style={styles.tagsDropdown}>
            <Text style={[styles.filterMuted, { color: c.subtitle }]}>Tags</Text>
            <Feather name="chevron-down" size={14} color={c.subtitle} />
          </View>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: c.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  filterStickyWrapper: {},
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
  },
  filterRowOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  filterTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  filterActive: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  filterMuted: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Geist-SemiBold',
  },
  filterIndicator: {
    marginTop: 10,
    height: 2,
    borderRadius: 999,
  },
  tagsDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
});
