import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
};

export function PasswordField({ label, value, onChangeText }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'subtitle');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={[styles.inputWithIconWrap, { borderColor, backgroundColor: cardColor }]}>
        <TextInput
          secureTextEntry={!showPassword}
          style={[styles.inputWithIcon, { color: textColor }]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={subtitleColor}
        />
        <Pressable
          style={styles.passwordToggleButton}
          onPress={() => setShowPassword((current) => !current)}
          hitSlop={8}
        >
          <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={subtitleColor} />
        </Pressable>
      </View>
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
  inputWithIconWrap: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    fontFamily: 'Geist',
  },
  passwordToggleButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
