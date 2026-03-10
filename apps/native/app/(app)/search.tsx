import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchResultRow, SearchResultSkeleton } from '@/features/home/components';
import { useArticleSearch } from '@/hooks/use-article-search';
import { useAppColors, useTheme } from '@/hooks/use-theme';
import { openSafeUrl } from '@/lib/url';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const c = useAppColors();
  const { colorScheme } = useTheme();
  const { articles, isSearching, isAuthenticated, hasSearchQuery } = useArticleSearch(query);
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const enterTranslateY = useRef(new Animated.Value(10)).current;

  const sectionTitle = useMemo(() => (hasSearchQuery ? 'RESULTS' : 'RECENT'), [hasSearchQuery]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(enterTranslateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [enterOpacity, enterTranslateY]);

  const handlePressResult = async (url: string) => {
    await openSafeUrl(url);
    router.back();
  };

  const emptyMessage = isAuthenticated
    ? 'No matching articles.'
    : 'Sign in to search your articles.';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: enterOpacity,
              transform: [{ translateY: enterTranslateY }],
            },
          ]}
        >
          <View style={[styles.searchBar, { borderColor: c.border }]}>
            <Feather name="search" size={18} color={c.subtitle} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Find..."
              placeholderTextColor={c.subtitle}
              style={[styles.input, { color: c.text }]}
              selectionColor={c.text}
              returnKeyType="search"
            />
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={[styles.cancelText, { color: c.text }]}>Cancel</Text>
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.subtitle }]}>{sectionTitle}</Text>
          </View>

          {isSearching ? (
            <SearchResultSkeleton />
          ) : (
            <FlatList
              data={articles}
              keyExtractor={(item) => item.articleId}
              renderItem={({ item }) => (
                <SearchResultRow
                  title={item.title}
                  domain={item.domain}
                  faviconUrl={item.faviconUrl}
                  date={item.date}
                  onPress={() => void handlePressResult(item.url)}
                />
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: c.subtitle }]}>{emptyMessage}</Text>
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </Animated.View>
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
  animatedContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  input: {
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
  sectionHeader: {
    marginTop: 18,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.8,
    fontFamily: 'Geist-Medium',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 24,
    fontFamily: 'Geist',
  },
});
