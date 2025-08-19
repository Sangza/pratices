function randomString(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export async function GET() {
  const clientId = process.env.NEYNAR_OAUTH_CLIENT_ID || '';
  const redirectUri = process.env.NEYNAR_OAUTH_REDIRECT_URI || '';
  const authUrl = process.env.NEYNAR_OAUTH_AUTH_URL || '';
  const scope = process.env.NEYNAR_OAUTH_SCOPE || 'openid';

  if (!clientId || !redirectUri || !authUrl) {
    return Response.json({ error: 'OAuth not configured' }, { status: 500 });
  }

  const state = randomString(24);
  const url = new URL(authUrl);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);

  const res = Response.redirect(url.toString(), 302);
  res.headers.append(
    'Set-Cookie',
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );
  return res;
}
