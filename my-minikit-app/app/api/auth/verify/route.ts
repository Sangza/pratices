type MiniAppJwtPayload = {
  fid: number;
  username?: string;
  displayName?: string;
  exp?: number;
};

function decodeJwtPayload(token: string): MiniAppJwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload as MiniAppJwtPayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 401 });
  }

  // TEMP: decode without verification (replace with proper verification when SDK/JWKS is available)
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.fid) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

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
}
