import { setPendingUrl } from '@/lib/storage';

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'save-current-page') return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  await setPendingUrl(tab.url);
  await chrome.action.openPopup();
});
