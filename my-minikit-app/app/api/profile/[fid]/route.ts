export async function GET(
  _request: Request,
  context: unknown
) {
  try {
    const { params } = context as { params: { fid: string } };
    const fid = parseInt(params.fid, 10);

    const apiKey = process.env.NEYNAR_API_KEY || '';
    if (!apiKey) return Response.json({ error: 'Server missing NEYNAR_API_KEY' }, { status: 500 });

    const url = new URL('https://api.neynar.com/v2/farcaster/user');
    url.searchParams.set('fid', String(fid));
    const resp = await fetch(url.toString(), {
      headers: { 'x-api-key': apiKey },
      cache: 'no-store',
    });
    if (!resp.ok) return Response.json({ error: 'Failed to fetch profile' }, { status: resp.status });
    const data = await resp.json();

    // Pass through with a normalized shape
    const out = {
      fid,
      username: data?.user?.username || data?.username,
      displayName: data?.user?.display_name || data?.displayName,
      avatar: data?.user?.pfp_url || data?.avatar,
      bio: data?.user?.profile?.bio?.text || null,
      followers: data?.user?.follower_count ?? null,
      following: data?.user?.following_count ?? null,
      verified: Boolean(data?.user?.verifications?.length),
      score: data?.user?.score ?? null,
      lastSeen: data?.user?.viewer_context?.last_seen_at ?? null,
      channels: data?.user?.channels || [],
    };

    return Response.json(out);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return Response.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
