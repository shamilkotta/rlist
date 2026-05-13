import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  isTagPanelOpen: boolean;
  onToggleTagPanel: () => void;
  selectedTags: string[];
  availableTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
};

export function HomeFilterTabs({
  filter,
  onFilterChange,
  isTagPanelOpen,
  onToggleTagPanel,
  selectedTags,
  availableTags,
  onToggleTag,
  onClearTags,
}: HomeFilterTabsProps) {
  const c = useAppColors();

  const hasSelectedTags = selectedTags.length > 0;
  const isTagsActive = hasSelectedTags || isTagPanelOpen;

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
          <Pressable style={styles.tagsDropdown} onPress={onToggleTagPanel} hitSlop={4}>
            <Text style={[styles.filterMuted, { color: isTagsActive ? c.text : c.subtitle }]}>
              Tags
            </Text>
            {hasSelectedTags && (
              <View style={[styles.tagBadge, { backgroundColor: c.border }]}>
                <Text style={[styles.tagBadgeText, { color: c.text }]}>{selectedTags.length}</Text>
              </View>
            )}
            <Feather
              name="chevron-down"
              size={14}
              color={isTagsActive ? c.text : c.subtitle}
              style={isTagPanelOpen ? styles.chevronRotated : undefined}
            />
          </Pressable>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: c.border }]} />

      {isTagPanelOpen && (
        <View style={styles.tagPanel}>
          {hasSelectedTags && (
            <View style={styles.selectedTagsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedTagsScroll}
              >
                {selectedTags.map((tag) => (
                  <Pressable
                    key={tag}
                    style={[styles.selectedTagChip, { borderColor: c.tint }]}
                    onPress={() => onToggleTag(tag)}
                  >
                    <Text style={[styles.selectedTagText, { color: c.tint }]}>{tag}</Text>
                    <Feather name="x" size={12} color={c.tint} />
                  </Pressable>
                ))}
                <Pressable onPress={onClearTags} style={styles.clearAllButton}>
                  <Text style={[styles.clearAllText, { color: c.subtitle }]}>Clear all</Text>
                </Pressable>
              </ScrollView>
            </View>
          )}

          {availableTags.length > 0 ? (
            <View style={styles.availableTagsContainer}>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    style={[
                      styles.availableTagChip,
                      {
                        borderColor: isSelected ? c.tint : c.border,
                        backgroundColor: isSelected ? `${c.tint}15` : 'transparent',
                      },
                    ]}
                    onPress={() => onToggleTag(tag)}
                  >
                    <Text
                      style={[styles.availableTagText, { color: isSelected ? c.tint : c.subtitle }]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.emptyTagsText, { color: c.subtitle }]}>
              No tags found for this tab.
            </Text>
          )}
          <View style={[styles.divider, { backgroundColor: c.border, marginTop: 12 }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterStickyWrapper: {
    zIndex: 10,
    elevation: 10,
  },
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
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  filterMuted: {
    fontSize: 16,
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
    gap: 6,
    paddingTop: 2,
    paddingBottom: 12,
  },
  tagBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Geist-SemiBold',
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  tagPanel: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  selectedTagsContainer: {
    marginBottom: 12,
  },
  selectedTagsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectedTagText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Geist-Medium',
  },
  availableTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availableTagChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  availableTagText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyTagsText: {
    fontSize: 14,
    fontFamily: 'Geist',
  },
});
