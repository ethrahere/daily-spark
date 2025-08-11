-- Daily Spark Database Schema for Supabase

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar VARCHAR(10) DEFAULT '👤',
  farcaster_fid INTEGER UNIQUE,
  wallet_address VARCHAR(42),
  ens_name VARCHAR(255),
  ens_avatar TEXT,
  tokens INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  total_upvotes_received INTEGER DEFAULT 0,
  total_upvotes_given INTEGER DEFAULT 0,
  early_bird_count INTEGER DEFAULT 0,
  has_answered_today BOOLEAN DEFAULT false,
  last_answer_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table (daily questions)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category VARCHAR(50),
  date DATE UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id) -- One answer per user per question
);

-- Suggested questions table
CREATE TABLE IF NOT EXISTS suggested_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  votes INTEGER DEFAULT 0,
  is_selected BOOLEAN DEFAULT false,
  selected_date DATE,
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vote tracking for suggested questions
CREATE TABLE IF NOT EXISTS question_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES suggested_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id) -- One vote per user per question
);

-- Answer likes tracking
CREATE TABLE IF NOT EXISTS answer_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(answer_id, user_id) -- One like per user per answer
);

-- Token rewards tracking
CREATE TABLE IF NOT EXISTS token_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User vote stats for daily limits
CREATE TABLE IF NOT EXISTS user_vote_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  votes_used_today INTEGER DEFAULT 0,
  last_vote_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One record per user
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_farcaster_fid ON users(farcaster_fid);
CREATE INDEX IF NOT EXISTS idx_questions_date ON questions(date);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_suggested_questions_votes ON suggested_questions(votes DESC);
CREATE INDEX IF NOT EXISTS idx_suggested_questions_selected ON suggested_questions(is_selected);
CREATE INDEX IF NOT EXISTS idx_token_rewards_user_id ON token_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vote_stats_date ON user_vote_stats(last_vote_date);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vote_stats_updated_at BEFORE UPDATE ON user_vote_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (today's question)
INSERT INTO questions (text, category, date) 
VALUES (
  'If you could have dinner with anyone from history, who would it be and what would you ask them?',
  'imagination',
  CURRENT_DATE
) ON CONFLICT (date) DO NOTHING;

-- Sample suggested questions
INSERT INTO suggested_questions (text, submitted_by, votes, category) VALUES
  ('What''s the most valuable lesson you learned from a failure?', (SELECT id FROM users WHERE username = 'alice' LIMIT 1), 15, 'growth'),
  ('If you could instantly master any skill, what would it be and why?', (SELECT id FROM users WHERE username = 'bob' LIMIT 1), 12, 'imagination'),
  ('What''s a conspiracy theory you secretly think might be true?', (SELECT id FROM users WHERE username = 'charlie' LIMIT 1), 8, 'fun'),
  ('What''s one thing you wish you could tell your younger self?', (SELECT id FROM users WHERE username = 'diana' LIMIT 1), 6, 'reflection')
ON CONFLICT DO NOTHING;