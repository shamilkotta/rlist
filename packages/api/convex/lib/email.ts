type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type SendEmailResponse = {
  success?: boolean;
  errors?: Array<{ code?: number; message?: string }>;
};

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiToken = requireEnv(process.env.CLOUDFLARE_API_TOKEN, 'CLOUDFLARE_API_TOKEN');
  const accountId = requireEnv(process.env.CLOUDFLARE_ACCOUNT_ID, 'CLOUDFLARE_ACCOUNT_ID');
  const from = requireEnv(process.env.EMAIL_FROM, 'EMAIL_FROM');

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: input.to,
        from,
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    }
  );

  const json = (await response.json()) as SendEmailResponse;
  if (!response.ok || !json.success) {
    const message = json.errors?.[0]?.message ?? response.statusText;
    throw new Error(`Cloudflare Email API error: ${message}`);
  }
}
