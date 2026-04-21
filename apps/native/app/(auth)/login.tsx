import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreenShell } from '@/features/auth/components/auth-screen-shell';
import { AuthTextField } from '@/features/auth/components/auth-text-field';
import { PasswordField } from '@/features/auth/components/password-field';
import { toUserFacingAuthError } from '@/features/auth/lib/auth-errors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { authClient } from '@/lib/auth-client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const subtitleColor = useThemeColor({}, 'subtitle');
  const errorColor = useThemeColor({}, 'error');

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (response.error) {
        setError(toUserFacingAuthError(response.error.message ?? '', response.error.status));
        return;
      }

      router.replace('/home' as never);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenShell title="Welcome back" subtitle="Sign in to access your library.">
      <AuthTextField
        label="Email address"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <PasswordField label="Password" value={password} onChangeText={setPassword} />

      <View style={styles.forgotRow}>
        <Pressable onPress={() => router.push('/forgot-password' as never)} hitSlop={8}>
          <Text style={[styles.forgotLink, { color: textColor }]}>Forgot password?</Text>
        </Pressable>
      </View>

      {error ? <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text> : null}

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
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
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
  forgotRow: {
    alignItems: 'flex-end',
  },
  forgotLink: {
    fontSize: 14,
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
