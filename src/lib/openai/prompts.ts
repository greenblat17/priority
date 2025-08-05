import { AnalysisPromptContext, TaskAnalysisResponse } from '@/types/analysis'

export function buildAnalysisPrompt(context: AnalysisPromptContext): string {
  const { task, manifest } = context
  
  // Build context section
  let contextSection = 'Product Context:\n'
  if (manifest) {
    contextSection += `- Product: ${manifest.product_name || 'Not specified'}\n`
    contextSection += `- Description: ${manifest.product_description || 'Not specified'}\n`
    contextSection += `- Target Audience: ${manifest.target_audience || 'Not specified'}\n`
    contextSection += `- Value Proposition: ${manifest.value_proposition || 'Not specified'}\n`
    contextSection += `- Current Stage: ${manifest.current_stage || 'Not specified'}\n`
    contextSection += `- Business Model: ${manifest.business_model || 'Not specified'}\n`
    if (manifest.tech_stack) {
      contextSection += `- Tech Stack: ${JSON.stringify(manifest.tech_stack)}\n`
    }
  } else {
    contextSection += 'No product context available. Analyze based on general software development best practices.\n'
  }

  return `You are an AI task analyst for a solo founder's task management system. Your job is to analyze tasks and provide actionable insights that align with their business goals and current stage.

${contextSection}

Task Details:
- Description: ${task.description}
- Source: ${task.source || 'Not specified'}
- Customer Info: ${task.customer_info || 'None provided'}

Please analyze this task and provide a response in JSON format with the following structure:

{
  "category": "bug|feature|improvement|business|other",
  "priority": <number 1-10>,
  "complexity": "easy|medium|hard",
  "estimated_hours": <decimal number>,
  "confidence_score": <number 0-100>,
  "implementation_spec": "<detailed multi-line specification>",
  "ice_impact": <number 1-10>,
  "ice_confidence": <number 1-10>,
  "ice_ease": <number 1-10>,
  "ice_reasoning": {
    "impact": "<why this impact score>",
    "confidence": "<why this confidence score>",
    "ease": "<why this ease score>"
  },
  "reasoning": {
    "category_reasoning": "<why this category>",
    "priority_reasoning": "<why this priority score>",
    "complexity_reasoning": "<why this complexity level>"
  }
}

Guidelines for analysis:

1. Category Classification:
   - bug: Something is broken or not working as expected
   - feature: New functionality request
   - improvement: Enhancement to existing functionality
   - business: Marketing, sales, or operational task
   - other: Doesn't fit above categories

2. Priority Score (1-10) - LEGACY, still required but use ICE for actual prioritization

3. ICE Prioritization Framework:
   
   Impact (1-10): How much will this affect key metrics?
   - 9-10: Game-changing impact on revenue, user retention, or core metrics
   - 7-8: Significant positive impact on important metrics
   - 5-6: Moderate impact, noticeable improvements
   - 3-4: Minor impact, incremental improvements
   - 1-2: Minimal impact on metrics
   
   Confidence (1-10): How sure are we about the impact?
   - 9-10: Very high confidence, backed by data or clear user feedback
   - 7-8: High confidence, strong indicators of success
   - 5-6: Moderate confidence, reasonable assumptions
   - 3-4: Low confidence, many unknowns
   - 1-2: Very low confidence, mostly guessing
   
   Ease (1-10): How easy is this to implement?
   - 9-10: Very easy, <2 hours, no dependencies
   - 7-8: Easy, <4 hours, minimal complexity
   - 5-6: Moderate, 4-16 hours, some complexity
   - 3-4: Hard, 16-40 hours, significant complexity
   - 1-2: Very hard, >40 hours, major architectural changes
   
   ICE Score = Impact × Confidence × Ease (1-1000)
   
   Consider for Impact:
   - Business metrics (revenue, conversion, retention)
   - User satisfaction and experience
   - Strategic alignment with product goals
   - Current product stage priorities
   - Target audience needs
   
   Consider for Confidence:
   - User feedback or requests
   - Market research or competitors
   - Past similar implementations
   - Data supporting the hypothesis
   
   Consider for Ease:
   - Technical complexity
   - Dependencies on other systems
   - Team expertise
   - Available resources

4. Complexity:
   - easy: <4 hours, straightforward implementation
   - medium: 4-16 hours, some complexity or unknowns
   - hard: >16 hours, significant complexity or dependencies

5. Implementation Specification:
   Create a detailed specification that a developer can follow, including:
   - Clear problem description
   - Proposed solution approach
   - Step-by-step implementation plan
   - Key technical considerations
   - Test cases to verify the solution
   - Edge cases to handle
   - Expected user experience changes
   
   Make the spec actionable and specific to the tech stack when known.

6. Confidence Score (0-100):
   Rate your confidence in the analysis based on:
   - Clarity of the task description
   - Availability of context
   - Your understanding of the technical requirements

Provide thoughtful reasoning for your categorization, priority, and complexity assessments.`
}

export function validateAnalysisResponse(response: any): TaskAnalysisResponse {
  // Validate required fields
  if (!response.category || !['bug', 'feature', 'improvement', 'business', 'other'].includes(response.category)) {
    throw new Error('Invalid or missing category')
  }
  
  if (typeof response.priority !== 'number' || response.priority < 1 || response.priority > 10) {
    throw new Error('Invalid or missing priority (must be 1-10)')
  }
  
  if (!response.complexity || !['easy', 'medium', 'hard'].includes(response.complexity)) {
    throw new Error('Invalid or missing complexity')
  }
  
  if (typeof response.estimated_hours !== 'number' || response.estimated_hours <= 0) {
    throw new Error('Invalid or missing estimated_hours')
  }
  
  if (typeof response.confidence_score !== 'number' || response.confidence_score < 0 || response.confidence_score > 100) {
    throw new Error('Invalid or missing confidence_score (must be 0-100)')
  }
  
  if (!response.implementation_spec || typeof response.implementation_spec !== 'string') {
    throw new Error('Invalid or missing implementation_spec')
  }
  
  // Validate ICE fields
  if (typeof response.ice_impact !== 'number' || response.ice_impact < 1 || response.ice_impact > 10) {
    throw new Error('Invalid or missing ice_impact (must be 1-10)')
  }
  
  if (typeof response.ice_confidence !== 'number' || response.ice_confidence < 1 || response.ice_confidence > 10) {
    throw new Error('Invalid or missing ice_confidence (must be 1-10)')
  }
  
  if (typeof response.ice_ease !== 'number' || response.ice_ease < 1 || response.ice_ease > 10) {
    throw new Error('Invalid or missing ice_ease (must be 1-10)')
  }
  
  if (!response.ice_reasoning || typeof response.ice_reasoning !== 'object') {
    throw new Error('Invalid or missing ice_reasoning')
  }
  
  return {
    category: response.category,
    priority: Math.round(response.priority),
    complexity: response.complexity,
    estimated_hours: response.estimated_hours,
    confidence_score: Math.round(response.confidence_score),
    implementation_spec: response.implementation_spec,
    ice_impact: Math.round(response.ice_impact),
    ice_confidence: Math.round(response.ice_confidence),
    ice_ease: Math.round(response.ice_ease),
    ice_reasoning: response.ice_reasoning,
    reasoning: response.reasoning
  }
}