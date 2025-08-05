-- Migration: Add ICE prioritization fields to task_analyses
-- ICE Framework: Impact, Confidence, Ease
-- Each metric is scored 1-10, final score = Impact × Confidence × Ease

BEGIN;

-- Add ICE fields to task_analyses table
ALTER TABLE task_analyses
ADD COLUMN IF NOT EXISTS ice_impact INTEGER CHECK (ice_impact >= 1 AND ice_impact <= 10),
ADD COLUMN IF NOT EXISTS ice_confidence INTEGER CHECK (ice_confidence >= 1 AND ice_confidence <= 10),
ADD COLUMN IF NOT EXISTS ice_ease INTEGER CHECK (ice_ease >= 1 AND ice_ease <= 10),
ADD COLUMN IF NOT EXISTS ice_score INTEGER GENERATED ALWAYS AS (ice_impact * ice_confidence * ice_ease) STORED,
ADD COLUMN IF NOT EXISTS ice_reasoning JSONB;

-- Create index on ice_score for efficient sorting
CREATE INDEX IF NOT EXISTS idx_task_analyses_ice_score ON task_analyses(ice_score DESC);

-- Add comments to document the fields
COMMENT ON COLUMN task_analyses.ice_impact IS 'Impact score (1-10): How much will this affect key metrics?';
COMMENT ON COLUMN task_analyses.ice_confidence IS 'Confidence score (1-10): How sure are we about the impact?';
COMMENT ON COLUMN task_analyses.ice_ease IS 'Ease score (1-10): How easy is this to implement?';
COMMENT ON COLUMN task_analyses.ice_score IS 'ICE Score = Impact × Confidence × Ease (1-1000)';
COMMENT ON COLUMN task_analyses.ice_reasoning IS 'AI reasoning for each ICE component as JSON {impact: string, confidence: string, ease: string}';

-- Migrate existing priority values to ICE scores
-- Map priority 1-10 to reasonable ICE values
UPDATE task_analyses
SET 
    ice_impact = CASE 
        WHEN priority >= 9 THEN 9
        WHEN priority >= 7 THEN 8
        WHEN priority >= 5 THEN 6
        WHEN priority >= 3 THEN 5
        ELSE 4
    END,
    ice_confidence = CASE 
        WHEN confidence_score >= 90 THEN 9
        WHEN confidence_score >= 80 THEN 8
        WHEN confidence_score >= 70 THEN 7
        WHEN confidence_score >= 60 THEN 6
        WHEN confidence_score >= 50 THEN 5
        ELSE 4
    END,
    ice_ease = CASE 
        WHEN complexity = 'easy' THEN 8
        WHEN complexity = 'medium' THEN 5
        WHEN complexity = 'hard' THEN 3
        ELSE 5
    END,
    ice_reasoning = jsonb_build_object(
        'impact', 'Migrated from legacy priority score',
        'confidence', 'Based on AI confidence score',
        'ease', 'Based on complexity assessment'
    )
WHERE ice_impact IS NULL;

COMMIT;

-- Add comment about the ICE framework
COMMENT ON TABLE task_analyses IS 'Task analysis results including ICE prioritization (Impact × Confidence × Ease)';