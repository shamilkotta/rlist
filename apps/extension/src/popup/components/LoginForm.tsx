import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth';
import { setHasSession } from '@/lib/storage';
import { type FormEvent, useState } from 'react';

type LoginFormProps = {
  onSuccess: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await authClient.signIn.email({
      email,
      password,
    });

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error.message ?? 'Unable to sign in');
      return;
    }

    await setHasSession(true);
    onSuccess();
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
