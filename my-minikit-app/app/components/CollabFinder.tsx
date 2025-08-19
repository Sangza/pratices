"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Users, TrendingUp, MessageCircle, Star } from "lucide-react";

interface Creator {
  fid: number;
  username: string;
  displayName: string;
  avatar: string;
  score: number;
  reasons: string[];
  overlap: number;
  followers: number;
}

export default function CollabFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState<Creator[]>([]);

  const mockRecommendations: Creator[] = [
    {
      fid: 1234,
      username: "alice.eth",
      displayName: "Alice Crypto",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      score: 87,
      reasons: ["12% shared followers", "High overlap in /music channel", "Peak hours align Wed 18-21h"],
      overlap: 0.12,
      followers: 15420
    },
    {
      fid: 5678,
      username: "bob.nft",
      displayName: "Bob the Builder",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      score: 76,
      reasons: ["8% shared followers", "Similar engagement patterns", "Both active in /tech"],
      overlap: 0.08,
      followers: 8920
    },
    {
      fid: 9012,
      username: "carol.web3",
      displayName: "Carol Creator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
      score: 65,
      reasons: ["5% shared followers", "Complementary audience", "Different time zones"],
      overlap: 0.05,
      followers: 23450
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRecommendations(mockRecommendations);
    setIsSearching(false);
  };

  const handleInviteCollab = (creator: Creator) => {
    const message = `Hey @${creator.username}! I found you through Creator Growth Hub - we have ${Math.round(creator.overlap * 100)}% audience overlap. Let's collaborate! 🚀`;
    console.log("Inviting to collab:", message);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30";
    if (score >= 60) return "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30";
    return "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30";
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Find Collaborators</h2>
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username (e.g., alice.eth)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 caret-purple-600"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recommended Collaborators</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Based on audience overlap and engagement patterns</p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recommendations.map((creator) => (
              <div key={creator.fid} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={creator.avatar}
                      alt={creator.displayName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{creator.displayName}</h4>
                      <p className="text-gray-600 dark:text-gray-300">@{creator.username}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{creator.followers.toLocaleString()} followers</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{Math.round(creator.overlap * 100)}% overlap</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(creator.score)}`}>
                      {creator.score}/100
                    </div>
                    <button
                      onClick={() => handleInviteCollab(creator)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Invite</span>
                    </button>
                  </div>
                </div>
                
                {/* Reasons */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Why this match?</h5>
                  <div className="flex flex-wrap gap-2">
                    {creator.reasons.map((reason, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 rounded-full text-sm"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">How Collab Finder Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Audience Overlap</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Find creators with shared followers for better reach</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Engagement Patterns</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Match based on when your audiences are most active</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Quality Score</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered recommendations based on multiple signals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
