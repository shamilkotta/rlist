const PENDING_URL_KEY = 'pendingUrl';
const AUTH_STATE_KEY = 'hasSession';

export async function getPendingUrl(): Promise<string | null> {
  const result = await chrome.storage.local.get(PENDING_URL_KEY);
  const pendingUrl = result[PENDING_URL_KEY];
  return typeof pendingUrl === 'string' && pendingUrl.length > 0 ? pendingUrl : null;
}

export async function setPendingUrl(url: string): Promise<void> {
  await chrome.storage.local.set({ [PENDING_URL_KEY]: url });
}

export async function clearPendingUrl(): Promise<void> {
  await chrome.storage.local.remove(PENDING_URL_KEY);
}

export async function setHasSession(hasSession: boolean): Promise<void> {
  await chrome.storage.local.set({ [AUTH_STATE_KEY]: hasSession });
}

export async function getHasSession(): Promise<boolean> {
  const result = await chrome.storage.local.get(AUTH_STATE_KEY);
  return Boolean(result[AUTH_STATE_KEY]);
}
