"use client";

import { useState } from "react";
import { BarChart3, Trophy, Users, TrendingUp } from "lucide-react";
import CollabFinder from "./components/CollabFinder";
import Analytics from "./components/Analytics";
import Leaderboard from "./components/Leaderboard";
import AuthButton from "./components/AuthButton";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'collab' | 'analytics' | 'leaderboard'>('collab');

  const tabs = [
    {
      id: 'collab' as const,
      label: 'Collab Finder',
      icon: Users,
      description: 'Find creators to collaborate with'
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Social graph insights'
    },
    {
      id: 'leaderboard' as const,
      label: 'Leaderboard',
      icon: Trophy,
      description: 'Top fans & engagement'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Growth Hub</h1>
              <p className="text-gray-600 mt-1">Find collaborators, analyze your audience, and grow together</p>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="hidden sm:flex items-center space-x-2 text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Powered by Farcaster</span>
              </div>
              <AuthButton />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {activeTab === 'collab' && <CollabFinder />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </div>
    </div>
  );
}
