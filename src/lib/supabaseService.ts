import { supabase, isSupabaseConfigured } from './supabase'
import { Database } from '@/types/database'
import { User, Question, Answer, SuggestedQuestion, TokenReward, LeaderboardEntry } from '@/types'
import { mockSuggestedQuestions } from './mockData'

type DbUser = Database['public']['Tables']['users']['Row']
type DbQuestion = Database['public']['Tables']['questions']['Row']
type DbAnswer = Database['public']['Tables']['answers']['Row']
type DbSuggestedQuestion = Database['public']['Tables']['suggested_questions']['Row']
type DbTokenReward = Database['public']['Tables']['token_rewards']['Row']

// User management
export async function createOrUpdateUser(userData: {
  username: string
  farcasterFid?: number
  walletAddress?: string
  ensName?: string
  ensAvatar?: string
  avatar?: string
}): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          username: userData.username,
          farcaster_fid: userData.farcasterFid,
          wallet_address: userData.walletAddress,
          ens_name: userData.ensName,
          ens_avatar: userData.ensAvatar,
          avatar: userData.avatar || '👤',
        },
        {
          onConflict: userData.farcasterFid ? 'farcaster_fid' : 'username',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating user:', error)
      return null
    }

    return dbUserToUser(data)
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return dbUserToUser(data)
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

export async function getUserByWalletAddress(address: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', address)
      .single()

    if (error || !data) return null
    return dbUserToUser(data)
  } catch (error) {
    console.error('Error getting user by wallet:', error)
    return null
  }
}

// Questions management
export async function getTodaysQuestion(): Promise<Question | null> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('date', today)
      .eq('is_active', true)
      .single()

    if (error || !data) return null
    return dbQuestionToQuestion(data)
  } catch (error) {
    console.error('Error getting today\'s question:', error)
    return null
  }
}

// Answers management
export async function submitAnswer(questionId: string, userId: string, text: string): Promise<Answer | null> {
  try {
    const { data, error } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        user_id: userId,
        text: text
      })
      .select(`
        *,
        users!inner(username, avatar)
      `)
      .single()

    if (error) {
      console.error('Error submitting answer:', error)
      return null
    }

    return dbAnswerToAnswer(data)
  } catch (error) {
    console.error('Error in submitAnswer:', error)
    return null
  }
}

export async function getCommunityAnswers(questionId: string): Promise<Answer[]> {
  try {
    const { data, error } = await supabase
      .from('answers')
      .select(`
        *,
        users!inner(username, avatar)
      `)
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting community answers:', error)
      return []
    }

    return data.map(dbAnswerToAnswer)
  } catch (error) {
    console.error('Error in getCommunityAnswers:', error)
    return []
  }
}

// Suggested questions management
export async function getSuggestedQuestions(): Promise<SuggestedQuestion[]> {
  if (!isSupabaseConfigured || !supabase) {
    // Return mock data if Supabase is not configured
    return mockSuggestedQuestions.sort((a, b) => b.votes - a.votes)
  }

  try {
    const { data, error } = await supabase
      .from('suggested_questions')
      .select(`
        *,
        users!inner(username)
      `)
      .eq('is_selected', false)
      .order('votes', { ascending: false })

    if (error) {
      console.error('Error getting suggested questions:', error)
      return mockSuggestedQuestions.sort((a, b) => b.votes - a.votes)
    }

    return data.map(dbSuggestedQuestionToSuggestedQuestion)
  } catch (error) {
    console.error('Error in getSuggestedQuestions:', error)
    return mockSuggestedQuestions.sort((a, b) => b.votes - a.votes)
  }
}

