import { useEffect, useState } from 'react';

type MockUser = {
  name: string;
  email: string;
  image: string | null;
};

type MockSession = {
  user: MockUser;
};

type AuthError = {
  error: {
    message: string;
  };
};

const SESSION_KEY = 'rlist.mock.session';
const SESSION_EVENT = 'rlist:mock-session-change';

function readSession(): MockSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MockSession;
  } catch {
    return null;
  }
}

function writeSession(session: MockSession | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }

  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

function createSessionFromEmail(email: string, name?: string): MockSession {
  const fallbackName = email.split('@')[0] || 'User';
  return {
    user: {
      name: name || fallbackName,
      email,
      image: null,
    },
  };
}

function callAuthError(
  callback: ((ctx: AuthError) => void) | undefined,
  message: string
): Promise<never> {
  callback?.({ error: { message } });
  return Promise.reject(new Error(message));
}

export const authClient = {
  useSession(): { data: MockSession | null; isPending: boolean } {
    const [data, setData] = useState<MockSession | null>(null);

    useEffect(() => {
      setData(readSession());

      const onChange = () => {
        setData(readSession());
      };

      window.addEventListener(SESSION_EVENT, onChange);
      window.addEventListener('storage', onChange);

      return () => {
        window.removeEventListener(SESSION_EVENT, onChange);
        window.removeEventListener('storage', onChange);
      };
    }, []);

    return { data, isPending: false };
  },

  signIn: {
    email(
      args: { email: string; password: string; callbackURL?: string },
      options?: {
        onSuccess?: () => void;
        onError?: (ctx: AuthError) => void;
      }
    ): Promise<{ data: MockSession }> {
      if (!args.email || !args.password) {
        return callAuthError(options?.onError, 'Email and password are required');
      }

      const session = createSessionFromEmail(args.email);
      writeSession(session);
      options?.onSuccess?.();
      return Promise.resolve({ data: session });
    },

    social(args: { provider: string; callbackURL?: string }): Promise<{ data: MockSession }> {
      const providerName = args.provider || 'social';
      const session = createSessionFromEmail(
        `${providerName}@example.com`,
        `${providerName[0]?.toUpperCase() || 'S'}${providerName.slice(1)} User`
      );
      writeSession(session);
      return Promise.resolve({ data: session });
    },
  },

  signUp: {
    email(
      args: { email: string; password: string; name?: string; callbackURL?: string },
      options?: {
        onSuccess?: () => void;
        onError?: (ctx: AuthError) => void;
      }
    ): Promise<{ data: MockSession }> {
      if (!args.email || !args.password) {
        return callAuthError(options?.onError, 'Email and password are required');
      }

      const session = createSessionFromEmail(args.email, args.name);
      writeSession(session);
      options?.onSuccess?.();
      return Promise.resolve({ data: session });
    },
  },

  signOut(options?: { fetchOptions?: { onSuccess?: () => void } }): Promise<void> {
    writeSession(null);
    options?.fetchOptions?.onSuccess?.();
    return Promise.resolve();
  },
};
