import { SiweMessage } from 'siwe';

type NeynarBulkUsersResponse = {
  users?: Array<{ fid?: number }>;
  result?: Array<{ fid?: number }>;
} | null;

async function resolveFidFromAddress(address: string, apiKey: string): Promise<number | null> {
  const headers = { 'x-api-key': apiKey } as const;

  // Try bulk-by-eth-address
  const u1 = new URL('https://api.neynar.com/v2/farcaster/user/bulk-by-eth-address');
  u1.searchParams.set('addresses', address);
  const r1 = await fetch(u1.toString(), { headers, cache: 'no-store' });
  if (r1.ok) {
    const j = (await r1.json().catch(() => null)) as NeynarBulkUsersResponse;
    const cand = j?.users?.[0] ?? j?.result?.[0];
    if (cand?.fid) return cand.fid as number;
  }

  // Fallback to bulk-by-address
  const u2 = new URL('https://api.neynar.com/v2/farcaster/user/bulk-by-address');
  u2.searchParams.set('addresses', address);
  const r2 = await fetch(u2.toString(), { headers, cache: 'no-store' });
  if (r2.ok) {
    const j = (await r2.json().catch(() => null)) as NeynarBulkUsersResponse;
    const cand = j?.users?.[0] ?? j?.result?.[0];
    if (cand?.fid) return cand.fid as number;
  }

  return null;
}

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

    const apiKey = process.env.NEYNAR_API_KEY || '';
    if (!apiKey) return Response.json({ error: 'Server missing NEYNAR_API_KEY' }, { status: 500 });

    const fid = await resolveFidFromAddress(address, apiKey);
    if (!fid) return Response.json({ error: 'No Farcaster account linked to this wallet' }, { status: 404 });

    const session = { fid, address };
    const res = Response.json({ ok: true, fid });
    res.headers.append('Set-Cookie', `session=${encodeURIComponent(JSON.stringify(session))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`);
    res.headers.append('Set-Cookie', 'siwe_nonce=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');
    return res;
  } catch {
    return Response.json({ error: 'SIWE verification failed' }, { status: 401 });
  }
}
