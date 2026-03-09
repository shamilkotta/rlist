import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 40;
const FADE_LIMIT = height * 0.6; // Let it fade out by 60% of the screen height

export function GridBackground() {
  const horizontalLines = Math.ceil(FADE_LIMIT / GRID_SIZE);
  const verticalLines = Math.ceil(width / GRID_SIZE);

  const gridColor = useThemeColor({}, 'grid');
  const backgroundColor = useThemeColor({}, 'background');
  const backgroundTransparent = useThemeColor({}, 'backgroundTransparent');

  return (
    <View style={[styles.container, { backgroundColor }]} pointerEvents="none">
      <View style={[styles.grid, { height: FADE_LIMIT }]}>
        {[...Array(horizontalLines)].map((_, i) => (
          <View
            key={`h-${i.toString()}`}
            style={[
              styles.line,
              styles.horizontal,
              { top: i * GRID_SIZE, backgroundColor: gridColor },
            ]}
          />
        ))}
        {[...Array(verticalLines)].map((_, i) => (
          <View
            key={`v-${i.toString()}`}
            style={[
              styles.line,
              styles.vertical,
              { left: i * GRID_SIZE, height: FADE_LIMIT, backgroundColor: gridColor },
            ]}
          />
        ))}
        <LinearGradient
          colors={[backgroundTransparent, backgroundColor]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  grid: {
    width: '100%',
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
  },
  horizontal: {
    left: 0,
    right: 0,
    height: 1,
  },
  vertical: {
    top: 0,
    width: 1,
  },
});
