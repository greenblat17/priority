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
      tasks: {
        Row: {
          id: string
          user_id: string
          description: string
          status: 'pending' | 'in_progress' | 'completed' | 'blocked'
          source: 'internal' | 'customer_request' | 'ai_suggestion' | null
          customer_info: string | null
          created_at: string
          updated_at: string
          group_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
          source?: 'internal' | 'customer_request' | 'ai_suggestion' | null
          customer_info?: string | null
          created_at?: string
          updated_at?: string
          group_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
          source?: 'internal' | 'customer_request' | 'ai_suggestion' | null
          customer_info?: string | null
          created_at?: string
          updated_at?: string
          group_id?: string | null
        }
      }
      task_analyses: {
        Row: {
          id: string
          task_id: string
          category: string
          priority: number
          complexity: 'easy' | 'medium' | 'hard'
          estimated_hours: number
          implementation_spec: string | null
          confidence_score: number | null
          analyzed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          category: string
          priority: number
          complexity: 'easy' | 'medium' | 'hard'
          estimated_hours: number
          implementation_spec?: string | null
          confidence_score?: number | null
          analyzed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          category?: string
          priority?: number
          complexity?: 'easy' | 'medium' | 'hard'
          estimated_hours?: number
          implementation_spec?: string | null
          confidence_score?: number | null
          analyzed_at?: string
          created_at?: string
        }
      }
      task_groups: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gtm_manifests: {
        Row: {
          id: string
          user_id: string
          company_name: string
          product_description: string
          target_audience: string
          key_features: string[]
          value_proposition: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          product_description: string
          target_audience: string
          key_features: string[]
          value_proposition: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          product_description?: string
          target_audience?: string
          key_features?: string[]
          value_proposition?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}