import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreenShell } from '@/features/auth/components/auth-screen-shell';
import { AuthTextField } from '@/features/auth/components/auth-text-field';
import { PasswordField } from '@/features/auth/components/password-field';
import { toUserFacingAuthError } from '@/features/auth/lib/auth-errors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { authClient } from '@/lib/auth-client';

export default function SignupScreen() {
  const [name, setName] = useState('');
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
      const trimmedName = name.trim();
      const fallbackName = email.split('@')[0] || 'User';
      const response = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: trimmedName || fallbackName,
      });

      if (response.error) {
        setError(toUserFacingAuthError(response.error.message));
        return;
      }

      router.replace('/home' as never);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenShell title="Create account" subtitle="Join us and start organizing your library.">
      <AuthTextField
        label="Name"
        autoCapitalize="words"
        autoCorrect={false}
        value={name}
        onChangeText={setName}
      />

      <AuthTextField
        label="Email address"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <PasswordField label="Password" value={password} onChangeText={setPassword} />

      {error ? <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text> : null}

      <Pressable
        style={[styles.submitButton, { backgroundColor: textColor }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={[styles.submitText, { color: backgroundColor }]}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: subtitleColor }]}>Already have an account?</Text>
        <Pressable onPress={() => router.push('/login' as never)}>
          <Text style={[styles.footerLink, { color: textColor }]}> Sign in</Text>
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
