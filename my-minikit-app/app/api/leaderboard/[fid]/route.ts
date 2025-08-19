export async function GET(
  _request: Request,
  context: unknown
) {
  try {
    const { params } = context as { params: { fid: string } };
    const { fid } = params;

    // Mock leaderboard data
    const topFans = [
      {
        fid: 1234,
        username: 'superfan.eth',
        displayName: 'Super Fan',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superfan',
        score: 1250,
        contributions: {
          replies: 45,
          likes: 120,
          recasts: 23,
          tips: 5,
          tipsValue: 150,
        },
        trend: 'up' as const,
        rank: 1,
        badge: 'Crown',
      },
      {
        fid: 5678,
        username: 'crypto_lover',
        displayName: 'Crypto Lover',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=crypto',
        score: 980,
        contributions: {
          replies: 32,
          likes: 89,
          recasts: 18,
          tips: 3,
          tipsValue: 75,
        },
        trend: 'up' as const,
        rank: 2,
        badge: 'Gold',
      },
      {
        fid: 9012,
        username: 'web3_enthusiast',
        displayName: 'Web3 Enthusiast',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=web3',
        score: 845,
        contributions: {
          replies: 28,
          likes: 76,
          recasts: 15,
          tips: 2,
          tipsValue: 50,
        },
        trend: 'stable' as const,
        rank: 3,
        badge: 'Silver',
      },
    ];

    return Response.json({ fid: parseInt(fid, 10), topFans, window: '30d' });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
