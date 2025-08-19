const NEYNAR_API_BASE = 'https://api.neynar.com';

export interface NeynarUser {
  fid: number;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  score?: number;
  verified: boolean;
}

export interface NeynarFollowersResponse {
  users: NeynarUser[];
  pagination: {
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export interface NeynarCast {
  hash: string;
  author: NeynarUser;
  text: string;
  timestamp: string;
  reactions: {
    likes: number;
    recasts: number;
    replies: number;
  };
  channel?: string;
}

export class NeynarAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${NEYNAR_API_BASE}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get user profile
  async getUser(fid: number): Promise<NeynarUser> {
    return this.request<NeynarUser>(`/v2/farcaster/user?fid=${fid}`);
  }

  // Get user followers
  async getFollowers(
    fid: number,
    options: {
      limit?: number;
      sortType?: 'algorithmic' | 'recent';
      viewerFid?: number;
      cursor?: string;
    } = {}
  ): Promise<NeynarFollowersResponse> {
    const params: Record<string, string> = { fid: fid.toString() };
    
    if (options.limit) params.limit = options.limit.toString();
    if (options.sortType) params.sort_type = options.sortType;
    if (options.viewerFid) params.viewer_fid = options.viewerFid.toString();
    if (options.cursor) params.cursor = options.cursor;

    return this.request<NeynarFollowersResponse>('/v2/farcaster/user/followers', params);
  }

  // Get user following
  async getFollowing(
    fid: number,
    options: {
      limit?: number;
      sortType?: 'algorithmic' | 'recent';
      viewerFid?: number;
      cursor?: string;
    } = {}
  ): Promise<NeynarFollowersResponse> {
    const params: Record<string, string> = { fid: fid.toString() };
    
    if (options.limit) params.limit = options.limit.toString();
    if (options.sortType) params.sort_type = options.sortType;
    if (options.viewerFid) params.viewer_fid = options.viewerFid.toString();
    if (options.cursor) params.cursor = options.cursor;

    return this.request<NeynarFollowersResponse>('/v2/farcaster/user/following', params);
  }

  // Get user feed/casts
  async getUserFeed(
    fid: number,
    options: {
      limit?: number;
      cursor?: string;
    } = {}
  ): Promise<{ casts: NeynarCast[]; pagination: { hasNextPage: boolean; nextCursor?: string } }> {
    const params: Record<string, string> = { fid: fid.toString() };
    
    if (options.limit) params.limit = options.limit.toString();
    if (options.cursor) params.cursor = options.cursor;

    return this.request('/v2/farcaster/feed/user', params);
  }

  // Get bulk users by FIDs
  async getBulkUsers(fids: number[]): Promise<NeynarUser[]> {
    const params: Record<string, string> = { fids: fids.join(',') };
    return this.request<NeynarUser[]>('/v2/farcaster/user/bulk', params);
  }

  // Get mutual followers
  async getMutualFollowers(fid1: number, fid2: number): Promise<NeynarUser[]> {
    const [followers1, followers2] = await Promise.all([
      this.getFollowers(fid1, { limit: 1000 }),
      this.getFollowers(fid2, { limit: 1000 })
    ]);

    const followers1Set = new Set(followers1.users.map(u => u.fid));
    const followers2Set = new Set(followers2.users.map(u => u.fid));

    const mutualFids = [...followers1Set].filter(fid => followers2Set.has(fid));
    
    if (mutualFids.length === 0) return [];
    
    return this.getBulkUsers(mutualFids);
  }

  // Calculate Jaccard similarity between two users
  async calculateOverlap(fid1: number, fid2: number): Promise<{
    jaccardSimilarity: number;
    sharedFollowers: number;
    totalFollowers1: number;
    totalFollowers2: number;
  }> {
    const [followers1, followers2] = await Promise.all([
      this.getFollowers(fid1, { limit: 1000 }),
      this.getFollowers(fid2, { limit: 1000 })
    ]);

    const followers1Set = new Set(followers1.users.map(u => u.fid));
    const followers2Set = new Set(followers2.users.map(u => u.fid));

    const intersection = new Set([...followers1Set].filter(fid => followers2Set.has(fid)));
    const union = new Set([...followers1Set, ...followers2Set]);

    return {
      jaccardSimilarity: intersection.size / union.size,
      sharedFollowers: intersection.size,
      totalFollowers1: followers1.users.length,
      totalFollowers2: followers2.users.length,
    };
  }

  // Get engagement data for a user
  async getEngagementData(fid: number, days: number = 30): Promise<{
    totalReplies: number;
    totalLikes: number;
    totalRecasts: number;
    totalTips: number;
    hourlyEngagement: number[]; // 168-dimensional vector (7 days * 24 hours)
  }> {
    const feed = await this.getUserFeed(fid, { limit: 100 });
    
    // Calculate engagement from casts
    let totalReplies = 0;
    let totalLikes = 0;
    let totalRecasts = 0;
    let totalTips = 0;
    
    feed.casts.forEach(cast => {
      totalReplies += cast.reactions.replies;
      totalLikes += cast.reactions.likes;
      totalRecasts += cast.reactions.recasts;
      // Tips would need to be calculated from separate API calls
    });

    // Create hourly engagement vector (simplified)
    const hourlyEngagement = new Array(168).fill(0);
    // In production, you'd analyze cast timestamps and engagement patterns

    return {
      totalReplies,
      totalLikes,
      totalRecasts,
      totalTips,
      hourlyEngagement,
    };
  }
}

// Singleton instance
let neynarInstance: NeynarAPI | null = null;

export function getNeynarAPI(): NeynarAPI {
  if (!neynarInstance) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY environment variable is required');
    }
    neynarInstance = new NeynarAPI(apiKey);
  }
  return neynarInstance;
}
