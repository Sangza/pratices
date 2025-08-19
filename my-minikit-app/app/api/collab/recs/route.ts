type NeynarUserLite = { fid: number; username?: string; display_name?: string; pfp_url?: string; score?: number };

type CandidateScore = {
  fid: number;
  username: string;
  displayName: string;
  avatar: string;
  overlap: number;
  engagementAffinity: number;
  topicSimilarity: number;
  audienceQuality: number | null;
  momentum: number;
  score: number;
  reasons: string[];
};

const WEIGHTS = {
  overlap: 0.35,
  engagementAffinity: 0.20,
  topicSimilarity: 0.20,
  audienceQuality: 0.15,
  momentum: 0.10,
} as const;

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function hourOfWeek(dateIso: string): number {
  const d = new Date(dateIso);
  const day = (d.getUTCDay() + 6) % 7; // 0=Mon
  const hour = d.getUTCHours();
  return day * 24 + hour; // 0..167
}

function buildHoWVector(casts: any[]): number[] {
  const v = new Array(168).fill(0);
  for (const c of casts) {
    const idx = hourOfWeek(c?.timestamp || c?.published_at || new Date().toISOString());
    const weight = (c?.reactions?.replies || 0) * 5 + (c?.reactions?.recasts || 0) * 2 + (c?.reactions?.likes || 0);
    v[idx] += weight || 0.5;
  }
  return v;
}

