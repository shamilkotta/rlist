import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppColors } from '@/hooks/use-theme';

type SearchResultRowProps = {
  title: string;
  domain: string;
  faviconUrl: string;
  date: string;
  onPress: () => void;
};

export function SearchResultRow({
  title,
  domain,
  faviconUrl,
  date,
  onPress,
}: SearchResultRowProps) {
  const c = useAppColors();

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.domainRow}>
          <View style={[styles.faviconContainer, { backgroundColor: c.border }]}>
            <Text style={[styles.faviconFallbackText, { color: c.subtitle }]}>
              {domain.charAt(0).toUpperCase()}
            </Text>
            <Image
              source={{ uri: faviconUrl }}
              style={StyleSheet.absoluteFillObject}
              contentFit="contain"
            />
          </View>
          <Text style={[styles.domainText, { color: c.subtitle }]} numberOfLines={1}>
            {domain}
          </Text>
        </View>
      </View>
      <Text style={[styles.dateText, { color: c.subtitle }]}>{date}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 14,
    marginBottom: 4,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Geist-Bold',
    letterSpacing: -0.2,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faviconContainer: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  faviconFallbackText: {
    fontSize: 9,
    fontFamily: 'Geist-Bold',
  },
  domainText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Geist',
    flexShrink: 1,
  },
  dateText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Geist',
    marginTop: 3,
  },
});
