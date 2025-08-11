'use client'

import { useState } from 'react'
import { useComposeCast } from '@coinbase/onchainkit/minikit'
import { Answer, Question } from '@/types'

interface ShareButtonProps {
  answer: Answer
  question: Question
  onShareSuccess?: () => void
}

export default function ShareButton({ answer, question, onShareSuccess }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [hasShared, setHasShared] = useState(false)
  const { composeCast } = useComposeCast()

  const handleShare = async () => {
    if (isSharing || hasShared) return

    setIsSharing(true)
    
    try {
      const truncatedAnswer = answer.text.length > 100 
        ? answer.text.substring(0, 100) + '...'
        : answer.text

      const shareText = `Just shared my daily spark! ✨\n\n"${truncatedAnswer}"\n\nJoin the conversation on Daily Spark 💭`
      
      const embedUrl = `${window.location.origin}?question=${question.id}`

      await composeCast({
        text: shareText,
        embeds: [embedUrl]
      })

      setHasShared(true)
      onShareSuccess?.()
      
      // Reset after success animation
      setTimeout(() => {
        setHasShared(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error sharing to timeline:', error)
    } finally {
      setIsSharing(false)
    }
  }

  if (hasShared) {
    return (
      <button 
        disabled
        className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-100 text-green-700 rounded-2xl text-sm font-medium animate-scale-in"
      >
        <span>✅</span>
        <span>Shared to Timeline!</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
        isSharing
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-[#0052FF] text-white hover:bg-[#0052FF]/90 active:scale-95 shadow-lg hover:shadow-xl'
      }`}
    >
      {isSharing ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Sharing...</span>
        </>
      ) : (
        <>
          <span>📤</span>
          <span>Share to Timeline</span>
        </>
      )}
    </button>
  )
}