export async function submitSuggestedQuestion(text: string, userId: string, category?: string): Promise<SuggestedQuestion | null> {
  if (!isSupabaseConfigured || !supabase) {
    // Mock implementation - just return a fake question for demo
    const mockQuestion: SuggestedQuestion = {
      id: `sq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text,
      submittedBy: userId,
      submittedByUsername: 'You',
      submittedAt: new Date().toISOString(),
      votes: 0,
      upvotedBy: [],
      downvotedBy: [],
      isSelected: false,
      category: category
    }
    
    // Store in localStorage for persistence
    const stored = localStorage.getItem('suggestedQuestions') || '[]'
    const questions = JSON.parse(stored)
    questions.push(mockQuestion)
    localStorage.setItem('suggestedQuestions', JSON.stringify(questions))
    
    return mockQuestion
  }

  try {
    const { data, error } = await supabase
      .from('suggested_questions')
      .insert({
        text: text,
        submitted_by: userId,
        category: category
      })
      .select(`
        *,
        users!inner(username)
      `)
      .single()

    if (error) {
      console.error('Error submitting suggested question:', error)
      return null
    }

    return dbSuggestedQuestionToSuggestedQuestion(data)
  } catch (error) {
    console.error('Error in submitSuggestedQuestion:', error)
    return null
  }
}

export async function voteOnSuggestedQuestion(
  questionId: string, 
  userId: string, 
  voteType: 'up' | 'down'
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    // Mock implementation using localStorage
    try {
      const stored = localStorage.getItem('suggestedQuestions') || '[]'
      const questions = JSON.parse(stored)
      
      const questionIndex = questions.findIndex((q: any) => q.id === questionId)
      if (questionIndex === -1) return false
      
      // Simple voting logic for demo
      const voteChange = voteType === 'up' ? 1 : -1
      questions[questionIndex].votes = Math.max(0, questions[questionIndex].votes + voteChange)
      
      localStorage.setItem('suggestedQuestions', JSON.stringify(questions))
      return true
    } catch (error) {
      console.error('Error in mock voting:', error)
      return false
    }
  }

  try {
    // Start a transaction
    const { data: existingVote } = await supabase
      .from('question_votes')
      .select('vote_type')
      .eq('question_id', questionId)
      .eq('user_id', userId)
      .single()

    let voteChange = 0
    
    if (existingVote) {
      // Update existing vote
      if (existingVote.vote_type !== voteType) {
        await supabase
          .from('question_votes')
          .update({ vote_type: voteType })
          .eq('question_id', questionId)
          .eq('user_id', userId)
        
        voteChange = voteType === 'up' ? 2 : -2 // Change from down to up or up to down
      }
    } else {
      // Insert new vote
      await supabase
        .from('question_votes')
        .insert({
          question_id: questionId,
          user_id: userId,
          vote_type: voteType
        })
      
      voteChange = voteType === 'up' ? 1 : -1
    }

    // Update question vote count
    await supabase
      .from('suggested_questions')
      .update({
        votes: supabase.sql`votes + ${voteChange}`
      })
      .eq('id', questionId)

    return true
  } catch (error) {
    console.error('Error voting on suggested question:', error)
    return false
  }
}

// Token rewards
export async function addTokenReward(userId: string, reward: Omit<TokenReward, 'timestamp'>): Promise<boolean> {
  try {
    // Add token reward record
    await supabase
      .from('token_rewards')
      .insert({
        user_id: userId,
        type: reward.type,
        amount: reward.amount,
        description: reward.description
      })

    // Update user tokens
    await supabase
      .from('users')
      .update({
        tokens: supabase.sql`tokens + ${reward.amount}`
      })
      .eq('id', userId)

    return true
  } catch (error) {
    console.error('Error adding token reward:', error)
    return false
  }
}

export async function getUserTokenRewards(userId: string): Promise<TokenReward[]> {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('token_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error getting token rewards:', error)
      return []
    }

    return data.map(dbTokenRewardToTokenReward)
  } catch (error) {
    console.error('Error in getUserTokenRewards:', error)
    return []
  }
}

// Leaderboard
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    // Get users with their token counts and weekly tokens
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('tokens', { ascending: false })
      .limit(50)

    if (usersError) {
      console.error('Error getting leaderboard users:', usersError)
      return []
    }

    // Get weekly token rewards for each user
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    
    const { data: weeklyRewards } = await supabase
      .from('token_rewards')
      .select('user_id, amount')
      .gte('created_at', weekStart.toISOString())

    // Get popular answers count (answers with 5+ likes)
    const { data: popularAnswers } = await supabase
      .from('answers')
      .select('user_id')
      .gte('likes', 5)

    // Process data
    const weeklyTokensByUser = new Map<string, number>()
    weeklyRewards?.forEach(reward => {
      const current = weeklyTokensByUser.get(reward.user_id) || 0
      weeklyTokensByUser.set(reward.user_id, current + reward.amount)
    })

    const popularAnswersByUser = new Map<string, number>()
    popularAnswers?.forEach(answer => {
      const current = popularAnswersByUser.get(answer.user_id) || 0
      popularAnswersByUser.set(answer.user_id, current + 1)
    })

    return users.map((user, index) => ({
      user: dbUserToUser(user),
      rank: index + 1,
      totalTokens: user.tokens,
      weeklyTokens: weeklyTokensByUser.get(user.id) || 0,
      popularAnswers: popularAnswersByUser.get(user.id) || 0
    }))
  } catch (error) {
    console.error('Error in getLeaderboard:', error)
    return []
  }
}

// Helper functions to convert database types to app types
function dbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    avatar: dbUser.avatar,
    farcasterFid: dbUser.farcaster_fid || undefined,
    tokens: dbUser.tokens,
    streak: dbUser.streak,
    hasAnsweredToday: dbUser.has_answered_today,
    totalUpvotesReceived: dbUser.total_upvotes_received,
    totalUpvotesGiven: dbUser.total_upvotes_given,
    earlyBirdCount: dbUser.early_bird_count,
    walletAddress: dbUser.wallet_address || undefined
  }
}

function dbQuestionToQuestion(dbQuestion: DbQuestion): Question {
  return {
    id: dbQuestion.id,
    text: dbQuestion.text,
    date: dbQuestion.date,
    category: dbQuestion.category || undefined
  }
}

function dbAnswerToAnswer(dbAnswer: any): Answer {
  return {
    id: dbAnswer.id,
    questionId: dbAnswer.question_id,
    userId: dbAnswer.user_id,
    username: dbAnswer.users.username,
    avatar: dbAnswer.users.avatar,
    text: dbAnswer.text,
    likes: dbAnswer.likes,
    createdAt: dbAnswer.created_at
  }
}

function dbSuggestedQuestionToSuggestedQuestion(dbSuggestedQuestion: any): SuggestedQuestion {
  return {
    id: dbSuggestedQuestion.id,
    text: dbSuggestedQuestion.text,
    submittedBy: dbSuggestedQuestion.submitted_by,
    submittedByUsername: dbSuggestedQuestion.users.username,
    submittedAt: dbSuggestedQuestion.created_at,
    votes: dbSuggestedQuestion.votes,
    upvotedBy: [], // TODO: Get from question_votes
    downvotedBy: [], // TODO: Get from question_votes
    isSelected: dbSuggestedQuestion.is_selected,
    category: dbSuggestedQuestion.category || undefined
  }
}

function dbTokenRewardToTokenReward(dbTokenReward: DbTokenReward): TokenReward {
  return {
    type: dbTokenReward.type as any,
    amount: dbTokenReward.amount,
    description: dbTokenReward.description,
    timestamp: dbTokenReward.created_at
  }
}