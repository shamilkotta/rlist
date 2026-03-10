import { authClient } from '@/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

type LoginData = { email: string; password: string };
type SignupData = { name: string; email: string; password: string };

function sanitizeLoginError(msg: string): string {
  const lower = msg.toLowerCase();
  return lower.includes('invalid') || lower.includes('credential')
    ? 'Invalid email or password'
    : 'Something went wrong. Please try again.';
}

function sanitizeSignupError(msg: string): string {
  const lower = msg.toLowerCase();
  return lower.includes('already') || lower.includes('exist')
    ? 'An account with this email already exists'
    : 'Something went wrong. Please try again.';
}

export function useEmailAuth(mode: 'login' | 'signup') {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (data: LoginData | SignupData) => {
      setIsLoading(true);
      setError(null);

      try {
        if (mode === 'login') {
          const { email, password } = data as LoginData;
          await authClient.signIn.email(
            { email, password, callbackURL: '/' },
            {
              onSuccess: () => navigate({ to: '/' }),
              onError: (ctx) => setError(sanitizeLoginError(ctx.error?.message ?? '')),
            }
          );
        } else {
          const { name, email, password } = data as SignupData;
          await authClient.signUp.email(
            { email, password, name, callbackURL: '/' },
            {
              onSuccess: () => navigate({ to: '/' }),
              onError: (ctx) => setError(sanitizeSignupError(ctx.error?.message ?? '')),
            }
          );
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [mode, navigate]
  );

  return { submit, isLoading, error, setError };
}
