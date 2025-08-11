'use client'

import { useState, useEffect } from 'react'
import { AppState, Answer, FeedTab, User, AppTab } from '@/types'
import { 
  todaysQuestion, 
  mockCommunityAnswers, 
  getPopularAnswers, 
  getRecentAnswers,
  mockLeaderboard,
  mockTokenRewards,
  calculateTokenReward,
  mockUser
} from '@/lib/mockData'
import { useMiniKit, useIsInMiniApp, useAuthenticate } from '@coinbase/onchainkit/minikit'

export function useApp() {
  const [state, setState] = useState<AppState>({
    user: null,
    todaysQuestion: todaysQuestion,
    userAnswer: null,
    communityAnswers: mockCommunityAnswers,
    hasAnswered: false,
    showCommunity: false,
    currentTab: 'home',
    tokenRewards: mockTokenRewards
  })

  const [feedTab, setFeedTab] = useState<FeedTab>('popular')
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // MiniKit hooks
  const { context } = useMiniKit()
  const isInMiniAppResult = useIsInMiniApp()
  const isInMiniApp = isInMiniAppResult.isInMiniApp || false
  const { signIn: authenticateSignIn } = useAuthenticate(
    process.env.NEXT_PUBLIC_APP_DOMAIN || 'daily-spark-base.vercel.app'
  )

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      setAuthLoading(true)
      
      if (isInMiniApp && context?.user) {
        // User is authenticated via MiniKit
        const farcasterUser: User = {
          id: context.user.fid.toString(),
          username: context.user.username || `user-${context.user.fid}`,
          avatar: context.user.pfpUrl || '👤',
          farcasterFid: context.user.fid,
          tokens: 150, // In production, fetch from backend
          streak: 7,   // In production, fetch from backend
          hasAnsweredToday: false,
          totalUpvotesReceived: 12,
          totalUpvotesGiven: 8,
          earlyBirdCount: 3,
          walletAddress: undefined
        }
        
        setState(prev => ({
          ...prev,
          user: farcasterUser
        }))
      } else if (!isInMiniApp) {
        // Fallback for development/testing outside MiniKit
        
        setState(prev => ({
          ...prev,
          user: mockUser
        }))
      }
      
      setAuthLoading(false)
    }

    initializeAuth()
  }, [context, isInMiniApp])

  const signIn = async () => {
    try {
      setAuthLoading(true)
      await authenticateSignIn()
    } catch (error) {
      console.error('Authentication failed:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  const submitAnswer = async (answerText: string) => {
    if (!state.user || !state.todaysQuestion) return

    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    const newAnswer: Answer = {
      id: 'user-answer-' + Date.now(),
      questionId: state.todaysQuestion.id,
      userId: state.user.id,
      username: state.user.username,
      avatar: state.user.avatar,
      text: answerText,
      likes: 0,
      createdAt: new Date().toISOString(),
      isOwnAnswer: true
    }

    // Calculate token rewards with enhanced system
    const answerCount = state.communityAnswers.length + 1 // +1 for current answer
    const { baseReward, bonuses } = calculateTokenReward(state.user, answerCount, state.communityAnswers.length)
    const totalTokens = baseReward + bonuses.reduce((sum, bonus) => sum + bonus.amount, 0)

    // Update user with enhanced stats
    const updatedUser = {
      ...state.user,
      tokens: state.user.tokens + totalTokens,
      streak: state.user.streak + 1,
      hasAnsweredToday: true,
      earlyBirdCount: answerCount <= 10 ? state.user.earlyBirdCount + 1 : state.user.earlyBirdCount
    }

    // Add answer to community (at the top for recent view)
    const updatedCommunityAnswers = [newAnswer, ...state.communityAnswers]

    // Add reward records
    const newRewards = [
      { type: 'answer' as const, amount: baseReward, description: 'Answered today\'s question', timestamp: new Date().toISOString() },
      ...bonuses
    ]

    setState(prev => ({
      ...prev,
      user: updatedUser,
      userAnswer: newAnswer,
      communityAnswers: updatedCommunityAnswers,
      hasAnswered: true,
      showCommunity: true,
      tokenRewards: [...newRewards, ...prev.tokenRewards]
    }))

    setLoading(false)
  }

  const likeAnswer = async (answerId: string) => {
    setState(prev => ({
      ...prev,
      communityAnswers: prev.communityAnswers.map(answer =>
        answer.id === answerId 
          ? { ...answer, likes: answer.likes + 1 }
          : answer
      )
    }))
  }

  const getSortedAnswers = () => {
    const allAnswers = state.communityAnswers
    return feedTab === 'popular' 
      ? getPopularAnswers(allAnswers)
      : getRecentAnswers(allAnswers)
  }

  const setAppTab = (tab: AppTab) => {
    setState(prev => ({ ...prev, currentTab: tab }))
  }

  const upvoteAnswer = async (answerId: string) => {
    if (!state.user) return
    
    // Check daily upvote limit
    if (state.user.totalUpvotesGiven % 5 === 0 && state.user.totalUpvotesGiven > 0) {
      return // Limit reached for today
    }

    // Update answer likes
    setState(prev => ({
      ...prev,
      communityAnswers: prev.communityAnswers.map(answer =>
        answer.id === answerId 
          ? { ...answer, likes: answer.likes + 1 }
          : answer
      ),
      user: prev.user ? {
        ...prev.user,
        totalUpvotesGiven: prev.user.totalUpvotesGiven + 1,
        tokens: prev.user.tokens + 5
      } : prev.user
    }))

    // Add upvote reward
    const upvoteReward = {
      type: 'upvote_given' as const,
      amount: 5,
      description: 'Upvoted community answer',
      timestamp: new Date().toISOString()
    }

    setState(prev => ({
      ...prev,
      tokenRewards: [upvoteReward, ...prev.tokenRewards]
    }))
  }

  const addTokenReward = (reward: { type: string, amount: number, description: string, timestamp: string }) => {
    if (!state.user) return

    setState(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        tokens: prev.user.tokens + reward.amount
      } : prev.user,
      tokenRewards: [reward, ...prev.tokenRewards]
    }))
  }

  return {
    state,
    loading,
    authLoading,
    feedTab,
    setFeedTab,
    submitAnswer,
    likeAnswer: upvoteAnswer,
    getSortedAnswers,
    signIn,
    isInMiniApp,
    setAppTab,
    addTokenReward,
    leaderboard: mockLeaderboard
  }
}