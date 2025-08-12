'use client'

import { useState } from 'react'
import { LeaderboardEntry } from '@/types'

interface RankingsPageProps {
  leaderboard: LeaderboardEntry[]
  currentUserId?: string
}

export default function RankingsPage({ leaderboard, currentUserId }: RankingsPageProps) {
  const [activeTab, setActiveTab] = useState<'total' | 'weekly'>('total')
  
  const sortedLeaderboard = [...leaderboard].sort((a, b) => 
    activeTab === 'total' 
      ? b.totalTokens - a.totalTokens 
      : b.weeklyTokens - a.weeklyTokens
  )

  const userRank = sortedLeaderboard.findIndex(entry => entry.user.id === currentUserId) + 1

  const getRankIcon = (rank: number) => {
    return `#${rank}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Rankings
        </h1>
        <p className="text-gray-600">
          Top contributors in the Daily Spark community
        </p>
        {userRank > 0 && (
          <p className="text-sm text-[#0052FF] font-medium mt-2">
            You're ranked #{userRank}!
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab('total')}
          className={`flex-1 py-3 px-6 text-sm font-medium rounded-xl transition-all duration-200 ${
            activeTab === 'total'
              ? 'bg-white text-[#0052FF] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-3 px-6 text-sm font-medium rounded-xl transition-all duration-200 ${
            activeTab === 'weekly'
              ? 'bg-white text-[#0052FF] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          This Week
        </button>
      </div>

      {/* Prize Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 text-center">
          Weekly Rewards
        </h2>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <div className="text-lg font-bold mb-1">#1</div>
            <div className="font-semibold">1st Place</div>
            <div className="text-xs text-gray-600">500 bonus tokens</div>
          </div>
          <div>
            <div className="text-lg font-bold mb-1">#2</div>
            <div className="font-semibold">2nd Place</div>
            <div className="text-xs text-gray-600">300 bonus tokens</div>
          </div>
          <div>
            <div className="text-lg font-bold mb-1">#3</div>
            <div className="font-semibold">3rd Place</div>
            <div className="text-xs text-gray-600">200 bonus tokens</div>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 text-center text-sm font-medium text-gray-600">Rank</div>
          <div className="flex-1 text-sm font-medium text-gray-600">Player</div>
          <div className="flex items-center space-x-8 text-sm font-medium text-gray-600">
            <span>Tokens</span>
            <span>Popular</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {sortedLeaderboard.map((entry, index) => {
          const rank = index + 1
          const isCurrentUser = entry.user.id === currentUserId
          const tokens = activeTab === 'total' ? entry.totalTokens : entry.weeklyTokens
          
          return (
            <div
              key={entry.user.id}
              className={`bg-white rounded-2xl p-4 border transition-all duration-200 ${
                isCurrentUser 
                  ? 'border-[#0052FF] bg-[#0052FF]/5' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${
                  rank <= 3 
                    ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getRankIcon(rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{entry.user.avatar || '👤'}</span>
                    <h3 className={`font-semibold truncate ${
                      isCurrentUser ? 'text-[#0052FF]' : 'text-gray-900'
                    }`}>
                      {entry.user.username}
                      {isCurrentUser && <span className="text-sm ml-1">(You)</span>}
                    </h3>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-8 text-sm">
                  <span className="font-medium text-gray-900">{tokens.toLocaleString()}</span>
                  <span className="font-medium text-gray-900">{entry.popularAnswers}</span>
                </div>

              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Padding for Navigation */}
      <div className="h-20" />
    </div>
  )
}