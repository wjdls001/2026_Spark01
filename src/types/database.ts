export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string
          avatar_url: string | null
          gender: string | null
          birth_year: number | null
          exercise_level: string
          trust_score: number
          preferred_sports: string[]
          workout_traits: string[]
          activity_area: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nickname: string
          avatar_url?: string | null
          gender?: string | null
          birth_year?: number | null
          exercise_level?: string
          trust_score?: number
          preferred_sports?: string[]
          workout_traits?: string[]
          activity_area?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string
          avatar_url?: string | null
          gender?: string | null
          birth_year?: number | null
          exercise_level?: string
          trust_score?: number
          preferred_sports?: string[]
          workout_traits?: string[]
          activity_area?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sports: {
        Row: {
          id: string
          code: string
          name: string
          category: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          category: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          category?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      sparks: {
        Row: {
          id: string
          host_id: string
          sport_id: string | null
          title: string
          description: string | null
          place_name: string | null
          address: string | null
          latitude: number | null
          longitude: number | null
          scheduled_at: string
          duration_minutes: number | null
          capacity: number
          min_level: string | null
          max_level: string | null
          gender_condition: string | null
          age_min: number | null
          age_max: number | null
          status: 'recruiting' | 'closed' | 'in_progress' | 'completed' | 'canceled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          sport_id?: string | null
          title: string
          description?: string | null
          place_name?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          scheduled_at: string
          duration_minutes?: number | null
          capacity?: number
          min_level?: string | null
          max_level?: string | null
          gender_condition?: string | null
          age_min?: number | null
          age_max?: number | null
          status?: 'recruiting' | 'closed' | 'in_progress' | 'completed' | 'canceled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          sport_id?: string | null
          title?: string
          description?: string | null
          place_name?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          scheduled_at?: string
          duration_minutes?: number | null
          capacity?: number
          min_level?: string | null
          max_level?: string | null
          gender_condition?: string | null
          age_min?: number | null
          age_max?: number | null
          status?: 'recruiting' | 'closed' | 'in_progress' | 'completed' | 'canceled'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      spark_participants: {
        Row: {
          id: string
          spark_id: string
          user_id: string
          role: 'host' | 'member'
          status: 'requested' | 'approved' | 'rejected' | 'canceled' | 'attended' | 'no_show'
          requested_at: string
          approved_at: string | null
          canceled_at: string | null
        }
        Insert: {
          id?: string
          spark_id: string
          user_id: string
          role?: 'host' | 'member'
          status?: 'requested' | 'approved' | 'rejected' | 'canceled' | 'attended' | 'no_show'
          requested_at?: string
          approved_at?: string | null
          canceled_at?: string | null
        }
        Update: {
          id?: string
          spark_id?: string
          user_id?: string
          role?: 'host' | 'member'
          status?: 'requested' | 'approved' | 'rejected' | 'canceled' | 'attended' | 'no_show'
          requested_at?: string
          approved_at?: string | null
          canceled_at?: string | null
        }
        Relationships: []
      }
      exercise_sessions: {
        Row: {
          id: string
          user_id: string
          spark_id: string | null
          sport_id: string | null
          mode: 'solo' | 'spark'
          title: string | null
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          distance_meters: number | null
          calories: number | null
          memo: string | null
          status: 'in_progress' | 'completed' | 'canceled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          spark_id?: string | null
          sport_id?: string | null
          mode: 'solo' | 'spark'
          title?: string | null
          started_at: string
          ended_at?: string | null
          duration_seconds?: number | null
          distance_meters?: number | null
          calories?: number | null
          memo?: string | null
          status?: 'in_progress' | 'completed' | 'canceled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          spark_id?: string | null
          sport_id?: string | null
          mode?: 'solo' | 'spark'
          title?: string | null
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          distance_meters?: number | null
          calories?: number | null
          memo?: string | null
          status?: 'in_progress' | 'completed' | 'canceled'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string | null
          challenge_type: 'exercise' | 'spark' | 'event'
          goal_count: number
          reward_xp: number
          starts_at: string | null
          ends_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          challenge_type: 'exercise' | 'spark' | 'event'
          goal_count?: number
          reward_xp?: number
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          challenge_type?: 'exercise' | 'spark' | 'event'
          goal_count?: number
          reward_xp?: number
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          current_count: number
          completed_at: string | null
          reward_claimed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          current_count?: number
          completed_at?: string | null
          reward_claimed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          current_count?: number
          completed_at?: string | null
          reward_claimed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          related_id: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          related_id?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          related_id?: string | null
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      spark_reviews: {
        Row: {
          id: string
          spark_id: string
          reviewer_id: string
          reviewee_id: string
          keywords: string[]
          review_type: 'positive' | 'negative'
          created_at: string
        }
        Insert: {
          id?: string
          spark_id: string
          reviewer_id: string
          reviewee_id: string
          keywords?: string[]
          review_type?: 'positive' | 'negative'
          created_at?: string
        }
        Update: {
          id?: string
          spark_id?: string
          reviewer_id?: string
          reviewee_id?: string
          keywords?: string[]
          review_type?: 'positive' | 'negative'
          created_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_user_id: string | null
          spark_id: string | null
          reason: string
          description: string | null
          status: 'submitted' | 'reviewing' | 'resolved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          target_user_id?: string | null
          spark_id?: string | null
          reason: string
          description?: string | null
          status?: 'submitted' | 'reviewing' | 'resolved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          target_user_id?: string | null
          spark_id?: string | null
          reason?: string
          description?: string | null
          status?: 'submitted' | 'reviewing' | 'resolved' | 'rejected'
          created_at?: string
        }
        Relationships: []
      }
      device_connections: {
        Row: {
          id: string
          user_id: string
          provider: string
          status: 'connected' | 'disconnected'
          connected_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          status?: 'connected' | 'disconnected'
          connected_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          status?: 'connected' | 'disconnected'
          connected_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      terms_agreements: {
        Row: {
          id: string
          user_id: string
          terms_type: string
          version: string
          agreed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          terms_type: string
          version: string
          agreed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          terms_type?: string
          version?: string
          agreed_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Sport = Database['public']['Tables']['sports']['Row']
export type Spark = Database['public']['Tables']['sparks']['Row']
export type SparkParticipant = Database['public']['Tables']['spark_participants']['Row']
export type ExerciseSession = Database['public']['Tables']['exercise_sessions']['Row']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type ChallengeProgress = Database['public']['Tables']['challenge_progress']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
