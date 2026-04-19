import { authClient } from '@/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const VERIFICATION_RESEND_COOLDOWN_SEC = 60;

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

function isEmailUnverifiedError(status: number | undefined, message: string): boolean {
  const lower = message.toLowerCase();
  return (
    status === 403 ||
    lower.includes('verify') ||
    lower.includes('verification') ||
    lower.includes('not verified')
  );
}

export function useEmailAuth(mode: 'login' | 'signup') {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationResendSecondsLeft, setVerificationResendSecondsLeft] = useState(0);

  const startVerificationResendCooldown = useCallback(() => {
    setVerificationResendSecondsLeft(VERIFICATION_RESEND_COOLDOWN_SEC);
  }, []);

  useEffect(() => {
    if (verificationResendSecondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setVerificationResendSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [verificationResendSecondsLeft]);

  const submit = useCallback(
    async (data: LoginData | SignupData) => {
      setIsLoading(true);
      setError(null);
      if (mode === 'login') {
        setNeedsEmailVerification(false);
      }

      try {
        if (mode === 'login') {
          const { email, password } = data as LoginData;
          await authClient.signIn.email(
            { email, password, callbackURL: '/' },
            {
              onSuccess: () => navigate({ to: '/' }),
              onError: (ctx) => {
                const msg = ctx.error?.message ?? '';
                if (isEmailUnverifiedError(ctx.error?.status, msg)) {
                  setNeedsEmailVerification(true);
                  setError('Please verify your email before signing in.');
                  startVerificationResendCooldown();
                  return;
                }
                setNeedsEmailVerification(false);
                setError(sanitizeLoginError(msg));
              },
            }
          );
        } else {
          const { name, email, password } = data as SignupData;
          const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
          await authClient.signUp.email(
            { email, password, name, callbackURL },
            {
              onSuccess: () => navigate({ to: '/verify-email-sent' }),
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
    [mode, navigate, startVerificationResendCooldown]
  );

  const resendVerificationEmail = useCallback(
    async (email: string) => {
      if (!email.trim()) {
        toast.error('Enter your email address first.');
        return;
      }
      startVerificationResendCooldown();
      setIsResendingVerification(true);
      try {
        const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
        await authClient.sendVerificationEmail(
          { email: email.trim(), callbackURL },
          {
            onSuccess: () => {
              toast.success('Verification email sent. Check your inbox.');
            },
            onError: () => {
              toast.error('Could not send verification email. Try again later.');
            },
          }
        );
      } finally {
        setIsResendingVerification(false);
      }
    },
    [startVerificationResendCooldown]
  );

  return {
    submit,
    isLoading,
    error,
    setError,
    needsEmailVerification,
    isResendingVerification,
    verificationResendSecondsLeft,
    resendVerificationEmail,
  };
}
