export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fidA = searchParams.get('fid');
    const fidB = searchParams.get('target');
    
    if (!fidA || !fidB) {
      return Response.json(
        { error: 'Both fid and target parameters are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEYNAR_API_KEY || '';
    if (!apiKey) return Response.json({ error: 'Server missing NEYNAR_API_KEY' }, { status: 500 });

    const headers = { 'x-api-key': apiKey } as const;
    const makeFollowersUrl = (fid: string) => {
      const u = new URL('https://api.neynar.com/v2/farcaster/user/followers');
      u.searchParams.set('fid', fid);
      u.searchParams.set('limit', '1000');
      u.searchParams.set('sort_type', 'algorithmic');
      return u.toString();
    };

    const [r1, r2] = await Promise.all([
      fetch(makeFollowersUrl(fidA), { headers, cache: 'no-store' }),
      fetch(makeFollowersUrl(fidB), { headers, cache: 'no-store' }),
    ]);
    if (!r1.ok || !r2.ok) return Response.json({ error: 'Failed to fetch followers' }, { status: 502 });

    const d1 = await r1.json();
    const d2 = await r2.json();
    const setA = new Set<number>((d1?.users || []).map((u: any) => u.fid));
    const setB = new Set<number>((d2?.users || []).map((u: any) => u.fid));

    const shared = [...setA].filter((fid) => setB.has(fid));
    const union = new Set<number>([...setA, ...setB]);

    const out = {
      fidA: parseInt(fidA, 10),
      fidB: parseInt(fidB, 10),
      jaccardSimilarity: union.size ? shared.length / union.size : 0,
      sharedFollowers: shared.length,
      totalFollowersA: setA.size,
      totalFollowersB: setB.size,
      sharedTopFans: shared.slice(0, 20),
    };

    return Response.json(out);
  } catch (error) {
    console.error('Error calculating overlap:', error);
    return Response.json(
      { error: 'Failed to calculate overlap' },
      { status: 500 }
    );
  }
}
