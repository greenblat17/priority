// AI Analysis types

export interface TaskAnalysisRequest {
  taskId: string
}

export interface TaskAnalysisResponse {
  category: 'bug' | 'feature' | 'improvement' | 'business' | 'other'
  priority: number // 1-10
  complexity: 'easy' | 'medium' | 'hard'
  estimated_hours: number
  confidence_score: number // 0-100
  implementation_spec: string
  reasoning?: {
    category_reasoning?: string
    priority_reasoning?: string
    complexity_reasoning?: string
  }
}

export interface TaskAnalysisError {
  error: string
  code?: string
  details?: any
}

// Prompt builder types
export interface AnalysisPromptContext {
  task: {
    description: string
    source?: string | null
    customer_info?: string | null
  }
  manifest?: {
    product_name?: string
    product_description?: string
    target_audience?: string
    value_proposition?: string
    current_stage?: string
    tech_stack?: any
    business_model?: string
  } | null
}

// Database analysis record (matches Supabase schema)
export interface TaskAnalysisRecord {
  id?: string
  task_id: string
  category: 'bug' | 'feature' | 'improvement' | 'business' | 'other'
  priority: number
  complexity: 'easy' | 'medium' | 'hard'
  estimated_hours: number
  confidence_score: number
  implementation_spec: string
  duplicate_of?: string | null
  similar_tasks?: any | null
  analyzed_at?: string
}