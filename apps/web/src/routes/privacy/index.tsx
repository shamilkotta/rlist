import { PolicyPage } from '@/components/PolicyPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy/')({
  component: AppPrivacyRoute,
  head: () => ({
    meta: [{ title: 'Privacy Policy | rlist' }],
  }),
});

function AppPrivacyRoute() {
  return (
    <PolicyPage
      title="rlist Privacy Policy"
      effectiveDate="March 4, 2026"
      summary="This policy explains how rlist handles personal data when you use our main product experiences, including the website and mobile app. It does not replace the separate Chrome Extension policy, which includes extension-specific permissions and storage behavior."
      relatedLinks={[{ label: 'Chrome Extension Privacy Policy', to: '/privacy/chrome-extension' }]}
      sections={[
        {
          title: '1) Information we collect',
          paragraphs: [
            'We collect account information you provide during sign up or sign in, such as your name, email address, and authentication credentials handled through our authentication provider.',
            'When you use rlist, we also process content you choose to save, including links, tags, and related metadata needed to present and organize your saved items.',
          ],
        },
        {
          title: '2) How we use information',
          paragraphs: [
            'We use your information to provide core product functionality: account access, synchronization, saved-link management, and service reliability.',
            'We do not use your data for unrelated purposes such as selling personal data or building unrelated advertising profiles.',
          ],
          bullets: [
            'Authenticate users and maintain signed-in sessions.',
            'Store and display saved links and tags.',
            'Operate, secure, and improve the service.',
          ],
        },
        {
          title: '3) Sharing and third-party processors',
          paragraphs: [
            'We share data only with service providers required to operate rlist, such as hosting, backend infrastructure, and authentication services.',
            'We do not sell personal information to data brokers or third-party advertisers.',
          ],
        },
        {
          title: '4) Data retention and deletion',
          paragraphs: [
            'We keep account and saved-content data for as long as your account remains active or as needed to provide the service.',
            'You can request account or data deletion by contacting us. We will process valid requests within a reasonable time, subject to legal requirements.',
          ],
        },
        {
          title: '5) Security',
          paragraphs: [
            'We use reasonable technical and organizational measures to protect your information. No internet service is fully secure, so we encourage using strong unique passwords and protecting your devices.',
          ],
        },
        {
          title: '6) Your choices and rights',
          paragraphs: [
            'Depending on your location, you may have rights to access, correct, export, or delete your personal information. You may also be able to object to or restrict certain processing.',
          ],
        },
        {
          title: '7) Contact information',
          paragraphs: [
            'For privacy requests, contact: support@rlist.app.',
            // 'Legal entity: [legal entity placeholder]. Mailing address: [address placeholder].',
          ],
        },
        {
          title: '8) Policy updates',
          paragraphs: [
            'We may update this policy from time to time. Material changes will be reflected by updating the effective date and, when appropriate, by providing additional notice in the product.',
          ],
        },
      ]}
    />
  );
}
