import {
  convexAction,
  convexQuery,
  useConvexAction,
  useConvexMutation,
} from '@convex-dev/react-query';
import { Feather, Ionicons } from '@expo/vector-icons';
import { api } from '@rlist/api/convex/_generated/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ConvexError } from 'convex/values';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useDebounce } from '@/hooks/use-debounce';
import { authClient } from '@/lib/auth-client';
import { formatRelativeDate } from '@/lib/date';
import { getDomain, isValidUrl } from '@/lib/url';

type TabFilter = 'unread' | 'all' | 'archive';

type ArticlesPage = (typeof api.articles.listUserArticles)['_returnType'];
type ArticleListItem = ArticlesPage['page'][number];

type Banner = {
  type: 'success' | 'error';
  text: string;
};

const FILTERS: { label: string; value: TabFilter }[] = [
  { label: 'Unread', value: 'unread' },
  { label: 'All Items', value: 'all' },
  { label: 'Archive', value: 'archive' },
];

const URL_DEBOUNCE_MS = 500;
const MAX_TAGS = 2;
const TAG_MAX_LENGTH = 15;

export default function HomeScreen() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const [filter, setFilter] = useState<TabFilter>('unread');
  const [urlInput, setUrlInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [actionTarget, setActionTarget] = useState<ArticleListItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const debouncedUrl = useDebounce(urlInput, URL_DEBOUNCE_MS);
  const showMetadataPreview = isValidUrl(urlInput);

  const listQueryOptions = convexQuery(api.articles.listUserArticles, {
    filter,
    paginationOpts: {
      numItems: 40,
      cursor: null,
    },
  });

  const articlesQuery = useQuery({
    ...listQueryOptions,
    enabled: Boolean(session),
  });

  const metadataQuery = useQuery({
    ...convexAction(
      api.articles.fetchMetadata,
      showMetadataPreview ? { url: debouncedUrl || urlInput } : 'skip'
    ),
    retry: false,
  });

  const addArticleMutationFn = useConvexAction(api.articles.addArticle);
  const addArticleMutation = useMutation({
    mutationFn: addArticleMutationFn,
    onSuccess: () => {
      setBanner({ type: 'success', text: 'Article added' });
      setUrlInput('');
      setTags([]);
      setTagInput('');
    },
    onError: (error) => {
      if (
        error instanceof ConvexError &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'code' in error.data &&
        error.data.code === 'ALREADY_SAVED_ARTICLE'
      ) {
        setBanner({ type: 'error', text: 'Article already saved' });
        return;
      }

      setBanner({
        type: 'error',
        text: error instanceof ConvexError ? error.data.message : 'Failed to add article',
      });
    },
  });

  const toggleReadMutationFn = useConvexMutation(api.articles.toggleReadStatus);
  const toggleArchiveMutationFn = useConvexMutation(api.articles.toggleArchiveStatus);
  const deleteMutationFn = useConvexMutation(api.articles.deleteArticle);

  const toggleReadMutation = useMutation({
    mutationFn: toggleReadMutationFn,
    onSuccess: () => {
      setBanner({
        type: 'success',
        text: actionTarget?.isRead ? 'Marked as unread' : 'Marked as read',
      });
    },
    onError: () => {
      setBanner({ type: 'error', text: 'Failed to update read status' });
    },
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: toggleArchiveMutationFn,
    onSuccess: () => {
      setBanner({
        type: 'success',
        text: actionTarget?.isArchived ? 'Unarchived' : 'Archived',
      });
    },
    onError: () => {
      setBanner({ type: 'error', text: 'Failed to update archive status' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMutationFn,
    onSuccess: () => {
      setBanner({ type: 'success', text: 'Article deleted' });
    },
    onError: () => {
      setBanner({ type: 'error', text: 'Failed to delete article' });
    },
  });

  const articles = useMemo(() => articlesQuery.data?.page ?? [], [articlesQuery.data?.page]);

  const isMutating =
    addArticleMutation.isPending ||
    toggleReadMutation.isPending ||
    toggleArchiveMutation.isPending ||
    deleteMutation.isPending;

  const addTag = () => {
    const normalized = tagInput.trim().toUpperCase();
    if (!normalized || normalized.length > TAG_MAX_LENGTH) {
      return;
    }

    if (tags.length >= MAX_TAGS || tags.includes(normalized)) {
      return;
    }

    setTags([...tags, normalized]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((value) => value !== tag));
  };

  const handleAddArticle = () => {
    if (!isValidUrl(urlInput) || addArticleMutation.isPending) {
      return;
    }

    setBanner(null);
    addArticleMutation.mutate({
      url: debouncedUrl || urlInput,
      tags,
    });
  };

  const handleOpenArticle = (url: string) => {
    void Linking.openURL(url);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace('/login' as never);
  };

  const closeActionSheet = () => {
    setActionTarget(null);
    setShowDeleteConfirm(false);
  };

  const onActionToggleRead = () => {
    if (!actionTarget) {
      return;
    }

    toggleReadMutation.mutate(
      { articleId: actionTarget.articleId },
      {
        onSettled: closeActionSheet,
      }
    );
  };

  const onActionToggleArchive = () => {
    if (!actionTarget) {
      return;
    }

    toggleArchiveMutation.mutate(
      { articleId: actionTarget.articleId },
      {
        onSettled: closeActionSheet,
      }
    );
  };

  const onActionDelete = () => {
    if (!actionTarget) {
      return;
    }

    deleteMutation.mutate(
      { articleId: actionTarget.articleId },
      {
        onSettled: closeActionSheet,
      }
    );
  };

  if (isSessionPending) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="small" color="#f9fafb" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <Redirect href={'/login' as never} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <Feather name="folder" size={18} color="#f8fafc" />
            <Text style={styles.brandText}>rlist</Text>
          </View>
          <Pressable style={styles.avatarButton} onPress={handleSignOut}>
            <Text style={styles.avatarButtonText}>{session.user.name?.slice(0, 1) ?? 'U'}</Text>
          </Pressable>
        </View>

        <View style={styles.primaryNav}>
          <Text style={styles.primaryNavActive}>Dashboard</Text>
          <Text style={styles.primaryNavMuted}>Discover</Text>
          <Text style={styles.primaryNavMuted}>Analytics</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((item) => (
            <Pressable key={item.value} onPress={() => setFilter(item.value)}>
              <Text style={filter === item.value ? styles.filterActive : styles.filterMuted}>
                {item.label}
              </Text>
              {filter === item.value ? <View style={styles.filterIndicator} /> : null}
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        <Text style={styles.title}>Your Articles</Text>

        <View style={styles.urlInputWrap}>
          <Feather name="link" size={15} color="#64748b" />
          <TextInput
            value={urlInput}
            onChangeText={setUrlInput}
            style={styles.urlInput}
            placeholder="Paste a URL to save..."
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={[
              styles.addButton,
              addArticleMutation.isPending ? styles.addButtonDisabled : null,
            ]}
            onPress={handleAddArticle}
            disabled={addArticleMutation.isPending}
          >
            <Text style={styles.addButtonText}>
              {addArticleMutation.isPending ? 'Adding' : 'Add'}
            </Text>
          </Pressable>
        </View>

        {showMetadataPreview ? (
          <View style={styles.metadataCard}>
            <Text style={styles.metadataDomain}>
              {metadataQuery.data?.domain ?? getDomain(urlInput)}
            </Text>
            {metadataQuery.isPending ? (
              <Text style={styles.metadataTitle}>Fetching metadata...</Text>
            ) : (
              <>
                <Text style={styles.metadataTitle}>
                  {metadataQuery.data?.title ?? getDomain(urlInput)}
                </Text>
                {metadataQuery.data?.description ? (
                  <Text style={styles.metadataDescription} numberOfLines={2}>
                    {metadataQuery.data.description}
                  </Text>
                ) : null}
              </>
            )}

            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <Pressable key={tag} style={styles.tagChip} onPress={() => removeTag(tag)}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                  <Ionicons name="close" size={12} color="#cbd5e1" />
                </Pressable>
              ))}

              {tags.length < MAX_TAGS ? (
                <View style={styles.tagInputRow}>
                  <TextInput
                    value={tagInput}
                    onChangeText={setTagInput}
                    style={styles.tagInput}
                    placeholder="Tag"
                    placeholderTextColor="#64748b"
                    autoCapitalize="characters"
                    maxLength={TAG_MAX_LENGTH}
                  />
                  <Pressable style={styles.tagAddButton} onPress={addTag}>
                    <Text style={styles.tagAddButtonText}>Add</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {banner ? (
          <View
            style={[
              styles.banner,
              banner.type === 'error' ? styles.bannerError : styles.bannerSuccess,
            ]}
          >
            <Text style={styles.bannerText}>{banner.text}</Text>
          </View>
        ) : null}

        {articlesQuery.isPending ? (
          <View style={styles.loadingList}>
            <ActivityIndicator size="small" color="#e2e8f0" />
          </View>
        ) : null}

        {!articlesQuery.isPending && articles.length === 0 ? (
          <Text style={styles.emptyText}>No articles in this view yet.</Text>
        ) : null}

        {articles.map((article) => (
          <Pressable
            key={article.articleId}
            style={styles.articleCard}
            onPress={() => handleOpenArticle(article.url)}
          >
            <View style={styles.articleHeader}>
              <View style={styles.articleSiteRow}>
                <View style={styles.faviconFallback}>
                  <Text style={styles.faviconFallbackText}>
                    {article.domain.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.articleDomain}>{article.domain}</Text>
              </View>

              <View style={styles.articleMetaRow}>
                {article.tags.map((tag) => (
                  <View key={tag} style={styles.articleTagChip}>
                    <Text style={styles.articleTagChipText}>{tag}</Text>
                  </View>
                ))}
                <Text style={styles.articleAge}>{formatRelativeDate(article._creationTime)}</Text>
                <Pressable onPress={() => setActionTarget(article)} hitSlop={8}>
                  <Ionicons name="ellipsis-horizontal" size={14} color="#94a3b8" />
                </Pressable>
              </View>
            </View>

            <Text style={styles.articleTitle} numberOfLines={2}>
              {article.title ?? article.domain}
            </Text>
            {article.description ? (
              <Text style={styles.articleDescription} numberOfLines={2}>
                {article.description}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>

      <Modal
        visible={Boolean(actionTarget)}
        transparent
        animationType="fade"
        onRequestClose={closeActionSheet}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeActionSheet}>
          <Pressable style={styles.actionSheet} onPress={(event) => event.stopPropagation()}>
            <Pressable style={styles.actionItem} onPress={onActionToggleRead} disabled={isMutating}>
              <Text style={styles.actionText}>
                {actionTarget?.isRead ? 'Mark as unread' : 'Mark as read'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.actionItem}
              onPress={onActionToggleArchive}
              disabled={isMutating}
            >
              <Text style={styles.actionText}>
                {actionTarget?.isArchived ? 'Unarchive' : 'Archive'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionItem, styles.actionItemDanger]}
              onPress={() => setShowDeleteConfirm(true)}
              disabled={isMutating}
            >
              <Text style={styles.actionTextDanger}>Delete</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={closeActionSheet}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeActionSheet}>
          <Pressable style={styles.confirmDialog} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.confirmTitle}>Delete article</Text>
            <Text style={styles.confirmDescription}>
              This will remove the article from your list permanently.
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable style={styles.confirmCancelButton} onPress={closeActionSheet}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmDeleteButton} onPress={onActionDelete}>
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030712',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030712',
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
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '700',
  },
  avatarButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
  },
  avatarButtonText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 12,
  },
  primaryNavActive: {
    color: '#f8fafc',
    fontSize: 21,
    fontWeight: '600',
  },
  primaryNavMuted: {
    color: '#64748b',
    fontSize: 21,
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1e293b',
  },
  filterRow: {
    gap: 18,
    paddingTop: 14,
  },
  filterActive: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  filterMuted: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '600',
  },
  filterIndicator: {
    marginTop: 8,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#f8fafc',
  },
  title: {
    marginTop: 22,
    marginBottom: 16,
    color: '#f8fafc',
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '800',
  },
  urlInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    backgroundColor: '#020617',
    paddingLeft: 12,
    paddingRight: 8,
    height: 48,
    gap: 8,
  },
  urlInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
    paddingVertical: 0,
  },
  addButton: {
    height: 32,
    minWidth: 56,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
  },
  metadataCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    backgroundColor: '#020617',
    padding: 12,
    gap: 6,
  },
  metadataDomain: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  metadataTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
  },
  metadataDescription: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagChipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagInput: {
    width: 96,
    height: 30,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 8,
    color: '#e2e8f0',
    fontSize: 12,
  },
  tagAddButton: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagAddButtonText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  banner: {
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bannerSuccess: {
    backgroundColor: '#052e16',
  },
  bannerError: {
    backgroundColor: '#450a0a',
  },
  bannerText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingList: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 18,
    color: '#64748b',
    fontSize: 15,
  },
  articleCard: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 12,
    gap: 6,
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
  },
  faviconFallback: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faviconFallbackText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  articleDomain: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  articleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  articleTagChip: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  articleTagChipText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  articleAge: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  articleTitle: {
    color: '#f8fafc',
    fontSize: 33,
    lineHeight: 38,
    fontWeight: '700',
  },
  articleDescription: {
    color: '#94a3b8',
    fontSize: 16,
    lineHeight: 22,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  actionSheet: {
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  actionItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#334155',
  },
  actionItemDanger: {
    borderBottomWidth: 0,
  },
  actionText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  actionTextDanger: {
    color: '#fca5a5',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDialog: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    gap: 10,
  },
  confirmTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  confirmDescription: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
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
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmCancelText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    height: 34,
    borderRadius: 8,
    backgroundColor: '#7f1d1d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmDeleteText: {
    color: '#fee2e2',
    fontSize: 14,
    fontWeight: '700',
  },
});
