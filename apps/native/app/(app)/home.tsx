import { convexQuery } from '@convex-dev/react-query';
import { useIsFocused } from '@react-navigation/native';
import { api } from '@rlist/api/convex/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ArticleActionsSheet,
  ArticleCard,
  DeleteArticleDialog,
  HomeFilterTabs,
  HomeHeader,
  HomeIntroSection,
} from '@/features/home/components';
import type { DisplayArticle, TabFilter } from '@/features/home/home-feed.types';
import { useLocalHomeFeed } from '@/hooks/use-local-home-feed';
import { useAppColors, useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import { signOutAndClear } from '@/lib/sign-out';
import { normalizeTags } from '@/lib/tags';

type HomeListItem =
  | { type: 'filter' }
  | { type: 'intro' }
  | { type: 'article'; article: DisplayArticle };

export default function HomeScreen() {
  const router = useRouter();
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

  const handleSignOut = useCallback(async () => {
    if (!userId) return;
    await signOutAndClear(userId);
  }, [userId]);

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

  const listData = useMemo<HomeListItem[]>(
    () => [
      { type: 'filter' as const },
      { type: 'intro' as const },
      ...articles.map((article): HomeListItem => ({ type: 'article', article })),
    ],
    [articles]
  );

  const renderListItem = useCallback(
    ({ item }: { item: HomeListItem }) => {
      if (item.type === 'filter') {
        return (
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
        );
      }

      if (item.type === 'intro') {
        return (
          <HomeIntroSection
            filter={filter}
            status={status}
            articleCount={articles.length}
            onPressSaveUrl={() => router.push('/save-url')}
          />
        );
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
    [
      articles.length,
      availableTags,
      filter,
      handleClearTags,
      handleFilterChange,
      handleToggleTag,
      handleToggleTagPanel,
      isTagPanelOpen,
      router,
      selectedTags,
      status,
      updateTags,
    ]
  );

  const renderHeader = useCallback(
    () => (
      <HomeHeader
        userName={session?.user?.name}
        onSignOut={handleSignOut}
        onPressSearch={() => router.push('/search')}
      />
    ),
    [session?.user?.name, handleSignOut, router]
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
          stickyHeaderIndices={[1]}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
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
    </SafeAreaView>
  );
}

function keyExtractor(item: HomeListItem) {
  if (item.type === 'filter') return 'filter';
  if (item.type === 'intro') return 'intro';
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
    paddingBottom: 40,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
