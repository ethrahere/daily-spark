'use client'

import { useState } from 'react'
import { Answer } from '@/types'
import BaseUser from './BaseUser'

interface AnswerCardProps {
  answer: Answer
  onLike: (answerId: string) => void
}

export default function AnswerCard({ answer, onLike }: AnswerCardProps) {
  const [hasLiked, setHasLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (hasLiked || isLiking) return
    
    setIsLiking(true)
    setHasLiked(true)
    await onLike(answer.id)
    setIsLiking(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'now'
    if (diffInHours < 24) return `${diffInHours}h`
    return `${Math.floor(diffInHours / 24)}d`
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md ${
      answer.isOwnAnswer ? 'border-[#0052FF]/20 bg-[#0052FF]/5' : 'border-gray-100'
    }`}>
      <div className="flex items-start space-x-3 mb-4">
        <BaseUser
          username={answer.username}
          avatar={answer.avatar}
          showAvatar={true}
          showName={false}
          avatarClassName="w-10 h-10"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <BaseUser
              username={answer.username}
              avatar={answer.avatar}
              showAvatar={false}
              showName={true}
              nameClassName="font-medium text-gray-900 truncate"
            />
            {answer.isOwnAnswer && <span className="text-[#0052FF] ml-1">(You)</span>}
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formatTime(answer.createdAt)}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-800 leading-relaxed mb-4 text-base">
        {answer.text}
      </p>

      <div className="flex items-center justify-between">
        <button
          onClick={handleLike}
          disabled={hasLiked || isLiking || answer.isOwnAnswer}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            hasLiked || answer.isOwnAnswer
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-[#0052FF] hover:bg-[#0052FF]/5 active:scale-95'
          }`}
        >
          <span className={`transition-transform duration-200 ${isLiking ? 'animate-bounce' : ''}`}>
            {hasLiked ? '❤️' : '🤍'}
          </span>
          <span>{answer.likes + (hasLiked ? 1 : 0)}</span>
        </button>

        {/* <button
          className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-[#0052FF] hover:bg-[#0052FF]/5 transition-all duration-200 active:scale-95"
        >
          <span>📤</span>
          <span>Share</span>
        </button> */}
      </div>
    </div>
  )
}