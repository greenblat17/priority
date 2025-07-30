import OpenAI from 'openai'

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Optional: Add timeout and retry configuration
  timeout: 30000, // 30 seconds
  maxRetries: 3,
})

// Validate API key is present
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key') {
  console.warn('OpenAI API key is not configured. AI analysis will not work.')
}

export default openai