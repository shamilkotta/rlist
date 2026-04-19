import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreenShell } from '@/features/auth/components/auth-screen-shell';
import { AuthTextField } from '@/features/auth/components/auth-text-field';
import { toUserFacingAuthError } from '@/features/auth/lib/auth-errors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { authClient } from '@/lib/auth-client';
import { env } from '@/lib/env';

function webResetPasswordRedirect(): string {
  const base = env.siteUrl.replace(/\/$/, '');
  return `${base}/reset-password`;
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const subtitleColor = useThemeColor({}, 'subtitle');
  const errorColor = useThemeColor({}, 'error');

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authClient.requestPasswordReset({
        email: trimmed,
        redirectTo: webResetPasswordRedirect(),
      });

      if (response.error) {
        setError(toUserFacingAuthError(response.error.message));
        return;
      }

      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenShell
      title="Forgot password"
      subtitle={
        submitted
          ? 'If that email is registered, you will receive a reset link shortly. Open it in your browser to choose a new password.'
          : 'Enter your email and we will send you a link to reset your password on the web.'
      }
    >
      {submitted ? (
        <Text style={[styles.successHint, { color: subtitleColor }]}>
          You can return to the app after you set a new password in the browser.
        </Text>
      ) : (
        <>
          <AuthTextField
            label="Email address"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {error ? <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text> : null}

          <Pressable
            style={[styles.submitButton, { backgroundColor: textColor }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={[styles.submitText, { color: backgroundColor }]}>
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </Text>
          </Pressable>
        </>
      )}

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: subtitleColor }]}>Remember your password?</Text>
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
  successHint: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Geist',
    lineHeight: 20,
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
