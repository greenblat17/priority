import openai from '@/lib/openai/client'
import type { Task } from '@/types/task'
import type { TaskSimilarity } from '@/types/duplicate'
import { cosineSimilarity } from './duplicate-detection-utils'

// Cache embeddings for the session to reduce API calls
const embeddingCache = new Map<string, number[]>()

/**
 * Generate an embedding for a given text using OpenAI's embedding model
 */
export async function getEmbedding(text: string): Promise<number[]> {
  // Check cache first
  const cacheKey = text.toLowerCase().trim()
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    const embedding = response.data[0].embedding
    
    // Cache the result
    embeddingCache.set(cacheKey, embedding)
    
    return embedding
  } catch (error) {
    console.error('Failed to generate embedding:', error)
    throw new Error('Failed to generate embedding for duplicate detection')
  }
}

/**
 * Generate embeddings for multiple texts in a single API call
 */
export async function getBatchEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  
  // Check cache and separate cached vs uncached
  const results: (number[] | null)[] = new Array(texts.length)
  const uncachedTexts: string[] = []
  const uncachedIndices: number[] = []
  
  texts.forEach((text, index) => {
    const cacheKey = text.toLowerCase().trim()
    if (embeddingCache.has(cacheKey)) {
      results[index] = embeddingCache.get(cacheKey)!
    } else {
      results[index] = null
      uncachedTexts.push(text)
      uncachedIndices.push(index)
    }
  })
  
  // If all are cached, return immediately
  if (uncachedTexts.length === 0) {
    return results as number[][]
  }
  
  try {
    // Batch API call for uncached texts
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: uncachedTexts,
    })
    
    // Process responses and update cache
    response.data.forEach((item, i) => {
      const originalIndex = uncachedIndices[i]
      const embedding = item.embedding
      const cacheKey = texts[originalIndex].toLowerCase().trim()
      
      // Cache the result
      embeddingCache.set(cacheKey, embedding)
      results[originalIndex] = embedding
    })
    
    return results as number[][]
  } catch (error) {
    console.error('Failed to generate batch embeddings:', error)
    throw new Error('Failed to generate embeddings for duplicate detection')
  }
}


/**
 * Detect potential duplicate tasks based on description similarity
 */
export async function detectDuplicates(
  newTaskDescription: string,
  existingTasks: Task[],
  similarityThreshold: number = 0.85
): Promise<TaskSimilarity[]> {
  // Quick pre-filter: skip if description is very short
  if (newTaskDescription.trim().length < 10) {
    return []
  }

  // Filter out tasks that are already completed or blocked
  const activeTasks = existingTasks.filter(
    task => task.status === 'pending' || task.status === 'in_progress'
  )

  if (activeTasks.length === 0) {
    return []
  }

  // Quick text-based pre-filtering (case-insensitive)
  const newTaskLower = newTaskDescription.toLowerCase()
  const potentialMatches = activeTasks.filter(task => {
    const taskLower = task.description.toLowerCase()
    // Check for substring matches or high word overlap
    return taskLower.includes(newTaskLower.substring(0, 20)) || 
           newTaskLower.includes(taskLower.substring(0, 20)) ||
           getWordOverlap(newTaskLower, taskLower) > 0.5
  })

  // If no potential matches, skip embedding generation
  if (potentialMatches.length === 0) {
    return []
  }

  try {
    console.log(`[Duplicate Detection] Checking ${potentialMatches.length} potential matches from ${activeTasks.length} active tasks`)
    
    // Prepare all texts for batch processing
    const allTexts = [newTaskDescription, ...potentialMatches.map(t => t.description)]
    
    // Generate all embeddings in parallel with batch processing
    const startTime = Date.now()
    const embeddings = await getBatchEmbeddings(allTexts)
    console.log(`[Duplicate Detection] Generated ${embeddings.length} embeddings in ${Date.now() - startTime}ms`)
    
    // Extract embeddings
    const newEmbedding = embeddings[0]
    const taskEmbeddings = embeddings.slice(1)
    
    // Calculate similarities
    const similarities: TaskSimilarity[] = potentialMatches.map((task, index) => {
      const similarity = cosineSimilarity(newEmbedding, taskEmbeddings[index])
      return {
        taskId: task.id,
        task,
        similarity,
        embedding: taskEmbeddings[index]
      }
    })

    // Filter tasks above similarity threshold and sort by similarity
    const potentialDuplicates = similarities
      .filter(s => s.similarity >= similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)

    return potentialDuplicates
  } catch (error) {
    console.error('Duplicate detection failed:', error)
    // Return empty array on failure to not block task creation
    return []
  }
}

/**
 * Calculate word overlap ratio between two strings
 */
function getWordOverlap(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2))
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2))
  
  if (words1.size === 0 || words2.size === 0) return 0
  
  let overlap = 0
  words1.forEach(word => {
    if (words2.has(word)) overlap++
  })
  
  return overlap / Math.min(words1.size, words2.size)
}

/**
 * Clear the embedding cache (useful for testing or memory management)
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear()
}