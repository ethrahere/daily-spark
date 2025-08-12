import { Question, Answer, TokenReward } from '@/types'

export const todaysQuestion: Question = {
  id: 'q-' + new Date().toISOString().split('T')[0],
  text: "If Base had a mascot, what would it be and what superpower would it have? 🔵",
  date: new Date().toISOString().split('T')[0],
  category: 'fun'
}

// Empty community answers - will be populated from real data
export const mockCommunityAnswers: Answer[] = []

// Empty leaderboard - will be populated from real data
export const mockLeaderboard: any[] = []

// Empty token rewards - will be populated from real data
export const mockTokenRewards: TokenReward[] = []

export const getPopularAnswers = (answers: Answer[]): Answer[] => {
  return [...answers].sort((a, b) => b.likes - a.likes)
}

export const getRecentAnswers = (answers: Answer[]): Answer[] => {
  return [...answers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const calculateTokenReward = (
  user: any,
  answerCount: number,
  communityCount: number
): { baseReward: number; bonuses: TokenReward[] } => {
  const baseReward = 10 // Base answer reward
  const bonuses: TokenReward[] = []

  // Early bird bonus (first 10 responses)
  if (answerCount <= 10) {
    bonuses.push({
      type: 'early_bird',
      amount: 15,
      description: `Early bird bonus (#${answerCount})`,
      timestamp: new Date().toISOString()
    })
  }

  // Community bonus (100+ answers)
  if (communityCount >= 100) {
    bonuses.push({
      type: 'community_bonus',
      amount: 10,
      description: 'Community bonus (100+ participants)',
      timestamp: new Date().toISOString()
    })
  }

  // Streak multiplier
  const streakMultiplier = user.streak >= 30 ? 3 : user.streak >= 7 ? 2 : 1
  if (streakMultiplier > 1) {
    const bonusAmount = (baseReward + bonuses.reduce((sum, b) => sum + b.amount, 0)) * (streakMultiplier - 1)
    bonuses.push({
      type: 'streak_bonus',
      amount: bonusAmount,
      description: `${user.streak}-day streak (${streakMultiplier}x multiplier)`,
      timestamp: new Date().toISOString()
    })
  }

  return { baseReward, bonuses }
}

// Empty suggested questions - will be populated from real data
export const mockSuggestedQuestions: any[] = []

// Initialize empty suggested questions in localStorage on first load
export const initializeSuggestedQuestions = () => {
  const stored = localStorage.getItem('suggestedQuestions')
  if (!stored) {
    localStorage.setItem('suggestedQuestions', JSON.stringify([]))
  }
}