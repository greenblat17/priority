// GTM (Go-To-Market) Manifest types

export interface GTMManifest {
  id?: string
  user_id: string
  product_name?: string | null
  product_description?: string | null
  target_audience?: string | null
  value_proposition?: string | null
  current_stage?: 'idea' | 'mvp' | 'growth' | 'scale' | null
  tech_stack?: {
    frontend?: string[]
    backend?: string[]
    database?: string[]
    infrastructure?: string[]
    [key: string]: string[] | undefined
  } | null
  business_model?: string | null
  created_at?: string
  updated_at?: string
}

export const GTMStage = {
  IDEA: 'idea',
  MVP: 'mvp',
  GROWTH: 'growth',
  SCALE: 'scale'
} as const

export type GTMStageType = typeof GTMStage[keyof typeof GTMStage]