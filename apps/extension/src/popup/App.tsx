import logo from '@/assets/logo.svg';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth';
import { env } from '@/lib/env';
import { clearPendingUrl, getPendingUrl, setHasSession } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { UrlInput } from './components/UrlInput';

async function getCurrentTabUrl(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return typeof tab?.url === 'string' ? tab.url : '';
}

export function App() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [prefillUrl, setPrefillUrl] = useState('');

  useEffect(() => {
    const syncPrefillUrl = async () => {
      const pendingUrl = await getPendingUrl();
      if (pendingUrl) {
        setPrefillUrl(pendingUrl);
        await clearPendingUrl();
        return;
      }
      setPrefillUrl(await getCurrentTabUrl());
    };

    void syncPrefillUrl();
  }, []);

  useEffect(() => {
    void setHasSession(Boolean(session));
  }, [session]);

  if (isPending) {
    return <div className="w-[420px] p-4 text-sm text-muted-foreground">Checking session...</div>;
  }

  return (
    <main className="w-[420px] max-h-[620px] p-4 bg-background text-foreground">
      <header className="mb-4 flex items-center gap-2">
        <img
          src={logo}
          alt="rlist logo"
          className="h-7 w-7 shrink-0 [@media(prefers-color-scheme:dark)]:invert"
        />
        <h1 className="text-sm font-semibold">Save to rlist</h1>
      </header>
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mt-1">
          Add this page or paste a link and save it to your collection.
        </p>
      </div>

      {session ? (
        <div className="space-y-3">
          <UrlInput initialUrl={prefillUrl} onSaved={() => window.close()} />
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
              }}
            >
              Customize shortcut
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void authClient.signOut();
                void setHasSession(false);
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <LoginForm onSuccess={() => void refetch()} />
          <p className="text-xs text-muted-foreground">
            Sign in with the same email and password you use in your rlist account.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              void chrome.tabs.create({ url: `${env.siteUrl}/signup` });
            }}
          >
            Create account
          </Button>
        </div>
      )}
    </main>
  );
}
