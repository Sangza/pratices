"use client";

import { useState } from "react";
import { Clock, TrendingUp, Users, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface AnalyticsData {
  followers: number;
  following: number;
  engagement: number;
  bestTimes: string[];
  heatmapData: any[];
  overlapData: any[];
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [analyticsData] = useState<AnalyticsData>({
    followers: 15420,
    following: 892,
    engagement: 23.4,
    bestTimes: ["Wednesday 18-20h", "Friday 14-16h", "Sunday 12-14h"],
    heatmapData: [
      { day: 'Mon', hour: 18, value: 40 },
      { day: 'Wed', hour: 19, value: 36 },
      { day: 'Fri', hour: 15, value: 28 },
    ],
    overlapData: [
      { name: 'Tech', value: 45, color: '#6366F1' },
      { name: 'Crypto', value: 32, color: '#10B981' },
      { name: 'Music', value: 28, color: '#F59E0B' },
      { name: 'Art', value: 22, color: '#EF4444' },
      { name: 'Gaming', value: 18, color: '#8B5CF6' },
    ]
  });

  const engagementData = [
    { name: 'Replies', value: 45, color: '#6366F1' },
    { name: 'Likes', value: 32, color: '#10B981' },
    { name: 'Recasts', value: 28, color: '#F59E0B' },
    { name: 'Tips', value: 15, color: '#EF4444' },
  ];

  const getHeatmapColor = (value: number) => {
    if (value >= 35) return '#4338CA';
    if (value >= 25) return '#6366F1';
    if (value >= 15) return '#A5B4FC';
    if (value >= 5) return '#E0E7FF';
    return '#F3F4F6';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Followers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analyticsData.followers.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Following</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analyticsData.following.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analyticsData.engagement}%</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Best Time</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Wed 18-20h</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Engagement Analytics</h3>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Engagement Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip wrapperStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#fff' }} />
              <Bar dataKey="value">
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Posting Times */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Best Posting Times</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {analyticsData.bestTimes.map((time, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{time}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Peak engagement</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Interests */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Audience Interests</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.overlapData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" width={80} stroke="#6b7280" />
              <Tooltip wrapperStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#fff' }} />
              <Bar dataKey="value">
                {analyticsData.overlapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Heatmap (simple grid) */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Engagement Heatmap</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">When your audience is most active (last 30 days)</p>
        
        <div className="grid grid-cols-[60px_repeat(24,minmax(0,1fr))] gap-1">
          <div></div>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="text-[10px] text-gray-500 dark:text-gray-400 text-center py-1">{i}</div>
          ))}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <>
              <div key={`label-${day}`} className="text-xs text-gray-500 dark:text-gray-400 py-1 pr-2 text-right">{day}</div>
              {Array.from({ length: 24 }, (_, hour) => {
                const data = analyticsData.heatmapData.find(d => d.day === day && d.hour === hour);
                const value = data?.value || 0;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="h-5 rounded-sm border border-gray-200 dark:border-gray-800"
                    style={{ backgroundColor: getHeatmapColor(value) }}
                    title={`${day} ${hour}:00 - ${value} engagements`}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
