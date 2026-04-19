import { AuthFormLayout } from '@/components/AuthFormLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { createFileRoute } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [{ title: 'Forgot password | rlist' }],
  }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const redirectTo = `${origin}/reset-password`;
        await authClient.requestPasswordReset(
          { email: email.trim(), redirectTo },
          {
            onSuccess: () => {
              setSubmitted(true);
              toast.success('If an account exists for that email, we sent reset instructions.');
            },
            onError: () => {
              toast.error('Something went wrong. Try again in a moment.');
            },
          }
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );

  return (
    <AuthFormLayout
      title="Forgot password"
      description={
        submitted
          ? 'If that email is registered, you will receive a reset link shortly.'
          : 'Enter your email and we will send you a link to choose a new password.'
      }
      footerLink={{ to: '/login', label: 'Remember your password?', linkText: 'Sign in' }}
    >
      {submitted ? (
        <p className="text-sm text-muted-foreground text-center">
          You can close this page after you check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthFormLayout>
  );
}
