'use client'

import { useState, useEffect } from 'react'
import { AppState, Answer, FeedTab, User, AppTab } from '@/types'
import { 
  todaysQuestion, 
  mockCommunityAnswers, 
  getPopularAnswers, 
  getRecentAnswers,
  calculateTokenReward
} from '@/lib/mockData'
import { 
  getLeaderboard,
  getUserTokenRewards,
  getTodaysQuestion,
  getCommunityAnswers,
  createOrUpdateUser,
  submitAnswer as submitAnswerToDb,
  addTokenReward
} from '@/lib/supabaseService'
import { useMiniKit, useIsInMiniApp } from '@coinbase/onchainkit/minikit'

export function useApp() {
  const [state, setState] = useState<AppState>({
    user: null,
    todaysQuestion: null,
    userAnswer: null,
    communityAnswers: [],
    hasAnswered: false,
    showCommunity: false,
    currentTab: 'home',
    tokenRewards: []
  })
  
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  const [feedTab, setFeedTab] = useState<FeedTab>('popular')
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // MiniKit hooks
  const minikit = useMiniKit()
  const isInMiniAppResult = useIsInMiniApp()
  const isInMiniApp = isInMiniAppResult.isInMiniApp || false

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      setAuthLoading(true)
      
      try {
        console.log('Auth initialization:', { isInMiniApp, context: minikit.context })
        
        if (isInMiniApp && minikit.context?.user) {
          // User is already authenticated via MiniKit
          console.log('User authenticated via MiniKit:', minikit.context.user)
          // Create or update user in database
          const dbUser = await createOrUpdateUser({
            username: minikit.context.user.username || `user-${minikit.context.user.fid}`,
            farcasterFid: minikit.context.user.fid,
            avatar: minikit.context.user.pfpUrl || '👤'
          })
          
          if (dbUser) {
            setState(prev => ({
              ...prev,
              user: dbUser
            }))
            
            // Load user's token rewards
            const rewards = await getUserTokenRewards(dbUser.id)
            setState(prev => ({
              ...prev,
              tokenRewards: rewards
            }))
          }
        } else if (!isInMiniApp) {
          // Fallback for development/testing outside MiniKit
          // No mock user - show sign-in
          setState(prev => ({
            ...prev,
            user: null
          }))
        } else {
          // User is in MiniApp but not authenticated - show login
          console.log('User not authenticated, showing login screen')
          setState(prev => ({
            ...prev,
            user: null
          }))
        }
      } catch (error) {
        console.error('Authentication initialization error:', error)
        // Fallback to null user to show login
        setState(prev => ({
          ...prev,
          user: null
        }))
      }
      
      setAuthLoading(false)
    }

    // Add a small delay to ensure MiniKit context is fully loaded
    const timer = setTimeout(initializeAuth, 300)
    return () => clearTimeout(timer)
  }, [minikit.context, isInMiniApp])
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load today's question
        const question = await getTodaysQuestion() || todaysQuestion
        setState(prev => ({ ...prev, todaysQuestion: question }))
        
        // Load community answers if we have a question
        if (question) {
          const answers = await getCommunityAnswers(question.id)
          setState(prev => ({ 
            ...prev, 
            communityAnswers: answers,
            showCommunity: answers.length > 0
          }))
        }
        
        // Load leaderboard
        const leaderboardData = await getLeaderboard()
        setLeaderboard(leaderboardData)
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }
    
    loadInitialData()
  }, [])

  const signIn = async () => {
    try {
      setAuthLoading(true)
      
      if (isInMiniApp) {
        // Request authentication using MiniKit
        const authResult = await minikit.actions.authenticate()
        console.log('Authentication result:', authResult)
        
        // The useEffect will handle updating the user state when context changes
      } else {
        // Fallback for development - no mock user
        setState(prev => ({
          ...prev,
          user: null
        }))
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      // Don't set user to null here, let the user try again
    } finally {
      setAuthLoading(false)
    }
  }

  const submitAnswer = async (answerText: string) => {
    if (!state.user || !state.todaysQuestion) return

    setLoading(true)
    
    try {
      // Submit answer to database
      const newAnswer = await submitAnswerToDb(
        state.todaysQuestion.id, 
        state.user.id, 
        answerText
      )
      
      if (newAnswer) {
        // Calculate token rewards
        const answerCount = state.communityAnswers.length + 1
        const { baseReward, bonuses } = calculateTokenReward(state.user, answerCount, state.communityAnswers.length)
        
        // Add token rewards to database
        await addTokenReward(state.user.id, {
          type: 'answer',
          amount: baseReward,
          description: 'Answered today\'s question'
        })
        
        for (const bonus of bonuses) {
          await addTokenReward(state.user.id, bonus)
        }
        
        // Update local state
        const totalTokens = baseReward + bonuses.reduce((sum, bonus) => sum + bonus.amount, 0)
        const updatedUser = {
          ...state.user,
          tokens: state.user.tokens + totalTokens,
          hasAnsweredToday: true
        }
        
        const newRewards = [
          { type: 'answer' as const, amount: baseReward, description: 'Answered today\'s question', timestamp: new Date().toISOString() },
          ...bonuses
        ]
        
        // Add the "isOwnAnswer" flag to the answer
        const ownAnswer = { ...newAnswer, isOwnAnswer: true }
        
        setState(prev => ({
          ...prev,
          user: updatedUser,
          userAnswer: ownAnswer,
          communityAnswers: [ownAnswer, ...prev.communityAnswers],
          hasAnswered: true,
          showCommunity: true,
          tokenRewards: [...newRewards, ...prev.tokenRewards]
        }))
        
        // Refresh leaderboard
        const leaderboardData = await getLeaderboard()
        setLeaderboard(leaderboardData)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    }

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
    leaderboard
  }
}