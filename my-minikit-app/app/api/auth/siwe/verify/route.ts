import { SiweMessage } from 'siwe';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { message: string; signature: string } | null;
  if (!body?.message || !body?.signature) {
    return Response.json({ error: 'Missing SIWE payload' }, { status: 400 });
  }

  const cookies = request.headers.get('cookie') || '';
  const m = cookies.match(/(?:^|; )siwe_nonce=([^;]+)/);
  const nonce = m ? decodeURIComponent(m[1]) : '';
  if (!nonce) return Response.json({ error: 'Missing nonce' }, { status: 400 });

  try {
    const msg = new SiweMessage(body.message);
    const fields = await msg.verify({ signature: body.signature, nonce });
    if (!fields.success) return Response.json({ error: 'Invalid SIWE' }, { status: 401 });

    const address = msg.address.toLowerCase();

    // Resolve fid from address via Neynar
    const apiKey = process.env.NEYNAR_API_KEY || '';
    if (!apiKey) return Response.json({ error: 'Server missing NEYNAR_API_KEY' }, { status: 500 });

    const url = new URL('https://api.neynar.com/v2/farcaster/user/bulk-by-address');
    url.searchParams.set('addresses', address);

    const resp = await fetch(url.toString(), {
      headers: { 'x-api-key': apiKey },
      cache: 'no-store',
    });
    if (!resp.ok) return Response.json({ error: 'Failed to resolve fid' }, { status: 502 });

    const data = await resp.json() as { users: Array<{ fid: number; custody_address?: string }> };
    const user = data.users?.[0];
    if (!user?.fid) return Response.json({ error: 'No Farcaster account linked to this wallet' }, { status: 404 });

    const session = { fid: user.fid, address };
    const res = Response.json({ ok: true, fid: session.fid });
    res.headers.append('Set-Cookie', `session=${encodeURIComponent(JSON.stringify(session))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`);
    // Clear nonce
    res.headers.append('Set-Cookie', 'siwe_nonce=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');
    return res;
  } catch {
    return Response.json({ error: 'SIWE verification failed' }, { status: 401 });
  }
}
