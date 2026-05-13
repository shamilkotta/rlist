import { StyleSheet, View } from 'react-native';

import { useAppColors } from '@/hooks/use-theme';

const SKELETON_ROW_KEYS = ['sk-a', 'sk-b', 'sk-c', 'sk-d', 'sk-e', 'sk-f'];

const ARTICLE_SEPARATOR_DASH_KEYS: string[] = Array.from(
  { length: 36 },
  (_, index) => `dash-${index}`
);

export function ArticleCardSkeleton() {
  const c = useAppColors();

  return (
    <View style={styles.skeletonList}>
      {SKELETON_ROW_KEYS.map((rowKey) => (
        <View key={rowKey} style={styles.articleItem}>
          <View style={styles.articleCard}>
            <View style={styles.articleContent}>
              <View style={styles.articleHeader}>
                <View style={styles.articleSiteRow}>
                  <View style={[styles.faviconPlaceholder, { backgroundColor: c.border }]} />
                  <View style={[styles.domainBar, { backgroundColor: c.border }]} />
                </View>
                <View style={styles.articleTopRight}>
                  <View style={[styles.ageBar, { backgroundColor: c.border }]} />
                  <View style={[styles.menuDot, { backgroundColor: c.border }]} />
                </View>
              </View>
              <View style={[styles.titleBar, { backgroundColor: c.border }]} />
              <View style={[styles.titleBarShort, { backgroundColor: c.border }]} />
              <View style={[styles.descriptionBar, { backgroundColor: c.border }]} />
              <View style={[styles.descriptionBarMid, { backgroundColor: c.border }]} />
            </View>
            <View style={styles.articleMetaRow}>
              <View style={[styles.tagPill, { backgroundColor: c.border }]} />
              <View style={[styles.tagPill, { backgroundColor: c.border }]} />
            </View>
          </View>
          <View style={styles.articleSeparator}>
            {ARTICLE_SEPARATOR_DASH_KEYS.map((dashKey) => (
              <View
                key={dashKey}
                style={[styles.articleSeparatorDash, { backgroundColor: c.border }]}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonList: {
    flexGrow: 0,
  },
  articleItem: {
    marginTop: 10,
  },
  articleCard: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 10,
  },
  articleSeparator: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  articleSeparatorDash: {
    width: 6,
    height: 1.5,
    borderRadius: 999,
  },
  articleContent: {
    gap: 8,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  articleSiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    flex: 1,
  },
  faviconPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  domainBar: {
    height: 14,
    borderRadius: 999,
    flex: 1,
    maxWidth: '55%',
  },
  articleTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
  },
  ageBar: {
    width: 36,
    height: 13,
    borderRadius: 999,
  },
  menuDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  titleBar: {
    height: 22,
    borderRadius: 8,
    width: '100%',
  },
  titleBarShort: {
    height: 22,
    borderRadius: 8,
    width: '72%',
  },
  descriptionBar: {
    height: 16,
    borderRadius: 8,
    width: '100%',
  },
  descriptionBarMid: {
    height: 16,
    borderRadius: 8,
    width: '48%',
  },
  articleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  tagPill: {
    height: 28,
    width: 56,
    borderRadius: 999,
  },
});
