async function exchangeCodeForToken(code: string) {
  const tokenUrl = process.env.NEYNAR_OAUTH_TOKEN_URL || '';
  const clientId = process.env.NEYNAR_OAUTH_CLIENT_ID || '';
  const clientSecret = process.env.NEYNAR_OAUTH_CLIENT_SECRET || '';
  const redirectUri = process.env.NEYNAR_OAUTH_REDIRECT_URI || '';

  const params = new URLSearchParams();
  params.set('grant_type', 'authorization_code');
  params.set('code', code);
  params.set('client_id', clientId);
  params.set('client_secret', clientSecret);
  params.set('redirect_uri', redirectUri);

  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    cache: 'no-store',
  });
  if (!resp.ok) throw new Error('Token exchange failed');
  return resp.json();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|; )oauth_state=([^;]+)/);
  const cookieState = match ? decodeURIComponent(match[1]) : '';

  if (!code || !state || !cookieState || state !== cookieState) {
    return Response.json({ error: 'Invalid state or code' }, { status: 400 });
  }

  try {
    await exchangeCodeForToken(code);
    // Optional: use token to fetch user profile from Neynar if endpoint available
    const session = { oauth: true };

    const res = Response.redirect(process.env.NEXT_PUBLIC_URL || '/', 302);
    res.headers.append(
      'Set-Cookie',
      `session=${encodeURIComponent(JSON.stringify(session))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`
    );
    // Clear state cookie
    res.headers.append('Set-Cookie', 'oauth_state=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');
    return res;
  } catch {
    return Response.json({ error: 'OAuth callback failed' }, { status: 500 });
  }
}
