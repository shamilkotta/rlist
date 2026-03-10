import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
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

type HomeListItem =
  | { type: 'filter' }
  | { type: 'intro' }
  | { type: 'article'; article: DisplayArticle };

export default function HomeScreen() {
  const { data: session } = authClient.useSession();
  const { colorScheme } = useTheme();
  const c = useAppColors();

  const [filter, setFilter] = useState<TabFilter>('unread');
  const [actionTarget, setActionTarget] = useState<DisplayArticle | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userId = session?.user?.id;

  const { articles, status, loadMore, toggleRead, toggleArchive, deleteArticle, refresh } =
    useLocalHomeFeed(userId, filter);

  const handleSignOut = useCallback(async () => {
    if (!userId) return;
    await signOutAndClear(userId);
  }, [userId]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 1500);
  }, [refresh]);

  const closeActionSheet = () => {
    setActionTarget(null);
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

  const onActionDelete = () => {
    if (!actionTarget) return;
    void deleteArticle(actionTarget.articleId);
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
        return <HomeFilterTabs filter={filter} onFilterChange={setFilter} />;
      }

      if (item.type === 'intro') {
        return <HomeIntroSection filter={filter} status={status} articleCount={articles.length} />;
      }

      return <ArticleCard article={item.article} onOpenActions={setActionTarget} />;
    },
    [articles.length, filter, status]
  );

  const renderHeader = useCallback(
    () => <HomeHeader userName={session?.user?.name} onSignOut={handleSignOut} />,
    [session?.user?.name, handleSignOut]
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

      <FlatList<HomeListItem>
        data={listData}
        renderItem={renderListItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        stickyHeaderIndices={[1]}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <ArticleActionsSheet
        article={actionTarget}
        onClose={closeActionSheet}
        onToggleRead={onActionToggleRead}
        onToggleArchive={onActionToggleArchive}
        onDelete={() => setShowDeleteConfirm(true)}
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
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 40,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
