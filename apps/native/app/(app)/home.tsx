import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LogoDark from '@/assets/images/logo-dark.svg';
import LogoLight from '@/assets/images/logo-light.svg';
import { Colors } from '@/constants/theme';
import { useLocalHomeFeed } from '@/hooks/use-local-home-feed';
import type { DisplayArticle, TabFilter } from '@/hooks/use-local-home-feed';
import { useTheme } from '@/hooks/use-theme';
import { authClient } from '@/lib/auth-client';
import { formatRelativeDate } from '@/lib/date';

const FILTERS: { label: string; value: TabFilter }[] = [
  { label: 'Unread', value: 'unread' },
  { label: 'All Items', value: 'all' },
  { label: 'Archive', value: 'archive' },
];

const TAB_HEADINGS: Record<TabFilter, string> = {
  unread: 'Your Articles',
  all: 'All Articles',
  archive: 'Archived Articles',
};
const ARTICLE_SEPARATOR_DASH_KEYS: string[] = Array.from(
  { length: 36 },
  (_, index) => `dash-${index}`
);

type HomeListItem =
  | { type: 'filter' }
  | { type: 'intro' }
  | { type: 'article'; article: DisplayArticle };

export default function HomeScreen() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { colorScheme } = useTheme();
  const c = Colors[colorScheme];

  const [filter, setFilter] = useState<TabFilter>('unread');
  const [actionTarget, setActionTarget] = useState<DisplayArticle | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userId = session?.user?.id;

  const { articles, status, loadMore, toggleRead, toggleArchive, deleteArticle, refresh } =
    useLocalHomeFeed(userId, filter);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace('/login' as never);
  };

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

  const renderArticle = useCallback(
    ({ item }: { item: DisplayArticle }) => {
      const primaryTag = item.tags[0] ?? 'tags';

      return (
        <View style={styles.articleItem}>
          <Pressable style={styles.articleCard} onPress={() => Linking.openURL(item.url)}>
            <View style={styles.articleHeader}>
              <View style={styles.articleSiteRow}>
                <View style={[styles.faviconContainer, { backgroundColor: c.border }]}>
                  <Text style={[styles.faviconFallbackText, { color: c.subtitle }]}>
                    {item.domain.charAt(0).toUpperCase()}
                  </Text>
                  <Image
                    source={{ uri: item.faviconUrl }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="contain"
                  />
                </View>
                <Text style={[styles.articleDomain, { color: c.subtitle }]} numberOfLines={1}>
                  {item.domain}
                </Text>
              </View>
              <View style={styles.articleTopRight}>
                <Text style={[styles.articleAge, { color: c.subtitle }]}>
                  {formatRelativeDate(item.creationTime)}
                </Text>
                <Pressable onPress={() => setActionTarget(item)} hitSlop={8}>
                  <Ionicons name="ellipsis-horizontal" size={16} color={c.subtitle} />
                </Pressable>
              </View>
            </View>

            <Text style={[styles.articleTitle, { color: c.text }]} numberOfLines={2}>
              {item.title ?? item.domain}
            </Text>
            {item.description ? (
              <Text style={[styles.articleDescription, { color: c.subtitle }]} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.articleMetaRow}>
              <View style={[styles.articleTagChip, { borderColor: c.border }]}>
                <Text style={[styles.articleTagChipText, { color: c.text }]}>
                  {primaryTag.toUpperCase()}
                </Text>
                <Feather name="x" size={14} color={c.subtitle} />
              </View>
              <Text style={[styles.addTagText, { color: c.subtitle }]}>Add tag...</Text>
            </View>
          </Pressable>
          <View style={styles.articleSeparator}>
            {ARTICLE_SEPARATOR_DASH_KEYS.map((dashKey) => (
              <View
                key={dashKey}
                style={[styles.articleSeparatorDash, { backgroundColor: c.border }]}
              />
            ))}
          </View>
        </View>
      );
    },
    [c]
  );

  const renderTopHeader = () => (
    <View>
      {/* Top bar */}
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          {colorScheme === 'dark' ? (
            <LogoDark width={22} height={22} />
          ) : (
            <LogoLight width={22} height={22} />
          )}
          <Text style={[styles.brandText, { color: c.text }]}>rlist</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable hitSlop={8}>
            <Feather name="search" size={18} color={c.subtitle} />
          </Pressable>
          <Pressable
            style={[styles.avatarButton, { backgroundColor: c.subtitle }]}
            onPress={handleSignOut}
          >
            <Text style={[styles.avatarButtonText, { color: c.background }]}>
              {session?.user.name?.charAt(0).toUpperCase() ?? 'U'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* <View style={[styles.divider, { backgroundColor: c.border }]} /> */}
    </View>
  );

  const renderListItem = useCallback(
    ({ item }: { item: HomeListItem }) => {
      if (item.type === 'filter') {
        return (
          <View style={[styles.filterStickyWrapper, { backgroundColor: c.background }]}>
            <View style={styles.filterRowOuter}>
              <View style={styles.filterTabs}>
                {FILTERS.map((filterItem) => (
                  <Pressable key={filterItem.value} onPress={() => setFilter(filterItem.value)}>
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
                <Pressable style={styles.tagsDropdown}>
                  <Text style={[styles.filterMuted, { color: c.subtitle }]}>Tags</Text>
                  <Feather name="chevron-down" size={14} color={c.subtitle} />
                </Pressable>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
          </View>
        );
      }

      if (item.type === 'intro') {
        return (
          <View>
            {/* Section heading */}
            <Text style={[styles.title, { color: c.text }]}>{TAB_HEADINGS[filter]}</Text>

            {/* URL input placeholder (phase 2) */}
            <View style={[styles.urlInputWrap, { borderColor: c.border }]}>
              <Feather name="link" size={15} color={c.subtitle} />
              <Text style={[styles.urlPlaceholder, { color: c.subtitle }]}>
                Paste a URL to save...
              </Text>
            </View>

            {articles.length === 0 &&
            (status === 'LoadingFirstPage' || status === 'LoadingMore') ? (
              <View style={styles.loadingList}>
                <ActivityIndicator size="small" color={c.subtitle} />
              </View>
            ) : null}
            {articles.length === 0 && status !== 'LoadingFirstPage' && status !== 'LoadingMore' ? (
              <Text style={[styles.emptyText, { color: c.subtitle }]}>
                No articles in this view yet.
              </Text>
            ) : null}
          </View>
        );
      }

      return renderArticle({ item: item.article });
    },
    [articles.length, c.background, c.border, c.subtitle, c.text, filter, renderArticle, status]
  );

  const renderFooter = () => {
    if (status === 'LoadingMore') {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={c.subtitle} />
        </View>
      );
    }
    return null;
  };

  if (isSessionPending) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: c.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="small" color={c.text} />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <Redirect href={'/login' as never} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <FlatList<HomeListItem>
        data={listData}
        renderItem={renderListItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderTopHeader}
        ListFooterComponent={renderFooter}
        stickyHeaderIndices={[1]}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Action sheet */}
      <Modal
        visible={Boolean(actionTarget)}
        transparent
        animationType="fade"
        onRequestClose={closeActionSheet}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeActionSheet}>
          <Pressable
            style={[styles.actionSheet, { backgroundColor: c.background, borderColor: c.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Pressable
              style={[styles.actionItem, { borderBottomColor: c.border }]}
              onPress={onActionToggleRead}
            >
              <Text style={[styles.actionText, { color: c.text }]}>
                {actionTarget?.isRead ? 'Mark as unread' : 'Mark as read'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionItem, { borderBottomColor: c.border }]}
              onPress={onActionToggleArchive}
            >
              <Text style={[styles.actionText, { color: c.text }]}>
                {actionTarget?.isArchived ? 'Unarchive' : 'Archive'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionItem, styles.actionItemDanger]}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Text style={[styles.actionText, { color: c.error }]}>Delete</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={closeActionSheet}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeActionSheet}>
          <Pressable
            style={[styles.confirmDialog, { backgroundColor: c.background, borderColor: c.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.confirmTitle, { color: c.text }]}>Delete article</Text>
            <Text style={[styles.confirmDescription, { color: c.subtitle }]}>
              This will remove the article from your list permanently.
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                style={[styles.confirmCancelButton, { borderColor: c.border }]}
                onPress={closeActionSheet}
              >
                <Text style={[styles.confirmCancelText, { color: c.subtitle }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmDeleteButton, { backgroundColor: c.error }]}
                onPress={onActionDelete}
              >
                <Text style={[styles.confirmDeleteText, { color: '#ffffff' }]}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButtonText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  filterStickyWrapper: {
    // paddingHorizontal: 16,
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
    // paddingBottom: 10,
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
  title: {
    marginTop: 22,
    marginBottom: 16,
    fontSize: 34,
    lineHeight: 40,
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
  },
  faviconContainer: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  faviconFallbackText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  articleDomain: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
    fontFamily: 'Geist-Medium',
  },
  articleTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
  },
  articleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  articleTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  articleTagChipText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  addTagText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Geist',
  },
  articleAge: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Geist-Medium',
  },
  articleTitle: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  articleDescription: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Geist',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  actionSheet: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionItemDanger: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Geist-SemiBold',
  },
  confirmDialog: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  confirmDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Geist',
  },
  confirmButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  confirmCancelButton: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Geist-SemiBold',
  },
  confirmDeleteButton: {
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
});
