import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Generate a secure API key
export function generateApiKey(): string {
  // Format: tp_live_<32 random characters>
  const randomBytes = crypto.randomBytes(24)
  const randomString = randomBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  
  return `tp_live_${randomString}`
}

// Hash API key for storage
export async function hashApiKey(apiKey: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(apiKey, salt)
}

// Verify API key against hash
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(apiKey, hash)
  } catch (error) {
    console.error('[API Key Verify] Error comparing:', error)
    return false
  }
}

// Get preview of API key (last 4 characters)
export function getApiKeyPreview(apiKey: string): string {
  return apiKey.slice(-4)
}

// Parse API key from Authorization header
export function parseApiKeyFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  // Support both "Bearer <key>" and direct key
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  
  // Check if it looks like our API key format
  if (authHeader.startsWith('tp_live_')) {
    return authHeader
  }
  
  return null
}