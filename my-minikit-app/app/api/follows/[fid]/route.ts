import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const { fid } = params;
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'followers').toLowerCase(); // 'followers' or 'following'
    const limit = parseInt(searchParams.get('limit') || '1000');
    const sortType = (searchParams.get('sort_type') || 'algorithmic').toLowerCase() as 'algorithmic' | 'recent';

    // Prefer live data if NEYNAR_API_KEY is configured
    const apiKey = process.env.NEYNAR_API_KEY;
    if (apiKey) {
      try {
        const url = new URL(`https://api.neynar.com/v2/farcaster/user/${type}`);
        url.searchParams.set('fid', fid);
        url.searchParams.set('limit', String(limit));
        url.searchParams.set('sort_type', sortType);

        const resp = await fetch(url.toString(), {
          headers: { 'x-api-key': apiKey },
          cache: 'no-store',
        });

        if (resp.ok) {
          const data = await resp.json();
          return NextResponse.json(data);
        }
      } catch (e) {
        // fall through to mock if live call fails
        // eslint-disable-next-line no-console
        console.warn('Neynar fetch failed, using mock:', e);
      }
    }

    // Mock data with sorting behavior mirroring sortType
    const users = Array.from({ length: Math.min(limit, 50) }, (_, i) => ({
      fid: 1000 + i,
      username: `user${i}.eth`,
      displayName: `User ${i}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
      bio: `Bio for user ${i}`,
      followers: Math.floor(Math.random() * 10000) + 100,
      following: Math.floor(Math.random() * 500) + 50,
      score: Math.random(),
      verified: Math.random() > 0.8,
      // pseudo timestamp for recent sorting
      ts: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30),
    }));

    const sortedUsers = [...users].sort((a, b) => {
      if (sortType === 'recent') return b.ts - a.ts;
      // 'algorithmic' — sort by followers then score
      if (b.followers !== a.followers) return b.followers - a.followers;
      return b.score - a.score;
    });

    return NextResponse.json({
      fid: parseInt(fid, 10),
      type,
      users: sortedUsers,
      pagination: {
        hasNextPage: false,
        nextCursor: null,
      },
    });
  } catch (error) {
    console.error('Error fetching follows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follows' },
      { status: 500 }
    );
  }
}
