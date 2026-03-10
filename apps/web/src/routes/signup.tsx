import { AuthFormLayout } from '@/components/AuthFormLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmailAuth } from '@/hooks/use-email-auth';
import { createFileRoute } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/signup')({
  component: SignupPage,
  head: () => ({
    meta: [{ title: 'Create an account | rlist' }],
  }),
});

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { submit, isLoading, error } = useEmailAuth('signup');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({ name, email, password });
  };

  return (
    <AuthFormLayout
      title="Create an account"
      description="Enter your details to get started"
      footerLink={{ to: '/login', label: 'Already have an account?', linkText: 'Log in' }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11"
          />
        </div>
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
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11"
          />
        </div>

        {error && (
          <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
        </Button>
      </form>
    </AuthFormLayout>
  );
}
