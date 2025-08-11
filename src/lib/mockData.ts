import { Question, Answer, User, LeaderboardEntry, TokenReward, SuggestedQuestion } from '@/types'

export const mockUser: User = {
  id: '1',
  username: 'sparkuser',
  avatar: '👤',
  tokens: 150,
  streak: 7,
  hasAnsweredToday: false,
  totalUpvotesReceived: 12,
  totalUpvotesGiven: 8,
  earlyBirdCount: 3,
  walletAddress: undefined
}

export const todaysQuestion: Question = {
  id: 'q-' + new Date().toISOString().split('T')[0],
  text: "If you could have dinner with anyone from history, who would it be and what would you ask them?",
  date: new Date().toISOString().split('T')[0],
  category: 'imagination'
}

export const mockCommunityAnswers: Answer[] = [
  {
    id: '1',
    questionId: todaysQuestion.id,
    userId: '2',
    username: 'alice',
    avatar: '🌟',
    text: "I'd choose Leonardo da Vinci. I'd ask him how he managed to excel in so many different fields - art, science, engineering. His curiosity and interdisciplinary thinking still inspire me today.",
    likes: 23,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    questionId: todaysQuestion.id,
    userId: '3',
    username: 'bob',
    avatar: '🚀',
    text: "Maya Angelou, without hesitation. I'd ask her how she found the strength to transform pain into such powerful, healing words. Her resilience and wisdom could teach us so much about overcoming adversity.",
    likes: 18,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    questionId: todaysQuestion.id,
    userId: '4',
    username: 'charlie',
    avatar: '🎨',
    text: "Nikola Tesla! I'd love to understand his vision for wireless energy transmission and hear his thoughts on how technology could improve humanity. Plus, his eccentricity would make for fascinating conversation.",
    likes: 15,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    questionId: todaysQuestion.id,
    userId: '5',
    username: 'diana',
    avatar: '📚',
    text: "Marie Curie. As someone breaking barriers in science, I'd ask about her determination in a male-dominated field and how she balanced groundbreaking research with raising a family.",
    likes: 12,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
]

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    user: {
      id: '2',
      username: 'alice',
      avatar: '🌟',
      tokens: 1250,
      streak: 15,
      hasAnsweredToday: true,
      totalUpvotesReceived: 89,
      totalUpvotesGiven: 45,
      earlyBirdCount: 12,
      farcasterFid: 12345
    },
    rank: 1,
    totalTokens: 1250,
    weeklyTokens: 340,
    popularAnswers: 8
  },
  {
    user: {
      id: '3',
      username: 'bob',
      avatar: '🚀',
      tokens: 980,
      streak: 12,
      hasAnsweredToday: true,
      totalUpvotesReceived: 67,
      totalUpvotesGiven: 52,
      earlyBirdCount: 8,
      farcasterFid: 23456
    },
    rank: 2,
    totalTokens: 980,
    weeklyTokens: 285,
    popularAnswers: 6
  },
  {
    user: {
      id: '4',
      username: 'charlie',
      avatar: '🎨',
      tokens: 750,
      streak: 9,
      hasAnsweredToday: false,
      totalUpvotesReceived: 45,
      totalUpvotesGiven: 38,
      earlyBirdCount: 5,
      farcasterFid: 34567
    },
    rank: 3,
    totalTokens: 750,
    weeklyTokens: 220,
    popularAnswers: 4
  },
  {
    user: mockUser,
    rank: 4,
    totalTokens: mockUser.tokens,
    weeklyTokens: 180,
    popularAnswers: 3
  }
]

export const mockTokenRewards: TokenReward[] = [
  {
    type: 'answer',
    amount: 10,
    description: 'Answered today\'s question',
    timestamp: new Date().toISOString()
  },
  {
    type: 'early_bird',
    amount: 15,
    description: 'Early bird bonus (top 10)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    type: 'upvotes_received',
    amount: 25,
    description: 'Got 5+ upvotes on answer',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    type: 'streak_bonus',
    amount: 20,
    description: '7-day streak multiplier (2x)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  }
]

export const getPopularAnswers = (answers: Answer[]): Answer[] => {
  return [...answers].sort((a, b) => b.likes - a.likes)
}

export const getRecentAnswers = (answers: Answer[]): Answer[] => {
  return [...answers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const calculateTokenReward = (
  user: User,
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

// Mock suggested questions for initial demo
export const mockSuggestedQuestions: SuggestedQuestion[] = [
  {
    id: 'sq-1',
    text: "What's the most valuable lesson you learned from a failure?",
    submittedBy: '2',
    submittedByUsername: 'alice',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 15,
    upvotedBy: ['3', '4', '5', '6', '7'],
    downvotedBy: [],
    isSelected: false,
    category: 'growth'
  },
  {
    id: 'sq-2', 
    text: "If you could instantly master any skill, what would it be and why?",
    submittedBy: '3',
    submittedByUsername: 'bob',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 12,
    upvotedBy: ['2', '4', '5'],
    downvotedBy: [],
    isSelected: false,
    category: 'imagination'
  },
  {
    id: 'sq-3',
    text: "What's a conspiracy theory you secretly think might be true?", 
    submittedBy: '4',
    submittedByUsername: 'charlie',
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    votes: 8,
    upvotedBy: ['2', '3'],
    downvotedBy: ['5'],
    isSelected: false,
    category: 'fun'
  },
  {
    id: 'sq-4',
    text: "What's one thing you wish you could tell your younger self?",
    submittedBy: '5',
    submittedByUsername: 'diana',
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    votes: 6,
    upvotedBy: ['2', '3'],
    downvotedBy: [],
    isSelected: false,
    category: 'reflection'
  }
]

// Initialize suggested questions in localStorage on first load
export const initializeSuggestedQuestions = () => {
  const stored = localStorage.getItem('suggestedQuestions')
  if (!stored) {
    localStorage.setItem('suggestedQuestions', JSON.stringify(mockSuggestedQuestions))
  }
}