function tokenize(text: string): Set<string> {
  return new Set((text || "").toLowerCase().replace(/[^a-z0-9_\s#/]/g, " ").split(/\s+/).filter(Boolean));
}

function topicSim(textsA: string[], textsB: string[]): number {
  const A = new Set<string>();
  const B = new Set<string>();
  textsA.forEach(t => tokenize(t).forEach(w => A.add(w)));
  textsB.forEach(t => tokenize(t).forEach(w => B.add(w)));
  const inter = new Set([...A].filter(x => B.has(x)));
  const union = new Set([...A, ...B]);
  return union.size ? inter.size / union.size : 0;
}

function recentMomentum(casts: any[], days = 28): number {
  const now = Date.now();
  const msDay = 86400000;
  const recent = casts.filter(c => now - new Date(c?.timestamp || c?.published_at).getTime() <= (days/2)*msDay);
  const prior = casts.filter(c => {
    const dt = now - new Date(c?.timestamp || c?.published_at).getTime();
    return dt > (days/2)*msDay && dt <= days*msDay;
  });
  const sum = (arr: any[]) => arr.reduce((s, c) => s + (c?.reactions?.replies||0)*5 + (c?.reactions?.recasts||0)*2 + (c?.reactions?.likes||0), 0);
  const a = sum(recent), b = sum(prior);
  if (!b) return a ? 1 : 0;
  const g = (a - b) / b; // growth
  return Math.max(0, Math.min(1, (g + 1) / 2));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fidStr = searchParams.get('fid');
    const limit = parseInt(searchParams.get('limit') || '10');
    if (!fidStr) return Response.json({ error: 'fid parameter is required' }, { status: 400 });

    const fid = parseInt(fidStr, 10);
    const apiKey = process.env.NEYNAR_API_KEY || '';
    if (!apiKey) return Response.json({ error: 'Server missing NEYNAR_API_KEY' }, { status: 500 });
    const headers = { 'x-api-key': apiKey } as const;

    // 1) Candidates: users the creator is following (up to 25)
    const followingUrl = new URL('https://api.neynar.com/v2/farcaster/user/following');
    followingUrl.searchParams.set('fid', String(fid));
    followingUrl.searchParams.set('limit', '25');
    followingUrl.searchParams.set('sort_type', 'algorithmic');
    const followingResp = await fetch(followingUrl.toString(), { headers, cache: 'no-store' });
    if (!followingResp.ok) return Response.json({ error: 'Failed to fetch following' }, { status: 502 });
    const following = await followingResp.json();
    const candidates: NeynarUserLite[] = (following?.users || []).map((u: any) => ({
      fid: u.fid, username: u.username, display_name: u.display_name, pfp_url: u.pfp_url, score: u.score
    }));

    // 2) Fetch creator followers once
    const followersUrlA = new URL('https://api.neynar.com/v2/farcaster/user/followers');
    followersUrlA.searchParams.set('fid', String(fid));
    followersUrlA.searchParams.set('limit', '1000');
    followersUrlA.searchParams.set('sort_type', 'algorithmic');
    const followersAResp = await fetch(followersUrlA.toString(), { headers, cache: 'no-store' });
    const followersA = followersAResp.ok ? await followersAResp.json() : { users: [] };
    const setA = new Set<number>((followersA?.users || []).map((u: any) => u.fid));

    // 3) Creator recent casts & vectors/topics
    const feedAUrl = new URL('https://api.neynar.com/v2/farcaster/feed/user');
    feedAUrl.searchParams.set('fid', String(fid)); feedAUrl.searchParams.set('limit', '100');
    const feedAResp = await fetch(feedAUrl.toString(), { headers, cache: 'no-store' });
    const feedA = feedAResp.ok ? await feedAResp.json() : { casts: [] };
    const vecA = buildHoWVector(feedA?.casts || []);
    const textsA = (feedA?.casts || []).map((c: any) => c?.text || "");
    const momentumA = recentMomentum(feedA?.casts || []);

    // 4) Score candidates (sequential with small cap to respect rate limits)
    const scored: CandidateScore[] = [];
    for (const c of candidates) {
      try {
        // Followers for candidate
        const followersUrlB = new URL('https://api.neynar.com/v2/farcaster/user/followers');
        followersUrlB.searchParams.set('fid', String(c.fid));
        followersUrlB.searchParams.set('limit', '1000');
        followersUrlB.searchParams.set('sort_type', 'algorithmic');
        const followersBResp = await fetch(followersUrlB.toString(), { headers, cache: 'no-store' });
        if (!followersBResp.ok) continue;
        const followersB = await followersBResp.json();
        const setB = new Set<number>((followersB?.users || []).map((u: any) => u.fid));
        const inter = [...setA].filter(x => setB.has(x));
        const union = new Set<number>([...setA, ...setB]);
        const overlap = union.size ? inter.length / union.size : 0;

        // Candidate feed
        const feedBUrl = new URL('https://api.neynar.com/v2/farcaster/feed/user');
        feedBUrl.searchParams.set('fid', String(c.fid)); feedBUrl.searchParams.set('limit', '100');
        const feedBResp = await fetch(feedBUrl.toString(), { headers, cache: 'no-store' });
        if (!feedBResp.ok) continue;
        const feedB = await feedBResp.json();
        const vecB = buildHoWVector(feedB?.casts || []);
        const textsB = (feedB?.casts || []).map((x: any) => x?.text || "");

        const engAffinity = cosine(vecA, vecB);
        const topics = topicSim(textsA, textsB);
        const audQuality = typeof c.score === 'number' ? Math.max(0, Math.min(1, c.score)) : null;
        const momentumB = recentMomentum(feedB?.casts || []);

        const score = 100 * (
          WEIGHTS.overlap * overlap +
          WEIGHTS.engagementAffinity * engAffinity +
          WEIGHTS.topicSimilarity * topics +
          WEIGHTS.audienceQuality * (audQuality ?? 0.5) +
          WEIGHTS.momentum * momentumB
        );

        const reasons: string[] = [];
        if (overlap >= 0.05) reasons.push(`${Math.round(overlap * 100)}% shared followers`);
        if (engAffinity >= 0.6) reasons.push('Similar engagement hours');
        if (topics >= 0.5) reasons.push('Similar topics');
        if ((audQuality ?? 0.5) >= 0.7) reasons.push('High audience quality');
        if (momentumB >= 0.5) reasons.push('Recent momentum');

        scored.push({
          fid: c.fid,
          username: c.username || `user${c.fid}`,
          displayName: c.display_name || c.username || `User ${c.fid}`,
          avatar: c.pfp_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=candidate',
          overlap,
          engagementAffinity: engAffinity,
          topicSimilarity: topics,
          audienceQuality: audQuality,
          momentum: momentumB,
          score: Math.round(score),
          reasons,
        });
      } catch {
        // skip candidate on failure
      }
      if (scored.length >= 50) break;
    }

    const recommendations = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return Response.json({ fid, recommendations, algorithm: { weights: WEIGHTS, version: '1.0' } });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return Response.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
