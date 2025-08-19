type MiniAppJwtPayload = {
  fid: number;
  username?: string;
  displayName?: string;
  exp?: number;
};

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) {
      return Response.json({ error: 'Missing token' }, { status: 401 });
    }

    // Verify Farcaster Mini App JWT
    const { verify } = await import('@farcaster/miniapp-sdk/server');
    const payload = (await verify(token)) as MiniAppJwtPayload;

    const session = {
      fid: payload.fid,
      username: payload.username,
      displayName: payload.displayName,
      exp: payload.exp,
    };

    const res = Response.json({ ok: true, fid: session.fid });
    res.headers.append(
      'Set-Cookie',
      `session=${encodeURIComponent(JSON.stringify(session))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`
    );
    return res;
  } catch {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
