/**
 * Maps backend auth error messages to safe, user-facing strings.
 * Avoids exposing internal details like account existence or password policy.
 */
export function toUserFacingAuthError(rawMessage: string | undefined, status?: number): string {
  if (!rawMessage) return 'Something went wrong. Please try again.';

  const lower = rawMessage.toLowerCase();

  if (
    status === 403 ||
    lower.includes('verify') ||
    lower.includes('verification') ||
    lower.includes('not verified')
  ) {
    return 'Please verify your email before signing in.';
  }

  if (
    lower.includes('invalid') &&
    (lower.includes('credential') || lower.includes('password') || lower.includes('email'))
  ) {
    return 'Invalid email or password. Please try again.';
  }
  if (lower.includes('email') && lower.includes('already')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('password') && (lower.includes('short') || lower.includes('weak'))) {
    return 'Password is too short. Please use a stronger password.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  return 'Something went wrong. Please try again.';
}
