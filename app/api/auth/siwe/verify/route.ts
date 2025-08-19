import { SiweMessage } from 'siwe';

type NeynarBulkUsersResponse = {
  users?: Array<{ 
    fid?: number;
    display_name?: string;
    username?: string;
    pfp_url?: string;
  }>;
  result?: Array<{ 
    fid?: number;
    display_name?: string;
    username?: string;
    pfp_url?: string;
  }>;
} | null;

async function resolveFidFromAddress(address: string, apiKey: string): Promise<{
  fid: number;
  displayName?: string;
  username?: string;
  avatar?: string;
} | null> {
  const headers = { 'x-api-key': apiKey } as const;

  // Try bulk-by-eth-address
  const u1 = new URL('https://api.neynar.com/v2/farcaster/user/bulk-by-eth-address');
  u1.searchParams.set('addresses', address);
  const r1 = await fetch(u1.toString(), { headers, cache: 'no-store' });
  if (r1.ok) {
    const j = (await r1.json().catch(() => null)) as NeynarBulkUsersResponse;
    const cand = j?.users?.[0] ?? j?.result?.[0];
    if (cand?.fid) {
      return {
        fid: cand.fid as number,
        displayName: cand.display_name,
        username: cand.username,
        avatar: cand.pfp_url
      };
    }
  }

  // Fallback to bulk-by-address
  const u2 = new URL('https://api.neynar.com/v2/farcaster/user/bulk-by-address');
  u2.searchParams.set('addresses', address);
  const r2 = await fetch(u2.toString(), { headers, cache: 'no-store' });
  if (r2.ok) {
    const j = (await r2.json().catch(() => null)) as NeynarBulkUsersResponse;
    const cand = j?.users?.[0] ?? j?.result?.[0];
    if (cand?.fid) {
      return {
        fid: cand.fid as number,
        displayName: cand.display_name,
        username: cand.username,
        avatar: cand.pfp_url
      };
    }
  }

  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { message: string; signature: string } | null;
  if (!body?.message || !body?.signature) {
    return Response.json({ error: 'Missing SIWE payload' }, { status: 400 });
  }

  try {
    const msg = new SiweMessage(body.message);
    const fields = await msg.verify({ signature: body.signature });
    if (!fields.success) return Response.json({ error: 'Invalid SIWE signature' }, { status: 401 });

    const address = msg.address.toLowerCase();

    const apiKey = process.env.NEYNAR_API_KEY || '';
    if (!apiKey) return Response.json({ error: 'Server missing NEYNAR_API_KEY' }, { status: 500 });

    const userData = await resolveFidFromAddress(address, apiKey);
    if (!userData) return Response.json({ error: 'No Farcaster account linked to this wallet' }, { status: 404 });

    const session = { 
      fid: userData.fid, 
      address,
      displayName: userData.displayName,
      username: userData.username,
      avatar: userData.avatar
    };
    
    const res = Response.json({ 
      ok: true, 
      fid: userData.fid,
      displayName: userData.displayName,
      username: userData.username,
      avatar: userData.avatar
    });
    
    res.headers.append('Set-Cookie', `session=${encodeURIComponent(JSON.stringify(session))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`);
    
    return res;
  } catch (error) {
    console.error('SIWE verification error:', error);
    return Response.json({ error: 'SIWE verification failed' }, { status: 401 });
  }
}
