import { StyleSheet, View } from 'react-native';

import { useAppColors } from '@/hooks/use-theme';

const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4'];

export function SearchResultSkeleton() {
  const c = useAppColors();

  return (
    <View style={styles.container}>
      {SKELETON_KEYS.map((key) => (
        <View key={key} style={styles.row}>
          <View style={styles.textColumn}>
            <View style={[styles.titleBar, { backgroundColor: c.border }]} />
            <View style={[styles.domainBar, { backgroundColor: c.border }]} />
          </View>
          <View style={[styles.dateBar, { backgroundColor: c.border }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  textColumn: {
    flex: 1,
    gap: 10,
  },
  titleBar: {
    height: 24,
    borderRadius: 999,
    width: '82%',
  },
  domainBar: {
    height: 16,
    borderRadius: 999,
    width: '36%',
  },
  dateBar: {
    height: 16,
    borderRadius: 999,
    width: 48,
    marginTop: 5,
  },
});
