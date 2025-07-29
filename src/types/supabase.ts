export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          description: string
          source: string | null
          customer_info: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          source?: string | null
          customer_info?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          source?: string | null
          customer_info?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
      task_analyses: {
        Row: {
          id: string
          task_id: string
          category: 'bug' | 'feature' | 'improvement' | 'business' | 'other' | null
          priority: number | null
          complexity: 'easy' | 'medium' | 'hard' | null
          estimated_hours: number | null
          confidence_score: number | null
          implementation_spec: string | null
          duplicate_of: string | null
          similar_tasks: Json | null
          analyzed_at: string
        }
        Insert: {
          id?: string
          task_id: string
          category?: 'bug' | 'feature' | 'improvement' | 'business' | 'other' | null
          priority?: number | null
          complexity?: 'easy' | 'medium' | 'hard' | null
          estimated_hours?: number | null
          confidence_score?: number | null
          implementation_spec?: string | null
          duplicate_of?: string | null
          similar_tasks?: Json | null
          analyzed_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          category?: 'bug' | 'feature' | 'improvement' | 'business' | 'other' | null
          priority?: number | null
          complexity?: 'easy' | 'medium' | 'hard' | null
          estimated_hours?: number | null
          confidence_score?: number | null
          implementation_spec?: string | null
          duplicate_of?: string | null
          similar_tasks?: Json | null
          analyzed_at?: string
        }
      }
      gtm_manifests: {
        Row: {
          id: string
          user_id: string
          product_name: string | null
          product_description: string | null
          target_audience: string | null
          value_proposition: string | null
          current_stage: 'idea' | 'mvp' | 'growth' | 'scale' | null
          tech_stack: Json | null
          business_model: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_name?: string | null
          product_description?: string | null
          target_audience?: string | null
          value_proposition?: string | null
          current_stage?: 'idea' | 'mvp' | 'growth' | 'scale' | null
          tech_stack?: Json | null
          business_model?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_name?: string | null
          product_description?: string | null
          target_audience?: string | null
          value_proposition?: string | null
          current_stage?: 'idea' | 'mvp' | 'growth' | 'scale' | null
          tech_stack?: Json | null
          business_model?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      handle_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}