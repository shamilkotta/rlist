import { convexAction, useConvexAction } from '@convex-dev/react-query';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ConvexError } from 'convex/values';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDebounce } from '@/hooks/use-debounce';
import { useAppColors, useTheme } from '@/hooks/use-theme';
import { queryClient } from '@/lib/convex';
import { getDomain, validateArticleUrl } from '@/lib/url';
import { api } from '@rlist/api/convex/_generated/api';

const MAX_TAGS = 2;
const TAG_MAX_LENGTH = 15;
const URL_DEBOUNCE_MS = 500;

function normalizeTag(value: string): string {
  return value.trim().toUpperCase();
}

export default function SaveUrlScreen() {
  const { back } = useRouter();
  const { sharedUrl } = useLocalSearchParams<{ sharedUrl?: string }>();
  const c = useAppColors();
  const { colorScheme } = useTheme();
  const urlInputRef = useRef<TextInput>(null);
  const [urlInput, setUrlInput] = useState(sharedUrl ?? '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (sharedUrl) {
      setUrlInput(sharedUrl);
    }
  }, [sharedUrl]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      urlInputRef.current?.focus();
    });

    return () => task.cancel();
  }, []);

  const normalizedUrlInput = useMemo(() => validateArticleUrl(urlInput), [urlInput]);
  const showUrlPreview = normalizedUrlInput !== null;
  const debouncedUrl = useDebounce(urlInput, URL_DEBOUNCE_MS);
  const normalizedDebouncedUrl = useMemo(() => validateArticleUrl(debouncedUrl), [debouncedUrl]);
  const shouldFetch = normalizedDebouncedUrl !== null;

  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    isError,
  } = useQuery({
    ...convexAction(
      api.articles.fetchMetadata,
      shouldFetch ? { url: normalizedDebouncedUrl } : 'skip'
    ),
    retry: false,
  });

  const addArticle = useConvexAction(api.articles.addArticle);
  const addArticleMutation = useMutation({
    mutationFn: addArticle,
  });

  const handleUrlInputChange = useCallback((value: string) => {
    setSubmitError(null);
    setUrlInput(value);
  }, []);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  const commitTagInput = useCallback(() => {
    const newTag = normalizeTag(tagInput);
    if (!newTag || tags.length >= MAX_TAGS || tags.includes(newTag)) {
      return;
    }
    setTags((prev) => [...prev, newTag]);
    setTagInput('');
  }, [tagInput, tags]);

  const handleTagInputChange = useCallback(
    (value: string) => {
      if (value.includes(',')) {
        const candidate = normalizeTag(value.split(',')[0] ?? '');
        if (candidate && tags.length < MAX_TAGS && !tags.includes(candidate)) {
          setTags((prev) => [...prev, candidate]);
        }
        setTagInput('');
        return;
      }
      if (value.length <= TAG_MAX_LENGTH) {
        setTagInput(value);
      }
    },
    [tags]
  );

  const resetState = useCallback(() => {
    setUrlInput('');
    setTags([]);
    setTagInput('');
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitError(null);
    const urlToSubmit = debouncedUrl || urlInput;
    const validated = validateArticleUrl(urlToSubmit);
    if (!validated) {
      setSubmitError('Invalid URL');
      return;
    }

    addArticleMutation.mutate(
      { url: validated, tags },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries();
          resetState();
          back();
        },
        onError: (error) => {
          if (
            error instanceof ConvexError &&
            typeof error.data === 'object' &&
            error.data &&
            'code' in error.data &&
            error.data.code === 'ALREADY_SAVED_ARTICLE'
          ) {
            setSubmitError('Article already saved');
            return;
          }

          if (
            error instanceof ConvexError &&
            typeof error.data === 'object' &&
            error.data &&
            'message' in error.data &&
            typeof error.data.message === 'string'
          ) {
            setSubmitError(error.data.message);
            return;
          }

          setSubmitError('Failed to add article');
        },
      }
    );
  }, [addArticleMutation, back, debouncedUrl, resetState, tags, urlInput]);

  const hasMetadataError = showUrlPreview && isError && !metadata;
  const domainFallback = useMemo(() => getDomain(urlInput), [urlInput]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={[styles.inputRow, { borderColor: c.border }]}>
            <Feather name="link" size={18} color={c.subtitle} />
            <TextInput
              ref={urlInputRef}
              value={urlInput}
              onChangeText={handleUrlInputChange}
              placeholder="Paste a URL to save..."
              placeholderTextColor={c.subtitle}
              style={[styles.urlInput, { color: c.text }]}
              selectionColor={c.text}
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onSubmitEditing={handleSubmit}
            />
            <Pressable onPress={back} hitSlop={8}>
              <Text style={[styles.cancelText, { color: c.text }]}>Cancel</Text>
            </Pressable>
          </View>

          {submitError ? (
            <Text style={[styles.errorText, { color: '#dc2626' }]}>{submitError}</Text>
          ) : null}

          {showUrlPreview ? (
            <View style={styles.previewSection}>
              <View style={styles.previewBody}>
                <View style={styles.domainRow}>
                  <View style={[styles.faviconContainer, { backgroundColor: c.border }]}>
                    <Text style={[styles.faviconFallbackText, { color: c.subtitle }]}>
                      {(metadata?.domain ?? domainFallback).charAt(0).toUpperCase() || '?'}
                    </Text>
                    {metadata?.faviconUrl ? (
                      <Image
                        source={{ uri: metadata.faviconUrl }}
                        style={StyleSheet.absoluteFillObject}
                        contentFit="contain"
                      />
                    ) : null}
                  </View>
                  <Text style={[styles.domainText, { color: c.subtitle }]} numberOfLines={1}>
                    {metadata?.domain ?? domainFallback}
                  </Text>
                </View>

                {isLoadingMetadata ? (
                  <View style={styles.skeletonBlock}>
                    <View style={[styles.skeletonTitle, { backgroundColor: c.border }]} />
                    <View style={[styles.skeletonLine, { backgroundColor: c.border }]} />
                    <View style={[styles.skeletonLineShort, { backgroundColor: c.border }]} />
                  </View>
                ) : hasMetadataError ? (
                  <Text
                    style={[styles.previewDescription, { color: c.subtitle }]}
                    numberOfLines={2}
                  >
                    Could not load preview metadata. You can still save this URL.
                  </Text>
                ) : (
                  <>
                    <Text style={[styles.previewTitle, { color: c.text }]} numberOfLines={2}>
                      {metadata?.title ?? domainFallback}
                    </Text>
                    {metadata?.description ? (
                      <Text
                        style={[styles.previewDescription, { color: c.subtitle }]}
                        numberOfLines={2}
                      >
                        {metadata.description}
                      </Text>
                    ) : null}
                  </>
                )}
              </View>

              <View style={[styles.tagsFooter, { borderTopColor: c.border }]}>
                {tags.map((tag) => (
                  <Pressable
                    key={tag}
                    style={[styles.tagChip, { borderColor: c.border }]}
                    onPress={() => removeTag(tag)}
                  >
                    <Text style={[styles.tagText, { color: c.text }]}>{tag}</Text>
                    <Feather name="x" size={12} color={c.subtitle} />
                  </Pressable>
                ))}
                {tags.length < MAX_TAGS ? (
                  <TextInput
                    value={tagInput}
                    onChangeText={handleTagInputChange}
                    placeholder={tags.length === 0 ? 'Add tags (e.g. DESIGN)...' : 'Add tag...'}
                    placeholderTextColor={c.subtitle}
                    style={[styles.tagInput, { color: c.text }]}
                    onSubmitEditing={commitTagInput}
                    onKeyPress={(event) => {
                      if (event.nativeEvent.key === 'Backspace' && !tagInput && tags.length > 0) {
                        setTags((prev) => prev.slice(0, -1));
                      }
                    }}
                    returnKeyType="done"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={TAG_MAX_LENGTH}
                    blurOnSubmit={false}
                  />
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomActions}>
          <Pressable
            onPress={handleSubmit}
            style={[
              styles.addButton,
              {
                backgroundColor: c.text,
                opacity: addArticleMutation.isPending ? 0.6 : 1,
              },
            ]}
            disabled={addArticleMutation.isPending}
          >
            <View style={styles.addButtonContent}>
              {/* <Feather name="bookmark" size={18} color={c.background} /> */}
              <Text style={[styles.addButtonText, { color: c.background }]}>
                {addArticleMutation.isPending ? 'Saving...' : 'Save Article'}
              </Text>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    paddingHorizontal: 12,
  },
  container: {
    flex: 1,
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
  },
  urlInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Geist',
    paddingVertical: 0,
  },
  cancelText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Geist',
  },
  bottomActions: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  addButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    fontSize: 17,
    fontFamily: 'Geist-SemiBold',
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Geist-Medium',
  },
  previewSection: {
    marginTop: 14,
  },
  previewBody: {
    paddingHorizontal: 2,
    paddingBottom: 12,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
    fontFamily: 'Geist-Bold',
  },
  domainText: {
    fontSize: 14,
    fontFamily: 'Geist-Medium',
    flexShrink: 1,
  },
  skeletonBlock: {
    gap: 6,
    marginTop: 2,
  },
  skeletonTitle: {
    height: 20,
    borderRadius: 6,
    width: '75%',
  },
  skeletonLine: {
    height: 14,
    borderRadius: 6,
    width: '100%',
  },
  skeletonLineShort: {
    height: 14,
    borderRadius: 6,
    width: '65%',
  },
  previewTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: 'Geist-Bold',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Geist',
  },
  tagsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    paddingHorizontal: 2,
    paddingTop: 10,
    paddingBottom: 4,
    minHeight: 48,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Geist-Bold',
  },
  tagInput: {
    minWidth: 120,
    flexGrow: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Geist',
    paddingVertical: 2,
  },
});
