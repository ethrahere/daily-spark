'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { SuggestedQuestion, User, TokenReward, UserVoteStats } from '@/types'
import { 
  getSuggestedQuestions, 
  submitSuggestedQuestion, 
  voteOnSuggestedQuestion 
} from '@/lib/supabaseService'
import { isSupabaseConfigured } from '@/lib/supabase'
import { initializeSuggestedQuestions } from '@/lib/mockData'
import WalletConnect from './WalletConnect'

interface SuggestPageProps {
  user: User
  onTokenReward: (reward: TokenReward) => void
}

export default function SuggestPage({ user, onTokenReward }: SuggestPageProps) {
  const { isConnected } = useAccount()
  const [newQuestion, setNewQuestion] = useState('')
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([])
  const [votesUsedToday, setVotesUsedToday] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const loadQuestions = useCallback(async () => {
    try {
      const suggestedQuestions = await getSuggestedQuestions()
      setQuestions(suggestedQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }, [])

  const loadVoteStats = useCallback(() => {
    const stored = localStorage.getItem('userVoteStats')
    if (stored) {
      const stats: UserVoteStats[] = JSON.parse(stored)
      const userStats = stats.find(s => s.userId === user.id)
      if (userStats) {
        const today = new Date().toISOString().split('T')[0]
        if (userStats.lastVoteDate === today) {
          setVotesUsedToday(userStats.votesUsedToday)
        }
      }
    }
  }, [user.id])

  useEffect(() => {
    // Initialize localStorage with mock data if Supabase is not configured
    if (!isSupabaseConfigured) {
      initializeSuggestedQuestions()
    }
    
    loadQuestions()
    loadVoteStats()
  }, [user.id, loadQuestions, loadVoteStats])


  const updateVoteStats = (newVotesUsed: number) => {
    const stored = localStorage.getItem('userVoteStats') || '[]'
    const stats: UserVoteStats[] = JSON.parse(stored)
    const today = new Date().toISOString().split('T')[0]
    
    const existingIndex = stats.findIndex(s => s.userId === user.id)
    if (existingIndex >= 0) {
      stats[existingIndex] = {
        userId: user.id,
        votesUsedToday: newVotesUsed,
        lastVoteDate: today
      }
    } else {
      stats.push({
        userId: user.id,
        votesUsedToday: newVotesUsed,
        lastVoteDate: today
      })
    }
    
    localStorage.setItem('userVoteStats', JSON.stringify(stats))
    setVotesUsedToday(newVotesUsed)
  }

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !isConnected || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const submittedQuestion = await submitSuggestedQuestion(
        newQuestion.trim(),
        user.id
      )

      if (submittedQuestion) {
        // Reload questions to show the new one
        await loadQuestions()

        // Award tokens for submission
        const reward: TokenReward = {
          type: 'question_submit',
          amount: 5,
          description: 'Submitted a question suggestion',
          timestamp: new Date().toISOString()
        }
        onTokenReward(reward)

        setNewQuestion('')
        setSubmitMessage('Question submitted! You earned 5 tokens ✨')
        setTimeout(() => setSubmitMessage(''), 3000)
      } else {
        setSubmitMessage('Failed to submit question. Please try again.')
        setTimeout(() => setSubmitMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error submitting question:', error)
      setSubmitMessage('Error submitting question. Please try again.')
      setTimeout(() => setSubmitMessage(''), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (questionId: string, type: 'up' | 'down') => {
    if (votesUsedToday >= 10 || !isConnected) return

    const question = questions.find(q => q.id === questionId)
    if (!question || question.submittedBy === user.id) return

    try {
      const success = await voteOnSuggestedQuestion(questionId, user.id, type)
      
      if (success) {
        // Reload questions to get updated vote counts
        await loadQuestions()
        
        // Update local vote stats
        updateVoteStats(votesUsedToday + 1)

        // Award token for voting
        const reward: TokenReward = {
          type: 'vote_question',
          amount: 1,
          description: 'Voted on a question suggestion',
          timestamp: new Date().toISOString()
        }
        onTokenReward(reward)
      }
    } catch (error) {
      console.error('Error voting on question:', error)
    }
  }

  const getTopQuestion = () => {
    return questions.filter(q => !q.isSelected).sort((a, b) => b.votes - a.votes)[0]
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="text-6xl mb-4">💡</div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Suggest Questions
          </h1>
          <p className="text-gray-500">
            Help shape future Daily Spark conversations
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Wallet to Suggest
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your wallet to submit questions and vote on community suggestions.
          </p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <div className="text-4xl mb-2">💡</div>
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Suggest Questions
        </h1>
        <p className="text-gray-500">
          Shape the future of Daily Spark
        </p>
      </div>

      {/* Vote Stats */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">Daily Votes</span>
            <p className="text-lg font-semibold text-blue-600">
              {votesUsedToday}/10 used
            </p>
          </div>
          <div className="text-2xl">🗳️</div>
        </div>
      </div>

      {/* Coming Up Next */}
      {getTopQuestion() && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🔥</span>
            Coming Up Next
          </h2>
          <div className="bg-white/70 rounded-xl p-4">
            <p className="text-gray-700 font-medium">
              &quot;{getTopQuestion().text}&quot;
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-600">
                by @{getTopQuestion().submittedByUsername}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                {getTopQuestion().votes} votes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit New Question */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Suggest a Question
        </h2>
        
        {submitMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 text-sm font-medium">{submitMessage}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What question would spark great conversations?"
              className="w-full min-h-[100px] p-4 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all duration-200 resize-none placeholder:text-gray-400 focus:outline-none"
              maxLength={300}
            />
            <div className="absolute bottom-3 right-3 text-sm text-gray-400">
              {newQuestion.length}/300
            </div>
          </div>

          <button
            onClick={handleSubmitQuestion}
            disabled={!newQuestion.trim() || isSubmitting}
            className={`w-full py-3 px-6 text-base font-medium rounded-2xl transition-all duration-200 ${
              newQuestion.trim() && !isSubmitting
                ? 'bg-[#0052FF] text-white hover:bg-[#0052FF]/90 active:scale-[0.98] shadow-lg hover:shadow-xl'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>💡</span>
                <span>Submit Question (+5 tokens)</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Question Queue */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Community Questions
        </h2>
        
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🤔</div>
            <p className="text-gray-500">
              No questions suggested yet. Be the first to contribute!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => {
              const isOwnQuestion = question.submittedBy === user.id
              const canVote = votesUsedToday < 10 && !isOwnQuestion

              return (
                <div key={question.id} className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-gray-900 font-medium mb-3">
                    &quot;{question.text}&quot;
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        by @{question.submittedByUsername}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {question.votes} votes
                      </span>
                    </div>
                    
                    {!isOwnQuestion && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleVote(question.id, 'up')}
                          disabled={!canVote}
                          className={`p-2 rounded-full transition-all duration-200 ${
                            canVote
                              ? 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleVote(question.id, 'down')}
                          disabled={!canVote}
                          className={`p-2 rounded-full transition-all duration-200 ${
                            canVote
                              ? 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          👎
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rewards Info */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💰 Earning Tokens
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Submit a question</span>
            <span className="font-semibold text-[#0052FF]">+5 tokens</span>
          </div>
          <div className="flex justify-between">
            <span>Vote on questions</span>
            <span className="font-semibold text-[#0052FF]">+1 token each</span>
          </div>
          <div className="flex justify-between">
            <span>Question gets selected</span>
            <span className="font-semibold text-[#0052FF]">+50 tokens</span>
          </div>
          <div className="text-xs text-gray-600 pt-2 border-t border-blue-200">
            Daily voting limit: 10 votes per day
          </div>
        </div>
      </div>
    </div>
  )
}