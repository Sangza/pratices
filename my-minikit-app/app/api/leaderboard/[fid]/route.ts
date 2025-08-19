export async function GET(
  _request: Request,
  context: unknown
) {
  try {
    const { params } = context as { params: { fid: string } };
    const fid = parseInt(params.fid, 10);

    const apiKey = process.env.NEYNAR_API_KEY || '';
    if (apiKey) {
      try {
        // Approximation: fetch recent user feed and aggregate reactions by actor
        const u = new URL('https://api.neynar.com/v2/farcaster/feed/user');
        u.searchParams.set('fid', String(fid));
        u.searchParams.set('limit', '50');
        const headers = { 'x-api-key': apiKey } as const;
        const r = await fetch(u.toString(), { headers, cache: 'no-store' });
        if (r.ok) {
          const j = await r.json();
          // Aggregate reactions by actor is not directly available; show placeholder with posts count
          const topFans = (j?.casts || []).slice(0, 10).map((c: any, i: number) => ({
            fid: c?.author?.fid || 1000 + i,
            username: c?.author?.username || `user${i}`,
            displayName: c?.author?.display_name || `User ${i}`,
            avatar: c?.author?.pfp_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fan',
            score: (c?.reactions?.likes || 0) + 2 * (c?.reactions?.recasts || 0) + 5 * (c?.replies || 0),
            contributions: {
              replies: c?.replies || 0,
              likes: c?.reactions?.likes || 0,
              recasts: c?.reactions?.recasts || 0,
              tips: 0,
              tipsValue: 0,
            },
            trend: 'stable' as const,
            rank: i + 1,
            badge: i === 0 ? 'Crown' : undefined,
          }));
          return Response.json({ fid, topFans, window: '30d' });
        }
      } catch (e) {
        // fall through to mock
      }
    }

    // Mock fallback
    const topFans = Array.from({ length: 5 }, (_, i) => ({
      fid: 1000 + i,
      username: `fan${i}`,
      displayName: `Fan ${i}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=fan${i}`,
      score: 1000 - i * 50,
      contributions: { replies: 10 - i, likes: 50 - 2 * i, recasts: 5 - i, tips: 0, tipsValue: 0 },
      trend: 'stable' as const,
      rank: i + 1,
      badge: i === 0 ? 'Crown' : undefined,
    }));

    return Response.json({ fid, topFans, window: '30d' });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
