import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextStyle,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogoIcon } from '@/components/app-logo-icon';
import { GridBackground } from '@/components/grid-background';
import { useTheme } from '@/hooks/use-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { authClient } from '@/lib/auth-client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { colorScheme } = useTheme();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'subtitle');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');
  const errorColor = useThemeColor({}, 'error');

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        setError(response.error.message ?? 'Unable to sign in');
        return;
      }

      router.replace('/home' as never);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <GridBackground />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.headerContainer}>
              <View style={[styles.iconSquare, { backgroundColor: cardColor, borderColor }]}>
                <AppLogoIcon size={32} color={textColor} />
              </View>
              <ThemedTitle style={{ color: textColor }}>Welcome back</ThemedTitle>
              <Text style={[styles.subtitle, { color: subtitleColor }]}>
                Sign in to access your library.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: textColor }]}>Email address</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={[
                    styles.input,
                    { borderColor, backgroundColor: cardColor, color: textColor },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor={subtitleColor}
                />
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: textColor }]}>Password</Text>
                  <Pressable>
                    <Text style={[styles.forgotPassword, { color: subtitleColor }]}>
                      Forgot password?
                    </Text>
                  </Pressable>
                </View>
                <View
                  style={[styles.inputWithIconWrap, { borderColor, backgroundColor: cardColor }]}
                >
                  <TextInput
                    secureTextEntry={!showPassword}
                    style={[styles.inputWithIcon, { color: textColor }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor={subtitleColor}
                  />
                  <Pressable
                    style={styles.passwordToggleButton}
                    onPress={() => setShowPassword((current) => !current)}
                    hitSlop={8}
                  >
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={subtitleColor}
                    />
                  </Pressable>
                </View>
              </View>

              {error ? (
                <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
              ) : null}

              <Pressable
                style={[styles.submitButton, { backgroundColor: textColor }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={[styles.submitText, { color: backgroundColor }]}>
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Text>
              </Pressable>

              <View style={styles.footerRow}>
                <Text style={[styles.footerText, { color: subtitleColor }]}>Not a member?</Text>
                <Pressable onPress={() => router.push('/signup' as never)}>
                  <Text style={[styles.footerLink, { color: textColor }]}> Sign up</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function ThemedTitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconSquare: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android shadow
    elevation: 3,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    fontFamily: 'Geist-ExtraBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Geist',
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Geist-SemiBold',
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Geist-Medium',
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'Geist',
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
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Geist-Medium',
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Geist-SemiBold',
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Geist',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Geist-Bold',
  },
});
