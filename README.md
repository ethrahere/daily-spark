# Daily Spark ⚡

A minimal Question of the Day Base mini-app with clean UI and focus-first UX.

## Overview

Daily Spark presents users with one thoughtful question each day, encouraging meaningful engagement through a clean, distraction-free interface. Users can answer the daily question, earn tokens, build streaks, and discover community insights.

## Key Features

### 🎯 **Focus-First Design**
- App opens showing only today's question (no distractions)
- Clean, Instagram-minimal aesthetic with plenty of whitespace
- Base blue (#0052FF) accents throughout

### 📱 **Mobile-Optimized UX**
- Mobile-first responsive design (max-width: 430px)
- Smooth animations and transitions
- Touch-friendly interface optimized for Base App

### 🔄 **Progressive Flow**
1. **Initial**: Question Card → Answer Input → Submit
2. **After Answer**: Status Bar → Community Feed with Popular/Recent tabs
3. **Your answer appears naturally integrated with community responses**

### 🏆 **Simple Rewards System**
- 10 tokens per daily answer
- Streak multiplier tracking
- Visual progress indicators

### 👥 **Community Integration**
- Popular/Recent tabs for sorting community answers  
- Like/share functionality
- Real-time community insights

## Tech Stack

- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS  
- **Database**: Supabase (with localStorage fallback)
- **Blockchain**: Base Network + OnchainKit + Wagmi
- **Authentication**: Farcaster integration via MiniKit + Wallet connection
- **State Management**: Custom hooks + Supabase integration
- **Animation**: CSS transitions + custom animations

## Component Architecture

```
src/
├── components/
│   ├── QuestionCard.tsx      # Minimal card displaying daily question
│   ├── AnswerInput.tsx       # Text area + submit with loading states
│   ├── StatusBar.tsx         # Streak/tokens/answered status display
│   ├── CommunityFeed.tsx     # Unified feed with Popular/Recent tabs
│   └── AnswerCard.tsx        # Individual community response cards
├── hooks/
│   └── useApp.ts            # Main app state management
├── lib/
│   └── mockData.ts          # Mock questions and community data
└── types/
    └── index.ts             # TypeScript definitions
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create `.env.local`:

```env
# OnchainKit Configuration (for Base App integration)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here

# Base App Domain (update when deployed)
NEXT_PUBLIC_APP_DOMAIN=your-domain.vercel.app

# Supabase Configuration (optional - app works with localStorage fallback)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Base App Integration

### Farcaster Manifest

The app includes a Farcaster manifest at `/.well-known/farcaster.json` for Base App registration.

**Note**: You'll need to generate the `accountAssociation` fields with your Farcaster credentials for production deployment.

### MiniKit Integration (Implemented) ✅

Full Base App integration is now implemented:

1. **Authentication**: Real Farcaster authentication via MiniKit
   - Automatic auth when running in Base App
   - Fallback mock auth for development
   - Sign-in screen for unauthenticated users

2. **Timeline Sharing**: Direct posting to Farcaster timeline
   - Success modal with "Share to Timeline" button after answering
   - `useComposeCast` integration for seamless sharing
   - Rich embed links back to the app

3. **Providers Setup**:
   - MiniKit provider with OnchainKit
   - Wagmi provider for Base network
   - React Query for state management

### Share Flow

After answering the daily question:
1. Success modal appears with token reward
2. "Share to Timeline" button posts to Farcaster
3. Shared cast includes answer excerpt + app embed
4. Success confirmation with community redirect

## Design Philosophy

### Instagram-Minimal Aesthetic
- Clean typography with generous whitespace
- Subtle shadows and rounded corners
- Consistent Base blue (#0052FF) accent color
- Focus on content over chrome

### Progressive UX Flow
- Question-first: Hide everything except today's question until answered
- Smooth animations guide user through states
- Community feed reveals after engagement

## Deployment

Deploy to Vercel with the included configuration:

```bash
vercel --prod
```

The `vercel.json` ensures proper routing and CORS headers for the Farcaster manifest.

## Development

### Mock Data
Realistic mock data in `src/lib/mockData.ts` with rotating questions and community responses.

### State Management
Simple hooks-based state via `useApp` for user auth, questions, and community data.

### Responsive Design
Mobile-first approach optimized for Base App's 430px container width.

---

Built with ❤️ for the Base ecosystem.
