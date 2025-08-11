'use client'

import React from 'react'
import { User, TokenReward } from '@/types'
import WalletConnect from './WalletConnect'

interface ProfilePageProps {
  user: User
  tokenRewards: TokenReward[]
}

export default function ProfilePage({ user, tokenRewards }: ProfilePageProps) {
  const [walletInfo, setWalletInfo] = React.useState<{
    name?: string
    avatar?: string
    address?: string
  }>({})
  
  const recentRewards = tokenRewards.slice(0, 5)
  const streakMultiplier = user.streak >= 30 ? 3 : user.streak >= 7 ? 2 : 1

  // Debug wallet info state
  React.useEffect(() => {
    console.log('🔄 ProfilePage walletInfo state updated:', {
      name: walletInfo.name || 'No name',
      avatar: walletInfo.avatar || 'No avatar',
      address: walletInfo.address ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}` : 'No address'
    })
  }, [walletInfo])

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-gradient-to-br from-[#0052FF] to-[#0052FF]/60 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto overflow-hidden">
          {walletInfo.avatar ? (
            <img src={walletInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user.avatar || '👤'
          )}
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {walletInfo.name || user.username}
        </h1>
        <p className="text-gray-600">
          Sparking conversations since joining
        </p>
        {walletInfo.address && (
          <p className="text-sm text-gray-500 mt-2 font-mono">
            {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
          </p>
        )}
      </div>

      {/* Wallet Connection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Wallet Connection
        </h2>
        <WalletConnect 
          onWalletInfo={(info) => {
            console.log('📥 ProfilePage received wallet info:', {
              name: info.name || 'No name',
              avatar: info.avatar || 'No avatar', 
              address: info.address ? `${info.address.slice(0, 6)}...${info.address.slice(-4)}` : 'No address'
            })
            setWalletInfo(info)
          }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-[#0052FF] mb-1">
            {user.tokens.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Tokens</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-orange-500 mb-1 flex items-center justify-center">
            🔥 {user.streak}
          </div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-500 mb-1">
            {user.totalUpvotesReceived}
          </div>
          <div className="text-sm text-gray-600">Upvotes Received</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-purple-500 mb-1">
            {user.earlyBirdCount}
          </div>
          <div className="text-sm text-gray-600">Early Bird Answers</div>
        </div>
      </div>

      {/* Streak Bonus Info */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🔥</span>
          <div>
            <h3 className="font-semibold text-gray-900">
              Streak Multiplier: {streakMultiplier}x
            </h3>
            <p className="text-sm text-gray-600">
              {user.streak >= 30 
                ? "Amazing! 30-day streak = 3x all rewards"
                : user.streak >= 7
                ? "Great! 7-day streak = 2x all rewards"
                : `Keep it up! ${7 - user.streak} days until 2x multiplier`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Recent Token Rewards */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Rewards
        </h2>
        {recentRewards.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No rewards yet. Answer today's question to start earning!
          </p>
        ) : (
          <div className="space-y-3">
            {recentRewards.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {reward.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(reward.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-lg font-semibold text-[#0052FF]">
                  +{reward.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Token Earning Guide */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💰 How to Earn Tokens
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Answer daily question</span>
            <span className="font-semibold text-[#0052FF]">10 tokens</span>
          </div>
          <div className="flex justify-between">
            <span>First 10 responses (Early Bird)</span>
            <span className="font-semibold text-[#0052FF]">+15 tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Get 5+ upvotes on answer</span>
            <span className="font-semibold text-[#0052FF]">+25 tokens</span>
          </div>
          <div className="flex justify-between">
            <span>7-day streak bonus</span>
            <span className="font-semibold text-[#0052FF]">2x multiplier</span>
          </div>
          <div className="flex justify-between">
            <span>30-day streak bonus</span>
            <span className="font-semibold text-[#0052FF]">3x multiplier</span>
          </div>
          <div className="flex justify-between">
            <span>Community bonus (100+ answers)</span>
            <span className="font-semibold text-[#0052FF]">+10 tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Upvote others (max 5/day)</span>
            <span className="font-semibold text-[#0052FF]">+5 tokens each</span>
          </div>
        </div>
      </div>
    </div>
  )
}