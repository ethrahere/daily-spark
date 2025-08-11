// Supabase Database Types

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          avatar: string
          farcaster_fid: number | null
          wallet_address: string | null
          ens_name: string | null
          ens_avatar: string | null
          tokens: number
          streak: number
          total_upvotes_received: number
          total_upvotes_given: number
          early_bird_count: number
          has_answered_today: boolean
          last_answer_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          avatar?: string
          farcaster_fid?: number | null
          wallet_address?: string | null
          ens_name?: string | null
          ens_avatar?: string | null
          tokens?: number
          streak?: number
          total_upvotes_received?: number
          total_upvotes_given?: number
          early_bird_count?: number
          has_answered_today?: boolean
          last_answer_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar?: string
          farcaster_fid?: number | null
          wallet_address?: string | null
          ens_name?: string | null
          ens_avatar?: string | null
          tokens?: number
          streak?: number
          total_upvotes_received?: number
          total_upvotes_given?: number
          early_bird_count?: number
          has_answered_today?: boolean
          last_answer_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          text: string
          category: string | null
          date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          text: string
          category?: string | null
          date: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          text?: string
          category?: string | null
          date?: string
          is_active?: boolean
          created_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          question_id: string
          user_id: string
          text: string
          likes: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_id: string
          text: string
          likes?: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          user_id?: string
          text?: string
          likes?: number
          created_at?: string
        }
      }
      suggested_questions: {
        Row: {
          id: string
          text: string
          submitted_by: string
          votes: number
          is_selected: boolean
          selected_date: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          text: string
          submitted_by: string
          votes?: number
          is_selected?: boolean
          selected_date?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          text?: string
          submitted_by?: string
          votes?: number
          is_selected?: boolean
          selected_date?: string | null
          category?: string | null
          created_at?: string
        }
      }
      question_votes: {
        Row: {
          id: string
          question_id: string
          user_id: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_id: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          user_id?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      answer_likes: {
        Row: {
          id: string
          answer_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          answer_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          answer_id?: string
          user_id?: string
          created_at?: string
        }
      }
      token_rewards: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          description?: string
          created_at?: string
        }
      }
      user_vote_stats: {
        Row: {
          id: string
          user_id: string
          votes_used_today: number
          last_vote_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          votes_used_today?: number
          last_vote_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          votes_used_today?: number
          last_vote_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}