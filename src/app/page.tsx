'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useApp } from '@/hooks/useApp'
import sdk from '@farcaster/miniapp-sdk'
import QuestionCard from '@/components/QuestionCard'
import AnswerInput from '@/components/AnswerInput'
import StatusBar from '@/components/StatusBar'
import CommunityFeed from '@/components/CommunityFeed'
import SuccessModal from '@/components/SuccessModal'
import BottomNavigation from '@/components/BottomNavigation'
import ProfilePage from '@/components/ProfilePage'
import RankingsPage from '@/components/RankingsPage'
import SuggestPage from '@/components/SuggestPage'
import PermanentShareButton from '@/components/PermanentShareButton'

export default function Home() {
  const { 
    state, 
    loading,
    authLoading,
    feedTab, 
    setFeedTab, 
    submitAnswer, 
    likeAnswer, 
    getSortedAnswers,
    signIn,
    isInMiniApp,
    setAppTab,
    addTokenReward,
    leaderboard
  } = useApp()

  const { isConnected } = useAccount()
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Ensure MiniKit SDK is ready after app loads
  useEffect(() => {
    const ensureReady = async () => {
      try {
        if (state.user && state.todaysQuestion && !authLoading) {
          await sdk.actions.ready()
          console.log('MiniKit SDK ready called from main app')
        }
      } catch (error) {
        console.error('Error calling SDK ready from main app:', error)
      }
    }
    ensureReady()
  }, [state.user, state.todaysQuestion, authLoading])

  // Show loading during authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-gray-600">Loading your daily spark...</p>
        </div>
      </div>
    )
  }

  // Show sign-in if no user (both in MiniApp and regular browser)
  if (!state.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
          <div className="p-6 flex flex-col items-center justify-center min-h-screen space-y-6">
            <div className="text-6xl mb-4">⚡</div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 text-center">
              Daily Spark
            </h1>
            <p className="text-gray-600 text-center mb-8">
              {isInMiniApp 
                ? "Connect with your Farcaster account to join the daily conversation."
                : "Connect your account to participate in Daily Spark."
              }
            </p>
            <button
              onClick={signIn}
              disabled={authLoading}
              className="px-8 py-4 bg-[#0052FF] text-white rounded-2xl text-lg font-medium hover:bg-[#0052FF]/90 transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {authLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>{isInMiniApp ? "Connect Farcaster" : "Connect Account"}</span>
                </>
              )}
            </button>
            {isInMiniApp && (
              <p className="text-xs text-gray-500 text-center mt-4">
                You'll be prompted to connect your Farcaster profile
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show loading if no question
  if (!state.todaysQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-gray-600">Loading your daily spark...</p>
        </div>
      </div>
    )
  }

  const handleSubmitAnswer = async (answerText: string) => {
    await submitAnswer(answerText)
    setShowSuccessModal(true)
  }

  const renderCurrentTab = () => {
    switch (state.currentTab) {
      case 'suggest':
        if (!state.user) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">💡</div>
                <p className="text-gray-600">Loading your profile...</p>
              </div>
            </div>
          )
        }
        return (
          <SuggestPage 
            user={state.user} 
            onTokenReward={addTokenReward} 
          />
        )
      case 'profile':
        if (!state.user) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">👤</div>
                <p className="text-gray-600">Loading your profile...</p>
              </div>
            </div>
          )
        }
        return (
          <ProfilePage 
            user={state.user} 
            tokenRewards={state.tokenRewards} 
          />
        )
      case 'rankings':
        return (
          <RankingsPage 
            leaderboard={leaderboard} 
            currentUserId={state.user?.id} 
          />
        )
      case 'home':
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center py-4">
              <h1 className="text-3xl font-light text-gray-900 mb-2">
                Daily Spark ⚡
              </h1>
              <p className="text-gray-500">
                One question. Your voice. Our community.
              </p>
            </div>

            {/* Status Bar (only shown after answering) */}
            {state.hasAnswered && (
              <div className="animate-slide-in-up">
                <StatusBar 
                  streak={state.user!.streak}
                  tokens={state.user!.tokens}
                  hasAnswered={state.hasAnswered}
                />
              </div>
            )}

            {/* Permanent Share Button (only shown after answering) */}
            {state.hasAnswered && state.userAnswer && (
              <div className="animate-slide-in-up">
                <PermanentShareButton
                  answer={state.userAnswer}
                  question={state.todaysQuestion}
                  className="mb-6"
                />
              </div>
            )}

            {/* Question Section (always visible, but smaller after answering) */}
            <div className={`transition-all duration-500 ${
              state.hasAnswered ? 'scale-95 opacity-75' : 'animate-scale-in'
            }`}>
              <QuestionCard 
                question={state.todaysQuestion!.text}
                className={state.hasAnswered ? 'mb-4' : 'mb-8'}
              />
            </div>

            {/* Answer Input (only shown before answering) */}
            {!state.hasAnswered && (
              <div className="animate-fade-in">
                <AnswerInput 
                  onSubmit={handleSubmitAnswer} 
                  loading={loading}
                  isWalletConnected={isConnected}
                />
              </div>
            )}

            {/* Community Feed (only shown after answering) */}
            {state.showCommunity && (
              <div className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                <CommunityFeed
                  answers={getSortedAnswers()}
                  activeTab={feedTab}
                  onTabChange={setFeedTab}
                  onLike={likeAnswer}
                />
              </div>
            )}

            {/* Bottom Padding for Navigation */}
            <div className="h-24" />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative">
        <div className="p-6 pb-20">
          {renderCurrentTab()}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={state.currentTab}
          onTabChange={setAppTab}
          hasAnswered={state.hasAnswered}
        />

        {/* Loading Animation */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl text-center animate-scale-in shadow-2xl">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-xl font-medium text-gray-900">
                Sharing your spark...
              </p>
            </div>
          </div>
        )}

        {/* Success Modal (simplified) */}
        {showSuccessModal && (
          <SuccessModal
            tokensEarned={state.tokenRewards.find(r => r.type === 'answer')?.amount || 10}
            onClose={() => setShowSuccessModal(false)}
          />
        )}
      </div>
    </div>
  )
}
