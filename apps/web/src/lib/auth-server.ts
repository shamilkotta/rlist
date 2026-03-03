export async function handler(_request: Request): Promise<Response> {
  return new Response('Auth is mocked for deployment testing.', { status: 200 });
}

export async function getToken(): Promise<null> {
  return null;
}

export async function fetchAuthQuery<T>(factory: () => Promise<T>): Promise<T> {
  return factory();
}

export async function fetchAuthMutation<T>(factory: () => Promise<T>): Promise<T> {
  return factory();
}

export async function fetchAuthAction<T>(factory: () => Promise<T>): Promise<T> {
  return factory();
}
