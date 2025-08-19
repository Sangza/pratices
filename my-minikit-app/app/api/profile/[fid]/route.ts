import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const { fid } = params;
    
    // In production, this would use the Neynar API
    // const response = await fetch(
    //   `https://api.neynar.com/v2/farcaster/user?fid=${fid}`,
    //   {
    //     headers: {
    //       'x-api-key': process.env.NEYNAR_API_KEY!,
    //     },
    //   }
    // );
    
    // Mock data for demonstration
    const mockProfile = {
      fid: parseInt(fid),
      username: "creator.eth",
      displayName: "Creator Name",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creator",
      bio: "Building the future of social media",
      followers: 15420,
      following: 892,
      casts: 1234,
      engagement: 23.4,
      score: 0.85,
      lastSeen: new Date().toISOString(),
      channels: ["/tech", "/crypto", "/music"],
      verified: true
    };

    return NextResponse.json(mockProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
