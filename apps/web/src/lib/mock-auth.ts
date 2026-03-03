import { useEffect, useState } from 'react';

const SESSION_STORAGE_KEY = 'rlist:mock-session';

export type MockSession = {
  user: {
    name: string;
    email: string;
  };
};

function readSession(): MockSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MockSession;
  } catch {
    return null;
  }
}

export function useMockSession() {
  const [session, setSession] = useState<MockSession | null>(() => readSession());

  useEffect(() => {
    setSession(readSession());
  }, []);

  return { session, isPending: false };
}

export async function mockSignIn(email: string) {
  const next: MockSession = {
    user: {
      name: email.split('@')[0] || 'User',
      email,
    },
  };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
}

export async function mockSignUp(name: string, email: string) {
  const next: MockSession = {
    user: {
      name: name || email.split('@')[0] || 'User',
      email,
    },
  };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
}

export async function mockSignOut() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
