'use client'

import { useState } from 'react'
import WalletConnect from './WalletConnect'

interface AnswerInputProps {
  onSubmit: (answer: string) => Promise<void>
  loading?: boolean
  isWalletConnected?: boolean
}

export default function AnswerInput({ onSubmit, loading = false, isWalletConnected = false }: AnswerInputProps) {
  const [answer, setAnswer] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim() || loading) return
    
    await onSubmit(answer.trim())
    setAnswer('')
  }

  const canSubmit = answer.trim().length > 0 && !loading && isWalletConnected

  // Show wallet connection requirement if not connected
  if (!isWalletConnected) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Wallet to Answer
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your wallet to participate in Daily Spark and earn tokens for your answers.
          </p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={`relative transition-all duration-200 ${isFocused ? 'scale-[1.02]' : ''}`}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Share your thoughts..."
          className="w-full min-h-[120px] p-6 text-lg bg-white border border-gray-200 rounded-3xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all duration-200 resize-none placeholder:text-gray-400 focus:outline-none"
          maxLength={500}
        />
        <div className="absolute bottom-4 right-4 text-sm text-gray-400">
          {answer.length}/500
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full py-4 px-6 text-lg font-medium rounded-3xl transition-all duration-200 ${
          canSubmit
            ? 'bg-[#0052FF] text-white hover:bg-[#0052FF]/90 active:scale-[0.98] shadow-lg hover:shadow-xl'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Sharing...</span>
          </div>
        ) : (
          'Share Your Spark ✨'
        )}
      </button>
    </form>
  )
}