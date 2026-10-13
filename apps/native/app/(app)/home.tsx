import { convexQuery } from '@convex-dev/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { api } from '@rlist/api/convex/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ArticleActionsSheet,
  ArticleCard,
  ArticleCardSkeleton,
  DeleteArticleDialog,
  HomeFilterTabs,
  HomeHeader,
  HomeIntroSection,
} from '@/features/home/components';
import type { DisplayArticle, TabFilter } from '@/features/home/home-feed.types';
import { useLocalHomeFeed } from '@/hooks/use-local-home-feed';
import { useAppColors, useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import { normalizeTags } from '@/lib/tags';

type HomeListItem =
  | { type: 'filter' }
  | { type: 'intro' }
  | { type: 'article-skeletons' }
  | { type: 'article'; article: DisplayArticle };

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { data: session } = authClient.useSession();
  const { colorScheme } = useTheme();
  const c = useAppColors();

  const [filter, setFilter] = useState<TabFilter>('unread');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagPanelOpen, setIsTagPanelOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<DisplayArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DisplayArticle | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFilterPinned, setIsFilterPinned] = useState(false);
  const headerHeightRef = useRef(0);

  const userId = session?.user?.id;

  const { data: availableTags = [] } = useQuery({
    ...convexQuery(api.articles.listUserTags, { filter }),
    enabled: !!userId && isFocused,
  });

  const { articles, status, loadMore, toggleRead, toggleArchive, deleteArticle, updateTags } =
    useLocalHomeFeed(userId, filter, selectedTags, isFocused);

  const handleFilterChange = useCallback((newFilter: TabFilter) => {
    setFilter(newFilter);
    setSelectedTags([]);
    setIsTagPanelOpen(false);
  }, []);

  const handleToggleTagPanel = useCallback(() => {
    setIsTagPanelOpen((prev) => !prev);
  }, []);

  const handleToggleTag = useCallback((tag: string) => {
    const normalizedTag = normalizeTags([tag]).at(0);
    if (!normalizedTag) return;

    setSelectedTags((prev) =>
      prev.includes(normalizedTag)
        ? prev.filter((t) => t !== normalizedTag)
        : normalizeTags([...prev, normalizedTag])
    );
  }, []);

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const closeActionSheet = () => {
    setActionTarget(null);
    setDeleteTarget(null);
    setShowDeleteConfirm(false);
  };

  const onActionToggleRead = () => {
    if (!actionTarget) return;
    void toggleRead(actionTarget.articleId);
    closeActionSheet();
  };

  const onActionToggleArchive = () => {
    if (!actionTarget) return;
    void toggleArchive(actionTarget.articleId);
    closeActionSheet();
  };

  const onOpenDeleteDialog = () => {
    if (!actionTarget) return;
    setDeleteTarget(actionTarget);
    setActionTarget(null);
    setShowDeleteConfirm(true);
  };

  const onActionDelete = () => {
    if (!deleteTarget) return;
    void deleteArticle(deleteTarget.articleId);
    closeActionSheet();
  };

  const handleEndReached = useCallback(() => {
    if (status === 'CanLoadMore') {
      loadMore();
    }
  }, [status, loadMore]);

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    headerHeightRef.current = event.nativeEvent.layout.height;
  }, []);

  // The filter tabs are pinned with an overlay instead of `stickyHeaderIndices`: on Android
  // with the new architecture, sticky headers keep their unscrolled position for JS hit
  // testing, so presses on them were cancelled once the list was scrolled.
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const headerHeight = headerHeightRef.current;
    setIsFilterPinned(headerHeight > 0 && event.nativeEvent.contentOffset.y >= headerHeight);
  }, []);

  const listData = useMemo<HomeListItem[]>(() => {
    const head: HomeListItem[] = [{ type: 'filter' }, { type: 'intro' }];
    if (status === 'LoadingFirstPage') {
      return [...head, { type: 'article-skeletons' }];
    }
    return [...head, ...articles.map((article): HomeListItem => ({ type: 'article', article }))];
  }, [articles, status]);

  const filterTabs = useMemo(
    () => (
      <HomeFilterTabs
        filter={filter}
        onFilterChange={handleFilterChange}
        isTagPanelOpen={isTagPanelOpen}
        onToggleTagPanel={handleToggleTagPanel}
        selectedTags={selectedTags}
        availableTags={availableTags}
        onToggleTag={handleToggleTag}
        onClearTags={handleClearTags}
      />
    ),
    [
      availableTags,
      filter,
      handleClearTags,
      handleFilterChange,
      handleToggleTag,
      handleToggleTagPanel,
      isTagPanelOpen,
      selectedTags,
    ]
  );

  const renderListItem = useCallback(
    ({ item }: { item: HomeListItem }) => {
      if (item.type === 'filter') {
        return filterTabs;
      }

      if (item.type === 'intro') {
        return <HomeIntroSection filter={filter} status={status} articleCount={articles.length} />;
      }

      if (item.type === 'article-skeletons') {
        return <ArticleCardSkeleton />;
      }

      return (
        <ArticleCard
          article={item.article}
          activeTags={selectedTags}
          onOpenActions={setActionTarget}
          onUpdateTags={updateTags}
          onTagClick={handleToggleTag}
        />
      );
    },
    [articles.length, filter, filterTabs, handleToggleTag, selectedTags, status, updateTags]
  );

  const renderHeader = useCallback(
    () => (
      <View onLayout={handleHeaderLayout}>
        <HomeHeader
          userName={session?.user?.name}
          onPressProfile={() => router.push('/profile')}
          onPressSearch={() => router.push('/search')}
        />
      </View>
    ),
    [handleHeaderLayout, session?.user?.name, router]
  );

  const renderFooter = useCallback(() => {
    if (status === 'LoadingMore') {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={c.subtitle} />
        </View>
      );
    }
    return null;
  }, [c.subtitle, status]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList<HomeListItem>
          data={listData}
          renderItem={renderListItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={9}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
        {isFilterPinned && <View style={styles.pinnedFilter}>{filterTabs}</View>}
      </KeyboardAvoidingView>

      <ArticleActionsSheet
        article={actionTarget}
        onClose={closeActionSheet}
        onToggleRead={onActionToggleRead}
        onToggleArchive={onActionToggleArchive}
        onDelete={onOpenDeleteDialog}
      />

      <DeleteArticleDialog
        visible={showDeleteConfirm}
        onClose={closeActionSheet}
        onConfirm={onActionDelete}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save URL"
        onPress={() => router.push('/save-url')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: c.tint,
            bottom: insets.bottom + 20,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={28} color={c.background} />
      </Pressable>
    </SafeAreaView>
  );
}

function keyExtractor(item: HomeListItem) {
  if (item.type === 'filter') return 'filter';
  if (item.type === 'intro') return 'intro';
  if (item.type === 'article-skeletons') return 'article-skeletons';
  return item.article.articleId;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 8,
  },
  pinnedFilter: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
  },
});
