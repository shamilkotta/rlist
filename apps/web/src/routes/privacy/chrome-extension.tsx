import { PolicyPage } from '@/components/PolicyPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy/chrome-extension')({
  component: ExtensionPrivacyRoute,
  head: () => ({
    meta: [{ title: 'Chrome Extension Privacy Policy | rlist' }],
  }),
});

function ExtensionPrivacyRoute() {
  return (
    <PolicyPage
      title="rlist Chrome Extension Privacy Policy"
      effectiveDate="March 4, 2026"
      summary="This policy covers data practices specific to the rlist Chrome Extension. It explains extension permissions, what data is processed, and how that data supports the extension's single purpose: saving links to your rlist account."
      relatedLinks={[{ label: 'rlist Privacy Policy', to: '/privacy' }]}
      sections={[
        {
          title: '1) What extension data we process',
          paragraphs: [
            'The extension reads the active tab URL when you open the popup or use the keyboard shortcut so we can prefill the link you want to save.',
            'The extension processes URLs and optional tags that you submit, and it may request page metadata (title, description, favicon, domain) to show a preview before saving.',
            'During login, the extension processes your email address and password through the authentication flow so you can access your account.',
          ],
          bullets: [
            'Personally identifiable information: account email and related account profile data.',
            'Website content: submitted URL and optional metadata shown in preview.',
            'Authentication information: credentials provided by you during sign in.',
          ],
        },
        {
          title: '2) Extension permissions and why they are required',
          paragraphs: [
            'The extension requests only the permissions needed for core functionality.',
          ],
          bullets: [
            '`activeTab` and `tabs`: read the current tab URL when you intentionally open the extension or use its command.',
            '`storage`: keep minimal extension-local state such as `pendingUrl` and `hasSession`.',
            '`commands`: support the keyboard shortcut to open and prefill the save flow.',
            'Host permissions are limited to configured Convex backend domains used to authenticate and save user data.',
          ],
        },
        {
          title: '3) How we use extension data',
          paragraphs: [
            'Data is used only to sign you in, prefill the URL input, fetch preview metadata, and save links/tags to your own rlist account.',
            'We do not use extension data to build advertising profiles or for purposes unrelated to the extension’s single purpose.',
          ],
        },
        {
          title: '4) Data storage and transfer',
          paragraphs: [
            'A small amount of local state is stored in Chrome extension storage (`pendingUrl`, `hasSession`) to support extension UX.',
            'Submitted content and account-related requests are sent to the rlist backend over network requests to configured service endpoints.',
          ],
        },
        {
          title: '5) Data sharing and sale',
          paragraphs: [
            'We do not sell or transfer extension user data to third parties except service providers needed to run rlist.',
            'We do not use or transfer extension data for creditworthiness or lending decisions.',
          ],
        },
        {
          title: '6) Retention and deletion',
          paragraphs: [
            'Locally stored extension state can be cleared by removing extension storage or uninstalling the extension.',
            'For account-level deletion requests covering saved content associated with your account, contact us using the details below.',
          ],
        },
        {
          title: '7) Contact information',
          paragraphs: [
            'For Chrome Extension privacy questions or deletion requests, contact: support@rlist.app.',
            // 'Legal entity: [legal entity placeholder]. Mailing address: [address placeholder].',
          ],
        },
        {
          title: '8) Policy changes',
          paragraphs: [
            'We may update this policy as extension features evolve. The effective date above indicates the latest version.',
          ],
        },
      ]}
    />
  );
}
