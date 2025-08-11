'use client'

import { Answer, FeedTab } from '@/types'
import AnswerCard from './AnswerCard'

interface CommunityFeedProps {
  answers: Answer[]
  activeTab: FeedTab
  onTabChange: (tab: FeedTab) => void
  onLike: (answerId: string) => void
}

export default function CommunityFeed({ 
  answers, 
  activeTab, 
  onTabChange, 
  onLike 
}: CommunityFeedProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">
          💬 What everyone&apos;s saying
        </h2>
        <p className="text-gray-500">
          {answers.length} spark{answers.length !== 1 ? 's' : ''} shared today
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        <button
          onClick={() => onTabChange('popular')}
          className={`flex-1 py-3 px-6 text-sm font-medium rounded-xl transition-all duration-200 ${
            activeTab === 'popular'
              ? 'bg-white text-[#0052FF] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🔥 Popular
        </button>
        <button
          onClick={() => onTabChange('recent')}
          className={`flex-1 py-3 px-6 text-sm font-medium rounded-xl transition-all duration-200 ${
            activeTab === 'recent'
              ? 'bg-white text-[#0052FF] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⏰ Recent
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {answers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <p className="text-gray-500">No sparks yet. Be the first to share!</p>
          </div>
        ) : (
          answers.map((answer, index) => (
            <div
              key={answer.id}
              className="animate-in slide-in-from-bottom-4 fade-in-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <AnswerCard answer={answer} onLike={onLike} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}