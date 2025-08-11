export interface Question {
  id: string
  text: string
  date: string
  category?: string
}

export interface Answer {
  id: string
  questionId: string
  userId: string
  username: string
  avatar?: string
  text: string
  likes: number
  createdAt: string
  isOwnAnswer?: boolean
}

export interface User {
  id: string
  username: string
  avatar?: string
  farcasterFid?: number
  tokens: number
  streak: number
  hasAnsweredToday: boolean
  totalUpvotesReceived: number
  totalUpvotesGiven: number
  earlyBirdCount: number
  walletAddress?: string
}

export interface TokenReward {
  type: 'answer' | 'early_bird' | 'upvotes_received' | 'streak_bonus' | 'community_bonus' | 'upvote_given' | 'question_submit' | 'question_selected' | 'vote_question'
  amount: number
  description: string
  timestamp: string
}

export interface AppState {
  user: User | null
  todaysQuestion: Question | null
  userAnswer: Answer | null
  communityAnswers: Answer[]
  hasAnswered: boolean
  showCommunity: boolean
  currentTab: AppTab
  tokenRewards: TokenReward[]
}

export type FeedTab = 'popular' | 'recent'
export type AppTab = 'home' | 'suggest' | 'rankings' | 'profile'

export interface LeaderboardEntry {
  user: User
  rank: number
  totalTokens: number
  weeklyTokens: number
  popularAnswers: number
}

export interface SuggestedQuestion {
  id: string
  text: string
  submittedBy: string
  submittedByUsername: string
  submittedAt: string
  votes: number
  upvotedBy: string[]
  downvotedBy: string[]
  isSelected: boolean
  category?: string
}

export interface Vote {
  userId: string
  questionId: string
  type: 'up' | 'down'
  timestamp: string
}

export interface UserVoteStats {
  userId: string
  votesUsedToday: number
  lastVoteDate: string
}