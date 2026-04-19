import { AuthFormLayout } from '@/components/AuthFormLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type ResetSearch = {
  token?: string;
  error?: string;
};

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: ResetPasswordPage,
  head: () => ({
    meta: [{ title: 'Set a new password | rlist' }],
  }),
});

function ResetPasswordPage() {
  const { token, error: queryError } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      if (!token) {
        setFormError(
          'This reset link is missing a token. Request a new link from the sign-in page.'
        );
        return;
      }
      if (password.length < 8) {
        setFormError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirm) {
        setFormError('Passwords do not match.');
        return;
      }
      setIsLoading(true);
      try {
        await authClient.resetPassword(
          { newPassword: password, token },
          {
            onSuccess: () => {
              toast.success('Password updated. You can sign in now.');
              void navigate({ to: '/login' });
            },
            onError: (ctx) => {
              const msg = ctx.error?.message ?? '';
              setFormError(
                msg.toLowerCase().includes('token') || msg.toLowerCase().includes('invalid')
                  ? 'This link is invalid or expired. Request a new one from the sign-in page.'
                  : 'Could not reset your password. Try again.'
              );
            },
          }
        );
      } finally {
        setIsLoading(false);
      }
    },
    [token, password, confirm, navigate]
  );

  const invalidToken =
    queryError === 'INVALID_TOKEN' || queryError?.toLowerCase().includes('invalid');

  if (invalidToken || (!token && queryError)) {
    return (
      <AuthFormLayout
        title="Link expired"
        description="This password reset link is no longer valid. Request a fresh link to continue."
        footerLink={{ to: '/login', label: 'Back to', linkText: 'Sign in' }}
      >
        <Button asChild className="w-full h-11">
          <Link to="/forgot-password">Request a new link</Link>
        </Button>
      </AuthFormLayout>
    );
  }

  if (!token) {
    return (
      <AuthFormLayout
        title="Reset password"
        description="Open the link from your email, or request a new reset email from the sign-in page."
        footerLink={{ to: '/login', label: 'Back to', linkText: 'Sign in' }}
      >
        <Button asChild className="w-full h-11" variant="secondary">
          <Link to="/forgot-password">Forgot password</Link>
        </Button>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout
      title="Choose a new password"
      description="Enter a new password for your account."
      footerLink={{ to: '/login', label: 'Rather sign in?', linkText: 'Back to sign in' }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            New password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-11"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirm"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Confirm password
          </label>
          <Input
            id="confirm"
            type="password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            className="h-11"
            autoComplete="new-password"
          />
        </div>
        {formError && (
          <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
            {formError}
          </div>
        )}
        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update password'}
        </Button>
      </form>
    </AuthFormLayout>
  );
}
