import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { authClient } from '@/lib/auth-client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <Feather name="folder" size={22} color="#111827" />
          </View>

          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>Sign in to access your library.</Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </View>
              <TextInput
                secureTextEntry
                placeholder="Enter password"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable style={styles.signInButton} onPress={handleSignIn} disabled={isSubmitting}>
              <Text style={styles.signInText}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Text>
            </Pressable>
          </View>

          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Or continue with</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialButtons}>
            <Pressable style={styles.socialButton}>
              <FontAwesome name="google" size={16} color="#111827" />
              <Text style={styles.socialButtonText}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-github" size={16} color="#111827" />
              <Text style={styles.socialButtonText}>GitHub</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            Not a member? <Text style={styles.footerStrong}>Start a 14 day free trial</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f6',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 24,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 24,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 34,
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotPassword: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0a1228',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  separatorRow: {
    marginTop: 38,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  separatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#d1d5db',
  },
  separatorText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#ffffff',
  },
  socialButtonText: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    marginTop: 34,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 18,
  },
  footerStrong: {
    color: '#111827',
    fontWeight: '700',
  },
});
