import { mockSignIn, mockSignOut, mockSignUp, useMockSession } from '@/lib/mock-auth';

type AuthErrorContext = {
  error: {
    message: string;
  };
};

type AuthCallbacks = {
  onSuccess?: () => void;
  onError?: (ctx: AuthErrorContext) => void;
};

export const authClient = {
  useSession() {
    const { session, isPending } = useMockSession();
    return { data: session, isPending };
  },
  signIn: {
    async email(
      args: { email: string; password: string; callbackURL?: string },
      callbacks?: AuthCallbacks
    ) {
      try {
        await mockSignIn(args.email);
        callbacks?.onSuccess?.();
      } catch {
        callbacks?.onError?.({
          error: { message: 'Failed to sign in' },
        });
      }
    },
    async social(args: { provider: string; callbackURL?: string }) {
      const email = `${args.provider}@example.com`;
      await mockSignIn(email);
      if (typeof window !== 'undefined' && args.callbackURL) {
        window.location.href = args.callbackURL;
      }
    },
  },
  signUp: {
    async email(
      args: { name: string; email: string; password: string; callbackURL?: string },
      callbacks?: AuthCallbacks
    ) {
      try {
        await mockSignUp(args.name, args.email);
        callbacks?.onSuccess?.();
      } catch {
        callbacks?.onError?.({
          error: { message: 'Failed to sign up' },
        });
      }
    },
  },
  async signOut(options?: { fetchOptions?: { onSuccess?: () => void } }) {
    await mockSignOut();
    options?.fetchOptions?.onSuccess?.();
  },
};
