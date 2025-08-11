'use client'

import { useState } from 'react'
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { Answer, Question } from '@/types'

interface PermanentShareButtonProps {
  answer: Answer | null
  question: Question | null
  className?: string
}

export default function PermanentShareButton({ 
  answer, 
  question, 
  className = '' 
}: PermanentShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [hasShared, setHasShared] = useState(false)
  const { context } = useMiniKit()

  if (!answer || !question) return null

  const handleShare = async () => {
    if (isSharing || hasShared) return

    setIsSharing(true)
    
    try {
      const shareText = `Just answered today's Daily Spark question! ✨\n\n"${question.text}"\n\nCurious about my answer? Join the conversation and see what everyone thinks! 🤔💭\n\n${window.location.origin}`

      // Try different sharing approaches
      if (context?.actions?.composeCast) {
        await context.actions.composeCast({
          text: shareText
        })
      } else if (window.parent && window.parent !== window) {
        // For iframe context, try postMessage
        window.parent.postMessage({
          type: 'createCast',
          data: { text: shareText }
        }, '*')
      } else {
        // Fallback: open Farcaster directly
        const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`
        window.open(farcasterUrl, '_blank')
      }

      setHasShared(true)
      
      // Reset after success animation
      setTimeout(() => {
        setHasShared(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error sharing to timeline:', error)
      // Fallback: open Farcaster directly
      try {
        const fallbackText = `Just answered today's Daily Spark question! 🤔💭 Join the conversation at ${window.location.origin}`
        const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(fallbackText)}`
        window.open(farcasterUrl, '_blank')
        setHasShared(true)
        setTimeout(() => setHasShared(false), 3000)
      } catch (fallbackError) {
        console.error('Fallback sharing also failed:', fallbackError)
      }
    } finally {
      setIsSharing(false)
    }
  }

  if (hasShared) {
    return (
      <div className={`${className}`}>
        <button 
          disabled
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-2xl text-sm font-medium animate-scale-in"
        >
          <span>✅</span>
          <span>Shared to Timeline!</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
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
    </div>
  )
}