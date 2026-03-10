import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type AuthTextFieldProps = TextInputProps & {
  label: string;
};

export function AuthTextField({ label, style, ...rest }: AuthTextFieldProps) {
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'subtitle');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <TextInput
        style={[styles.input, { borderColor, backgroundColor: cardColor, color: textColor }, style]}
        placeholderTextColor={subtitleColor}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Geist-SemiBold',
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'Geist',
  },
});
