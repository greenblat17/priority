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
      model: 'text-embedding-ada-002',
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
 * Detect potential duplicate tasks based on description similarity
 */
export async function detectDuplicates(
  newTaskDescription: string,
  existingTasks: Task[],
  similarityThreshold: number = 0.85
): Promise<TaskSimilarity[]> {
  // Filter out tasks that are already completed or blocked
  const activeTasks = existingTasks.filter(
    task => task.status === 'pending' || task.status === 'in_progress'
  )

  if (activeTasks.length === 0) {
    return []
  }

  try {
    // Generate embedding for new task
    const newEmbedding = await getEmbedding(newTaskDescription)

    // Generate embeddings for existing tasks and calculate similarities
    const similarities = await Promise.all(
      activeTasks.map(async (task) => {
        try {
          const taskEmbedding = await getEmbedding(task.description)
          const similarity = cosineSimilarity(newEmbedding, taskEmbedding)
          
          return {
            taskId: task.id,
            task,
            similarity,
            embedding: taskEmbedding
          } as TaskSimilarity
        } catch (error) {
          console.error(`Failed to process task ${task.id}:`, error)
          // Return low similarity for failed tasks
          return {
            taskId: task.id,
            task,
            similarity: 0
          } as TaskSimilarity
        }
      })
    )

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
 * Clear the embedding cache (useful for testing or memory management)
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear()
}