import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

type Article = {
  id: string;
  site: string;
  title: string;
  description: string;
  age: string;
  tags?: string[];
};

const ARTICLES: Article[] = [
  {
    id: '1',
    site: 'harpers.org',
    title: "Child's Play, by Sam Kriss",
    description: "Tech's new generation and the end of thinking",
    age: '3d ago',
    tags: ['TEST'],
  },
  {
    id: '2',
    site: 'steipete.me',
    title: 'Posts | Peter Steinberger',
    description:
      'Archive of all blog posts by Peter Steinberger. iOS, Swift, web development, and open source insights.',
    age: '4d ago',
  },
  {
    id: '3',
    site: 'steipete.me',
    title: 'OpenClaw, OpenAI and the future | Peter Steinberger',
    description: '',
    age: '6d ago',
    tags: ['SHA', 'KOTTA'],
  },
  {
    id: '4',
    site: 'vercel.com',
    title: 'How Fluid compute works on Vercel',
    description:
      'See how Fluid combines server efficiency and serverless flexibility by reusing compute before...',
    age: '1w ago',
  },
];

const palette = {
  light: {
    page: '#F5F7FB',
    panel: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E3E7EF',
    text: '#0F172A',
    muted: '#64748B',
    subtle: '#94A3B8',
    chipBg: '#EEF2FF',
    chipText: '#3730A3',
    inputBg: '#FFFFFF',
    inputPlaceholder: '#94A3B8',
    active: '#111827',
  },
  dark: {
    page: '#05070B',
    panel: '#080B10',
    card: '#0B0F16',
    border: '#1E293B',
    text: '#E2E8F0',
    muted: '#94A3B8',
    subtle: '#64748B',
    chipBg: '#111827',
    chipText: '#E5E7EB',
    inputBg: '#05070B',
    inputPlaceholder: '#475569',
    active: '#F8FAFC',
  },
};

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = palette[colorScheme];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.page }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.container, { backgroundColor: colors.page }]}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <Feather name="folder" size={18} color={colors.text} />
            <Text style={[styles.brandText, { color: colors.text }]}>rlist</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity accessibilityRole="button" style={styles.iconButton}>
              <Ionicons name="search" size={18} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.avatarButton}>
              <Text style={[styles.avatarText, { color: colors.text }]}>S</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.primaryNav}>
          <Text style={[styles.primaryNavActive, { color: colors.text }]}>Dashboard</Text>
          <Text style={[styles.primaryNavItem, { color: colors.muted }]}>Discover</Text>
          <Text style={[styles.primaryNavItem, { color: colors.muted }]}>Analytics</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.secondaryNavRow}>
          <View style={styles.secondaryTabs}>
            <Text style={[styles.secondaryActive, { color: colors.active }]}>Unread</Text>
            <Text style={[styles.secondaryItem, { color: colors.muted }]}>All Items</Text>
            <Text style={[styles.secondaryItem, { color: colors.muted }]}>Archive</Text>
            <Text style={[styles.secondaryItem, { color: colors.muted }]}>Tags</Text>
            <Ionicons name="chevron-down" size={12} color={colors.muted} />
          </View>
          <MaterialCommunityIcons name="view-grid-outline" size={16} color={colors.muted} />
        </View>
        <View style={[styles.underline, { backgroundColor: colors.active }]} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={[styles.title, { color: colors.text }]}>Your Articles</Text>

          <View
            style={[
              styles.searchBox,
              { borderColor: colors.border, backgroundColor: colors.inputBg },
            ]}
          >
            <Feather name="link" size={16} color={colors.subtle} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Paste a URL to save..."
              placeholderTextColor={colors.inputPlaceholder}
            />
          </View>

          {ARTICLES.map((article) => (
            <View
              key={article.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.siteRow}>
                  <View style={[styles.siteIcon, { backgroundColor: colors.chipBg }]}>
                    <Text style={[styles.siteIconText, { color: colors.chipText }]}>
                      {article.site.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.siteName, { color: colors.muted }]}>{article.site}</Text>
                </View>
                <View style={styles.metaRow}>
                  {article.tags?.map((tag) => (
                    <View
                      key={tag}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.chipBg, borderColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: colors.chipText }]}>{tag}</Text>
                    </View>
                  ))}
                  <Text style={[styles.ageText, { color: colors.muted }]}>{article.age}</Text>
                  <Ionicons name="ellipsis-horizontal" size={14} color={colors.muted} />
                </View>
              </View>

              <Text style={[styles.articleTitle, { color: colors.text }]}>{article.title}</Text>
              {article.description ? (
                <Text style={[styles.articleDescription, { color: colors.muted }]}>
                  {article.description}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 21,
    fontWeight: '700',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginRight: 8,
  },
  avatarButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryNavActive: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 20,
  },
  primaryNavItem: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  secondaryNavRow: {
    marginTop: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryTabs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryActive: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 16,
  },
  secondaryItem: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 16,
  },
  underline: {
    width: 56,
    height: 2,
    borderRadius: 999,
    marginBottom: 12,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 42,
    lineHeight: 44,
    fontWeight: '800',
    marginBottom: 18,
  },
  searchBox: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
  },
  card: {
    borderTopWidth: 1,
    paddingTop: 14,
    paddingBottom: 18,
    marginBottom: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  siteIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  siteIconText: {
    fontSize: 10,
    fontWeight: '800',
  },
  siteName: {
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 9,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  ageText: {
    fontSize: 13,
    marginRight: 8,
  },
  articleTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    marginBottom: 6,
  },
  articleDescription: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '500',
  },
});
