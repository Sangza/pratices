"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy, Heart, MessageCircle, Share2, Gift, TrendingUp, TrendingDown, Crown } from "lucide-react";

interface TopFan {
  fid: number;
  username: string;
  displayName: string;
  avatar: string;
  score: number;
  contributions: {
    replies: number;
    likes: number;
    recasts: number;
    tips: number;
    tipsValue: number;
  };
  trend: 'up' | 'down' | 'stable';
  rank: number;
  badge?: string;
}

export default function Leaderboard() {
  const [timeWindow, setTimeWindow] = useState<'7d' | '30d' | 'all'>('30d');
  const [topFans] = useState<TopFan[]>([
    {
      fid: 1234,
      username: "superfan.eth",
      displayName: "Super Fan",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=superfan",
      score: 1250,
      contributions: {
        replies: 45,
        likes: 120,
        recasts: 23,
        tips: 5,
        tipsValue: 150
      },
      trend: 'up',
      rank: 1,
      badge: 'Crown'
    },
    {
      fid: 5678,
      username: "crypto_lover",
      displayName: "Crypto Lover",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto",
      score: 980,
      contributions: {
        replies: 32,
        likes: 89,
        recasts: 18,
        tips: 3,
        tipsValue: 75
      },
      trend: 'up',
      rank: 2,
      badge: 'Gold'
    },
    {
      fid: 9012,
      username: "web3_enthusiast",
      displayName: "Web3 Enthusiast",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=web3",
      score: 845,
      contributions: {
        replies: 28,
        likes: 76,
        recasts: 15,
        tips: 2,
        tipsValue: 50
      },
      trend: 'stable',
      rank: 3,
      badge: 'Silver'
    },
  ]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case 'Crown':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'Gold':
        return <div className="w-5 h-5 bg-yellow-400 rounded-full" />;
      case 'Silver':
        return <div className="w-5 h-5 bg-gray-400 rounded-full" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Top Fans Leaderboard</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Your most engaged supporters</p>
          </div>
          <div className="flex space-x-2">
            {(['7d', '30d', 'all'] as const).map((window) => (
              <button
                key={window}
                onClick={() => setTimeWindow(window)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeWindow === window
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {window === 'all' ? 'All Time' : window}
              </button>
            ))}
          </div>
        </div>

        {/* Scoring Info */}
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">How scoring works:</h4>
          <div className="grid md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span>Replies: 5x</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <Share2 className="w-4 h-4 text-green-600" />
              <span>Recasts: 2x</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <Heart className="w-4 h-4 text-red-600" />
              <span>Likes: 1x</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <Gift className="w-4 h-4 text-purple-600" />
              <span>Tips: 0.5x</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span>+ Value bonus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Contributors</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {topFans.map((fan, index) => (
            <div key={fan.fid} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                      index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {fan.rank}
                    </div>
                    {getBadgeIcon(fan.badge)}
                  </div>

                  {/* Avatar and Info */}
                  <Image
                    src={fan.avatar}
                    alt={fan.displayName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{fan.displayName}</h4>
                    <p className="text-gray-600 dark:text-gray-300">@{fan.username}</p>
                  </div>
                </div>

                {/* Score and Trend */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{fan.score.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">points</p>
                  </div>
                  {getTrendIcon(fan.trend)}
                </div>
              </div>

              {/* Contributions Breakdown */}
              <div className="mt-4 grid md:grid-cols-5 gap-4 text-sm text-gray-700 dark:text-gray-200">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span>{fan.contributions.replies} replies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span>{fan.contributions.likes} likes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-green-600" />
                  <span>{fan.contributions.recasts} recasts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span>{fan.contributions.tips} tips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span>${fan.contributions.tipsValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Rewards */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Monthly Fan Rewards</h3>
            <p className="text-purple-100">Top fans get exclusive badges and recognition</p>
          </div>
          <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            View Rewards
          </button>
        </div>
      </div>
    </div>
  );
}
