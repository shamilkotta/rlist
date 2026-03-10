import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import LogoDark from '@/assets/images/logo-dark.svg';
import LogoLight from '@/assets/images/logo-light.svg';
import { useAppColors, useTheme } from '@/hooks/use-theme';

type HomeHeaderProps = {
  userName?: string | null;
  onSignOut: () => void;
  onPressSearch: () => void;
};

export function HomeHeader({ userName, onSignOut, onPressSearch }: HomeHeaderProps) {
  const { colorScheme } = useTheme();
  const c = useAppColors();

  return (
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
        <Pressable onPress={onPressSearch} hitSlop={8}>
          <Feather name="search" size={18} color={c.text} />
        </Pressable>
        <Pressable
          style={[styles.avatarButton, { backgroundColor: c.subtitle }]}
          onPress={onSignOut}
        >
          <Text style={[styles.avatarButtonText, { color: c.background }]}>
            {userName?.charAt(0).toUpperCase() ?? 'U'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
