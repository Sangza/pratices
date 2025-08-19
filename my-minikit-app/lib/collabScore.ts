export interface CollabScoreInput {
  overlap: number; // Jaccard similarity of followers
  engagementAffinity: number; // Cosine similarity of engagement vectors
  topicSimilarity: number; // TF-IDF similarity of cast content
  audienceQuality: number; // Mean quality score of shared followers
  momentum: number; // Recent engagement growth comparison
}

export interface CollabScoreResult {
  score: number; // 0-100
  reasons: string[];
  breakdown: {
    overlap: number;
    engagementAffinity: number;
    topicSimilarity: number;
    audienceQuality: number;
    momentum: number;
  };
}

export const COLLAB_SCORE_WEIGHTS = {
  overlap: 0.35,
  engagementAffinity: 0.20,
  topicSimilarity: 0.20,
  audienceQuality: 0.15,
  momentum: 0.10,
} as const;

export function calculateCollabScore(input: CollabScoreInput): CollabScoreResult {
  const { overlap, engagementAffinity, topicSimilarity, audienceQuality, momentum } = input;
  
  // Calculate weighted score
  const score = 100 * (
    COLLAB_SCORE_WEIGHTS.overlap * overlap +
    COLLAB_SCORE_WEIGHTS.engagementAffinity * engagementAffinity +
    COLLAB_SCORE_WEIGHTS.topicSimilarity * topicSimilarity +
    COLLAB_SCORE_WEIGHTS.audienceQuality * audienceQuality +
    COLLAB_SCORE_WEIGHTS.momentum * momentum
  );

  // Generate reasons based on high-scoring factors
  const reasons: string[] = [];
  
  if (overlap >= 0.1) {
    reasons.push(`${Math.round(overlap * 100)}% shared followers`);
  }
  
  if (engagementAffinity >= 0.7) {
    reasons.push("High overlap in engagement patterns");
  }
  
  if (topicSimilarity >= 0.6) {
    reasons.push("Similar content topics");
  }
  
  if (audienceQuality >= 0.8) {
    reasons.push("High-quality shared audience");
  }
  
  if (momentum >= 0.5) {
    reasons.push("Growing engagement momentum");
  }

  // Add channel-specific insights if available
  if (overlap >= 0.05) {
    reasons.push("Active in similar channels");
  }

  return {
    score: Math.round(score),
    reasons,
    breakdown: {
      overlap: Math.round(overlap * 100),
      engagementAffinity: Math.round(engagementAffinity * 100),
      topicSimilarity: Math.round(topicSimilarity * 100),
      audienceQuality: Math.round(audienceQuality * 100),
      momentum: Math.round(momentum * 100),
    }
  };
}

// Jaccard similarity calculation
export function calculateJaccardSimilarity(setA: Set<number>, setB: Set<number>): number {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

// Cosine similarity calculation for engagement vectors
export function calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// TF-IDF similarity calculation (simplified)
export function calculateTopicSimilarity(textA: string, textB: string): number {
  // This is a simplified implementation
  // In production, you'd use a proper TF-IDF library
  const wordsA = new Set(textA.toLowerCase().split(/\s+/));
  const wordsB = new Set(textB.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...wordsA].filter(word => wordsB.has(word)));
  const union = new Set([...wordsA, ...wordsB]);
  
  return intersection.size / union.size;
}

// Engagement momentum calculation
export function calculateMomentum(
  recentEngagement: number,
  previousEngagement: number
): number {
  if (previousEngagement === 0) return 0;
  const growth = (recentEngagement - previousEngagement) / previousEngagement;
  return Math.max(0, Math.min(1, (growth + 1) / 2)); // Normalize to 0-1
}
