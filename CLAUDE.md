# Daily Spark - Project Understanding

## Overview
Daily Spark is a minimal Question of the Day Base mini-app built with Next.js 15 and TypeScript. It provides a clean, distraction-free interface where users answer one thoughtful question daily, earn tokens, build streaks, and engage with community responses.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS (v4)
- **Database**: Supabase (with localStorage fallback)
- **Blockchain**: Base Network + OnchainKit + Wagmi
- **Authentication**: Farcaster integration via MiniKit + Wallet connection
- **State Management**: Custom hooks + Supabase integration
- **Deployment**: Vercel

### Key Components
- `QuestionCard.tsx` - Displays daily question in minimal card format
- `AnswerInput.tsx` - Text area with submit functionality and loading states
- `StatusBar.tsx` - Shows streak, tokens, and answered status
- `CommunityFeed.tsx` - Unified feed with Popular/Recent tabs
- `AnswerCard.tsx` - Individual community response cards
- `BottomNavigation.tsx` - Tab navigation between sections
- `SuccessModal.tsx` - Post-answer success modal with token rewards

### Core Hook
- `useApp.ts` - Main application state management hook handling:
  - User authentication (MiniKit/Farcaster integration)
  - Question/answer state
  - Community interactions
  - Token rewards system
  - Tab navigation

## Features

### Authentication
- Farcaster authentication via MiniKit SDK for Base App integration
- Fallback authentication for development/testing
- Automatic sign-in detection when running in MiniApp context

### Question System
- Daily rotating questions from mock data
- Categories: imagination, growth, fun, reflection
- Single question per day approach (focus-first design)

### Rewards System
- Base reward: 10 tokens per answer
- Streak bonuses and early bird bonuses
- Community interaction rewards (upvotes)
- Detailed token reward tracking

### Community Features
- Popular/Recent answer sorting
- Like/upvote functionality with daily limits
- User profiles with stats tracking
- Leaderboards and rankings

### Progressive UX Flow
1. **Initial State**: Question Card → Answer Input → Submit
2. **After Answer**: Status Bar → Community Feed with tabs
3. **User's answer appears integrated with community responses**

## Database Schema (Supabase)

### Core Tables
- `users` - User profiles, tokens, streaks, stats
- `questions` - Daily questions with categories and dates
- `answers` - User responses (one per user per question)
- `suggested_questions` - Community submitted questions
- `answer_likes` - Like tracking
- `token_rewards` - Token transaction history

### Key Features
- UUID primary keys throughout
- Proper foreign key relationships
- Indexes for performance optimization
- Triggers for automatic timestamp updates

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## File Structure
```
src/
├── app/
│   ├── page.tsx          # Main app page with progressive flow
│   ├── layout.tsx        # Root layout with providers
│   ├── providers.tsx     # MiniKit, Wagmi, React Query providers
│   └── globals.css       # Global styles and animations
├── components/           # UI components
├── hooks/
│   └── useApp.ts        # Main application state hook
├── lib/
│   ├── mockData.ts      # Mock data for development
│   ├── supabase.ts      # Supabase client configuration
│   └── supabaseService.ts # Database service functions
└── types/
    ├── index.ts         # Core TypeScript interfaces
    └── database.ts      # Database type definitions
```

## Environment Variables Required
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
NEXT_PUBLIC_APP_DOMAIN=your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Base App Integration
- Farcaster manifest at `/.well-known/farcaster.json`
- MiniKit SDK integration for authentication
- Timeline sharing functionality with `useComposeCast`
- Mobile-first responsive design (max-width: 430px)

## Design Philosophy
- **Instagram-minimal aesthetic** with clean typography and whitespace
- **Base blue (#0052FF)** accent color throughout
- **Focus-first approach** - hide everything except today's question until answered
- **Progressive disclosure** - community features revealed after engagement
- **Mobile-optimized** touch-friendly interface

## Mock Data System
The app uses comprehensive mock data during development:
- Rotating daily questions with realistic content
- Community answers with varied engagement levels
- User profiles with different activity patterns
- Token reward calculations and leaderboard rankings

## Testing & Deployment
- Configured for Vercel deployment with proper routing
- CORS headers configured for Farcaster manifest
- Mobile-first responsive testing recommended
- Works both as standalone web app and Base mini-app