import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const { fid } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'followers'; // 'followers' or 'following'
    const limit = parseInt(searchParams.get('limit') || '1000');
    const sortType = searchParams.get('sort_type') || 'algorithmic';
    
    // In production, this would use the Neynar API
    // const response = await fetch(
    //   `https://api.neynar.com/v2/farcaster/user/${type}?fid=${fid}&sort_type=${sortType}&limit=${limit}`,
    //   {
    //     headers: {
    //       'x-api-key': process.env.NEYNAR_API_KEY!,
    //     },
    //   }
    // );
    
    // Mock data for demonstration
    const mockFollows = {
      fid: parseInt(fid),
      type,
      users: Array.from({ length: Math.min(limit, 50) }, (_, i) => ({
        fid: 1000 + i,
        username: `user${i}.eth`,
        displayName: `User ${i}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
        bio: `Bio for user ${i}`,
        followers: Math.floor(Math.random() * 10000) + 100,
        following: Math.floor(Math.random() * 500) + 50,
        score: Math.random(),
        verified: Math.random() > 0.8
      })),
      pagination: {
        hasNextPage: false,
        nextCursor: null
      }
    };

    return NextResponse.json(mockFollows);
  } catch (error) {
    console.error('Error fetching follows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follows' },
      { status: 500 }
    );
  }
}
