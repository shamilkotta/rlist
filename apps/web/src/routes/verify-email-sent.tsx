import { AuthFormLayout } from '@/components/AuthFormLayout';
import { Button } from '@/components/ui/button';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Mail } from 'lucide-react';

export const Route = createFileRoute('/verify-email-sent')({
  component: VerifyEmailSentPage,
  head: () => ({
    meta: [{ title: 'Check your email | rlist' }],
  }),
});

function VerifyEmailSentPage() {
  return (
    <AuthFormLayout
      title="Check your email"
      description="We sent you a link to verify your address. Open it on this device to finish setting up your account."
      footerLink={{ to: '/login', label: 'Already verified?', linkText: 'Sign in' }}
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Mail className="h-8 w-8 text-primary" aria-hidden />
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Did not get the email? Check spam, or sign in and use &quot;Resend verification&quot; if
          your inbox is quiet.
        </p>
        <Button asChild className="w-full h-11" variant="secondary">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </div>
    </AuthFormLayout>
  );
}
