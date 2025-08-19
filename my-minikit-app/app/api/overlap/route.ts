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

    // Mock overlap calculation
    const mockOverlap = {
      fidA: parseInt(fidA, 10),
      fidB: parseInt(fidB, 10),
      jaccardSimilarity: 0.12,
      sharedFollowers: 1847,
      totalFollowersA: 15420,
      totalFollowersB: 8920,
      sharedTopFans: [
        {
          fid: 1234,
          username: "superfan.eth",
          displayName: "Super Fan",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=superfan",
          contributions: 1250,
          engagement: 0.85
        },
        {
          fid: 5678,
          username: "crypto_lover",
          displayName: "Crypto Lover",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto",
          contributions: 980,
          engagement: 0.72
        },
        {
          fid: 9012,
          username: "web3_enthusiast",
          displayName: "Web3 Enthusiast",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=web3",
          contributions: 845,
          engagement: 0.68
        }
      ],
      overlapByChannel: [
        { channel: "/tech", overlap: 0.25 },
        { channel: "/crypto", overlap: 0.18 },
        { channel: "/music", overlap: 0.12 },
        { channel: "/art", overlap: 0.08 },
        { channel: "/gaming", overlap: 0.05 }
      ],
      engagementAffinity: 0.76,
      topicSimilarity: 0.68,
      audienceQuality: 0.82,
      momentum: 0.45
    };

    return Response.json(mockOverlap);
  } catch (error) {
    console.error('Error calculating overlap:', error);
    return Response.json(
      { error: 'Failed to calculate overlap' },
      { status: 500 }
    );
  }
}
