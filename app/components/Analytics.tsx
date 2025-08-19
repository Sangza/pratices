"use client";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Clock, Activity, Target } from "lucide-react";
import { Fragment } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  overview: {
    totalFollowers: number;
    totalFollowing: number;
    totalCasts: number;
    avgEngagement: number;
  };
  engagementTrend: Array<{
    date: string;
    engagement: number;
  }>;
  bestPostingTimes: Array<{
    hour: number;
    engagement: number;
  }>;
  heatmap: Array<Array<number>>;
  topTopics: Array<{
    topic: string;
    count: number;
  }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
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
          fetchAnalytics(sessionData.fid);
        }
      }
    } catch (error) {
      console.error("Failed to check session:", error);
    }
  };

  const fetchAnalytics = async (fid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/${fid}`);
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.authenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Sign in to view analytics
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your Farcaster account to see your social graph insights.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No analytics data available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start posting and engaging to generate analytics insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Social Graph Analytics
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Deep insights into your audience, engagement patterns, and growth opportunities.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Followers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.overview.totalFollowers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Following</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.overview.totalFollowing.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Casts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.overview.totalCasts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.overview.avgEngagement.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Engagement Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.engagementTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Best Posting Times */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Best Posting Times
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.bestPostingTimes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="engagement" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Weekly Engagement Heatmap
        </h3>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid grid-cols-7 gap-1">
              <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                Hour
              </div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: 24 }, (_, hour) => (
                <Fragment key={hour}>
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
                    {hour}:00
                  </div>
                  {data.heatmap[hour]?.map((engagement, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-8 h-8 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs ${
                        engagement > 80
                          ? 'bg-purple-600 text-white'
                          : engagement > 60
                          ? 'bg-purple-500 text-white'
                          : engagement > 40
                          ? 'bg-purple-400 text-white'
                          : engagement > 20
                          ? 'bg-purple-300 text-gray-800'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                      title={`${engagement}% engagement`}
                    >
                      {engagement > 0 ? engagement : ''}
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Top Content Topics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.topTopics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ topic, percent }) => `${topic} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.topTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {data.topTopics.map((topic, index) => (
              <div key={topic.topic} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-gray-100">{topic.topic}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{topic.count} posts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
