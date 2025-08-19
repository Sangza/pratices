"use client";
import { useState, useEffect } from "react";
import { Trophy, Medal, Star, TrendingUp, MessageCircle, Heart, Repeat, Gift } from "lucide-react";
import Image from "next/image";

interface Fan {
  fid: string;
  displayName: string;
  username: string;
  avatar: string;
  contributions: {
    comments: number;
    reposts: number;
    likes: number;
    tipsValue: number;
  };
  totalScore: number;
  rank: number;
  badges: string[];
  lastActive: string;
}

export default function Leaderboard() {
  const [fans, setFans] = useState<Fan[]>([]);
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
          fetchLeaderboard(sessionData.fid);
        }
      }
    } catch (error) {
      console.error("Failed to check session:", error);
    }
  };

  const fetchLeaderboard = async (fid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaderboard/${fid}`);
      if (res.ok) {
        const data = await res.json();
        setFans(data.fans || []);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.authenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Sign in to view your leaderboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your Farcaster account to see your top fans and their contributions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Engagement Leaderboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your top fans ranked by engagement, contributions, and support.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your top fans...</p>
        </div>
      ) : fans.length > 0 ? (
        <div className="space-y-4">
          {fans.map((fan, index) => (
            <div
              key={fan.fid}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {fan.rank <= 3 && (
                      <div className="absolute -top-2 -right-2">
                        {fan.rank === 1 && <Trophy className="w-6 h-6 text-yellow-500" />}
                        {fan.rank === 2 && <Medal className="w-6 h-6 text-gray-400" />}
                        {fan.rank === 3 && <Star className="w-6 h-6 text-orange-500" />}
                      </div>
                    )}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {fan.rank}
                    </div>
                  </div>
                  
                  <Image
                    src={fan.avatar}
                    alt={fan.displayName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {fan.displayName}
                    </h3>
                    <p className="text-purple-600 dark:text-purple-400 font-medium">
                      @{fan.username}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {fan.badges.map((badge, badgeIndex) => (
                        <span
                          key={badgeIndex}
                          className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {fan.totalScore.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Comments</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {fan.contributions.comments}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                      <Repeat className="w-4 h-4" />
                      <span className="text-sm">Reposts</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {fan.contributions.reposts}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Likes</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {fan.contributions.likes}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                      <Gift className="w-4 h-4" />
                      <span className="text-sm">Tips</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${fan.contributions.tipsValue.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Last active: {fan.lastActive}</span>
                  <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No fans yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start engaging with your audience to build your leaderboard.
          </p>
        </div>
      )}
    </div>
  );
}
