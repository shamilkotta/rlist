import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DisplayArticle } from '@/features/home/home-feed.types';
import { useAppColors } from '@/hooks/use-theme';
import { formatRelativeDate } from '@/lib/date';
import { openSafeUrl } from '@/lib/url';

import { TagEditor } from './tag-editor';

const ARTICLE_SEPARATOR_DASH_KEYS: string[] = Array.from(
  { length: 36 },
  (_, index) => `dash-${index}`
);

type ArticleCardProps = {
  article: DisplayArticle;
  onOpenActions: (article: DisplayArticle) => void;
  onUpdateTags: (articleId: string, tags: string[]) => void;
};

export function ArticleCard({ article, onOpenActions, onUpdateTags }: ArticleCardProps) {
  const c = useAppColors();

  return (
    <View style={styles.articleItem}>
      <View style={styles.articleCard}>
        <Pressable onPress={() => void openSafeUrl(article.url)}>
          <View style={styles.articleContent}>
            <View style={styles.articleHeader}>
              <View style={styles.articleSiteRow}>
                <View style={[styles.faviconContainer, { backgroundColor: c.border }]}>
                  <Text style={[styles.faviconFallbackText, { color: c.subtitle }]}>
                    {article.domain.charAt(0).toUpperCase()}
                  </Text>
                  <Image
                    source={{ uri: article.faviconUrl }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="contain"
                  />
                </View>
                <Text style={[styles.articleDomain, { color: c.subtitle }]} numberOfLines={1}>
                  {article.domain}
                </Text>
              </View>
              <View style={styles.articleTopRight}>
                <Text style={[styles.articleAge, { color: c.subtitle }]}>
                  {formatRelativeDate(article.creationTime)}
                </Text>
                <Pressable onPress={() => onOpenActions(article)} hitSlop={8}>
                  <Ionicons name="ellipsis-horizontal" size={16} color={c.subtitle} />
                </Pressable>
              </View>
            </View>

            <Text style={[styles.articleTitle, { color: c.text }]} numberOfLines={2}>
              {article.title ?? article.domain}
            </Text>
            {article.description ? (
              <Text style={[styles.articleDescription, { color: c.subtitle }]} numberOfLines={2}>
                {article.description}
              </Text>
            ) : null}
          </View>
        </Pressable>
        <View style={styles.articleMetaRow}>
          <TagEditor
            articleId={article.articleId}
            initialTags={article.tags}
            onUpdateTags={onUpdateTags}
          />
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
  );
}

const styles = StyleSheet.create({
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
  articleAge: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Geist-Medium',
  },
  articleTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
  articleDescription: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Geist',
  },
});
