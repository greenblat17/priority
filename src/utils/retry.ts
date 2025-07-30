interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  shouldRetry?: (error: any) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  shouldRetry: (error) => {
    // Retry on network errors or 5xx status codes
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true
    }
    
    // For OpenAI specific errors
    if (error.status >= 500 || error.status === 429) {
      return true
    }
    
    return false
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: any
  let delay = opts.initialDelay

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Check if we should retry
      if (attempt === opts.maxAttempts || !opts.shouldRetry(error)) {
        throw error
      }
      
      // Log retry attempt
      console.log(`Retry attempt ${attempt} after ${delay}ms delay. Error:`, error)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Calculate next delay with exponential backoff
      delay = Math.min(delay * opts.backoffFactor, opts.maxDelay)
    }
  }
  
  throw lastError
}