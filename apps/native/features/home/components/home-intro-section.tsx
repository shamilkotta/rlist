import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PaginationStatus, TabFilter } from '@/features/home/home-feed.types';
import { useAppColors } from '@/hooks/use-theme';

const TAB_HEADINGS: Record<TabFilter, string> = {
  unread: 'Your Articles',
  all: 'All Articles',
  archive: 'Archived Articles',
};

type HomeIntroSectionProps = {
  filter: TabFilter;
  status: PaginationStatus;
  articleCount: number;
  onPressSaveUrl: () => void;
};

export function HomeIntroSection({
  filter,
  status,
  articleCount,
  onPressSaveUrl,
}: HomeIntroSectionProps) {
  const c = useAppColors();

  const isLoading =
    articleCount === 0 && (status === 'LoadingFirstPage' || status === 'LoadingMore');
  const isEmpty = articleCount === 0 && status !== 'LoadingFirstPage' && status !== 'LoadingMore';

  return (
    <View>
      <Text style={[styles.title, { color: c.text }]}>{TAB_HEADINGS[filter]}</Text>

      <Pressable style={[styles.urlInputWrap, { borderColor: c.border }]} onPress={onPressSaveUrl}>
        <Feather name="link" size={15} color={c.subtitle} />
        <Text style={[styles.urlPlaceholder, { color: c.subtitle }]}>Paste a URL to save...</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.loadingList}>
          <ActivityIndicator size="small" color={c.subtitle} />
        </View>
      ) : null}
      {isEmpty ? (
        <Text style={[styles.emptyText, { color: c.subtitle }]}>No articles in this view yet.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 22,
    marginBottom: 16,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: 'Geist-ExtraBold',
  },
  urlInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    marginBottom: 4,
  },
  urlPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Geist',
  },
  loadingList: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 18,
    fontSize: 15,
    fontFamily: 'Geist',
  },
});
