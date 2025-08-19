export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 401 });
    }

    // Verify Farcaster Mini App JWT
    const { verify } = await import('@farcaster/miniapp-sdk/server');
    const payload = await verify(token);
    // Expecting at least fid; username/displayName may be present
    const session = {
      fid: (payload as any).fid,
      username: (payload as any).username || undefined,
      displayName: (payload as any).displayName || undefined,
      exp: (payload as any).exp || undefined,
    };

    const res = Response.json({ ok: true, fid: session.fid });
    res.headers.append(
      'Set-Cookie',
      `session=${encodeURIComponent(JSON.stringify(session))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`
    );
    return res;
  } catch (e) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
