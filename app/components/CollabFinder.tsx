"use client";
import { useState, useEffect } from "react";
import { Search, Users, TrendingUp, MessageCircle, Heart, Repeat } from "lucide-react";
import Image from "next/image";

interface Creator {
  fid: string;
  displayName: string;
  username: string;
  avatar: string;
  followerCount: number;
  followingCount: number;
  collabScore: number;
  overlap: number;
  topics: string[];
  engagement: number;
}

export default function CollabFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const sessionData = await res.json();
        setSession(sessionData);
        if (sessionData.authenticated && sessionData.fid) {
          fetchRecommendations(sessionData.fid);
        }
      }
    } catch (error) {
      console.error("Failed to check session:", error);
    }
  };

  const fetchRecommendations = async (fid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/collab/recs?fid=${fid}`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (session?.authenticated && session.fid) {
      fetchRecommendations(session.fid);
    }
  };

  if (!session?.authenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Sign in to find collaborators
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your Farcaster account to discover creators with similar audiences and interests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Find Your Next Collaboration
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Discover creators with similar audiences, complementary content, and high collaboration potential.
        </p>
        
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username, topics, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Finding the best collaborators...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-6">
          {recommendations.map((creator) => (
            <div
              key={creator.fid}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Image
                    src={creator.avatar}
                    alt={creator.displayName}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {creator.displayName}
                    </h3>
                    <p className="text-purple-600 dark:text-purple-400 font-medium">
                      @{creator.username}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {creator.followerCount.toLocaleString()} followers
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {creator.followingCount.toLocaleString()} following
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {creator.collabScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Collab Score</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Why this match?
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {creator.overlap}% audience overlap
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {creator.topics.slice(0, 5).map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {creator.engagement}% engagement
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      View Profile
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/collab/invite', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              targetFid: creator.fid,
                              targetUsername: creator.username,
                              message: `I'd love to collaborate! Your content on ${creator.topics.slice(0, 2).join(', ')} aligns perfectly with what I'm building. Let's create something amazing together!`
                            })
                          });
                          if (res.ok) {
                            const { deepLink } = await res.json();
                            window.open(deepLink, '_blank');
                          }
                        } catch (error) {
                          console.error('Failed to generate invite:', error);
                        }
                      }}
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Invite to Collab
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No recommendations yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try searching for specific topics or interests to find potential collaborators.
          </p>
        </div>
      )}
    </div>
  );
}
