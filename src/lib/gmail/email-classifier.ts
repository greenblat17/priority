import OpenAI from 'openai'
import { EmailClassification, FeedbackType } from '@/types/gmail'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class EmailClassifier {
  private gtmManifest: any = null

  constructor(private userId: string) {}

  async initialize() {
    // Fetch GTM manifest if available
    const supabase = await createClient()
    const { data } = await supabase
      .from('gtm_manifests')
      .select('*')
      .eq('user_id', this.userId)
      .single()
    
    if (data) {
      this.gtmManifest = data
    }
  }

  async classifyEmail(email: {
    from: string
    subject: string
    content: string
  }): Promise<EmailClassification> {
    try {
      let systemPrompt = `You are an AI assistant that classifies emails for a solo founder's task management system.
Your job is to determine if an email contains user feedback that should be tracked as a task.

${this.gtmManifest ? `
PRODUCT CONTEXT:
- Product Name: ${this.gtmManifest.product_name || 'Unknown'}
- Description: ${this.gtmManifest.product_description || 'Not specified'}
- Target Audience: ${this.gtmManifest.target_audience || 'Not specified'}
- Value Proposition: ${this.gtmManifest.value_proposition || 'Not specified'}
- Current Stage: ${this.gtmManifest.current_stage || 'Unknown'}
- Business Model: ${this.gtmManifest.business_model || 'Not specified'}

Use this context to better understand if the email is relevant feedback about this specific product.
` : ''}

CLASSIFICATION APPROACH:
Step 1: Determine if the email is ABOUT ${this.gtmManifest?.product_name || 'your product'} (mentions it, refers to it, or discusses its features/issues)
Step 2: If yes, check if it contains feedback (opinions, issues, requests, questions about usage)
Step 3: When uncertain, err on the side of classifying as feedback - users often write brief, casual feedback

FEEDBACK INDICATORS (Strong signals that an email is feedback):
Performance Issues: slow, fast, lag, freeze, crash, hang, stuck, loading, spinning, timeout
Quality Problems: bug, broken, error, issue, problem, wrong, incorrect, fail, doesn't work, not working
User Experience: confused, frustrating, annoying, difficult, hard, easy, simple, intuitive, love, hate
Feature Requests: can you, please add, would be nice, need, want, wish, hope, suggest, idea
Questions: how do I, where is, what does, why doesn't, when will
Product References: it, your app, the tool, this thing, your product, the software, the platform

IMPORTANT: Only classify emails where the sender is GIVING feedback about ${this.gtmManifest?.product_name || 'YOUR product'}, not ASKING for feedback about their own product.

Feedback emails include:
- Bug reports: Users reporting specific issues, errors, or problems they experienced with ${this.gtmManifest?.product_name || 'your product'}
- Feature requests: Users suggesting new features or improvements they want in ${this.gtmManifest?.product_name || 'your product'}
- Questions: Users asking how to use ${this.gtmManifest?.product_name || 'your product'} or needing help with specific features
- Complaints: Users expressing frustration or dissatisfaction with ${this.gtmManifest?.product_name || 'your product'}
- Praise: Users sharing positive experiences or testimonials about ${this.gtmManifest?.product_name || 'your product'}

NOT feedback emails include:
- Someone asking YOU for feedback about THEIR product/service
- Marketing/promotional emails from other companies
- Newsletters or updates from other services
- Automated notifications (password resets, confirmations, etc.)
- Personal conversations not about ${this.gtmManifest?.product_name || 'your product'}
- Cold outreach or sales pitches
- Survey requests from other companies asking about THEIR product
- System alerts or service notifications
- Spam
- Emails primarily about other products or services

COMMUNICATION STYLES:
- Some users write detailed, polite feedback
- Others are brief and direct: "Doesn't work", "Too slow", "Broken"
- Frustrated users may be terse: "This sucks", "Waste of time", "Useless"
- Happy users might be brief too: "Love it!", "Finally!", "Perfect"
- Technical users report bugs clinically: "NPE on line 42", "500 error", "Segfault"
- Non-technical users describe symptoms: "The spinny thing won't stop", "It's stuck"

ALL OF THESE ARE VALID FEEDBACK - don't dismiss brief messages!

${this.gtmManifest ? `
PRIORITY GUIDANCE based on business context:
- High Priority (8-10): Issues affecting ${this.gtmManifest.target_audience}, core value proposition, or business model
- Medium Priority (4-7): Feature requests aligned with product vision, general questions
- Low Priority (1-3): Nice-to-have features, praise, minor issues
` : ''}

Examples to help classification:
SHORT FEEDBACK (all valid):
- ✅ FEEDBACK: "Doesn't work"
- ✅ FEEDBACK: "Too slow"
- ✅ FEEDBACK: "Crashed again"
- ✅ FEEDBACK: "Still waiting for dark mode"
- ✅ FEEDBACK: "Finally something that works!"
- ✅ FEEDBACK: "Why is export broken?"
- ✅ FEEDBACK: "Login issues"
- ✅ FEEDBACK: "It's buggy"
- ✅ FEEDBACK: "App works too slow"
- ✅ FEEDBACK: "Loading takes forever"
- ✅ FEEDBACK: "Can't save"
- ✅ FEEDBACK: "Error message won't go away"

DETAILED FEEDBACK:
- ✅ FEEDBACK: "Your app crashed when I tried to export data"
- ✅ FEEDBACK: "I love how easy it is to use your task manager!"
- ✅ FEEDBACK: "Can you add a dark mode feature?"

NOT FEEDBACK (asking for YOUR opinion on THEIR product):
- ❌ NOT FEEDBACK: "We'd love to hear your feedback about our new feature"
- ❌ NOT FEEDBACK: "Please take our survey about your experience with OUR product"
- ❌ NOT FEEDBACK: "I'm the CEO of X, can I get your thoughts on our product?"
- ❌ NOT FEEDBACK: "Check out our new tool and let us know what you think"

IMPORTANT: When in doubt, classify as feedback. Brief complaints like "App works too slow" or "It's broken" are valuable feedback that should be captured. Users expressing frustration about ${this.gtmManifest?.product_name || 'your product'} are giving feedback, even if brief or harsh.

UNCERTAINTY HANDLING:
- If the email mentions problems, issues, or experiences that COULD be about ${this.gtmManifest?.product_name || 'your product'}, classify as feedback
- Brief messages with technical terms (error, crash, slow) should be classified as feedback
- If someone is complaining about ANY aspect that could relate to ${this.gtmManifest?.product_name || 'your product'}, it's feedback
- Set confidence based on clarity: Clear feedback = 0.8-1.0, Likely feedback = 0.6-0.8, Possibly feedback = 0.5-0.6
- Only classify as NOT feedback if you're certain it's about something else entirely

Respond with a JSON object containing:
{
  "isFeedback": boolean,
  "confidence": number (0-1),
  "category": "bug_report" | "feature_request" | "question" | "complaint" | "praise" (only if isFeedback is true),
  "suggestedPriority": number (1-10, only if isFeedback is true),
  "summary": "brief summary of the feedback" (only if isFeedback is true),
  "suggestedTitle": "a concise, actionable task title (5-10 words) that captures the core issue/request from the email. Examples: 'Fix export crash issue', 'Add dark mode feature', 'Improve loading performance'" (only if isFeedback is true)
}`

      const userPrompt = `Classify this email:

From: ${email.from}
Subject: ${email.subject}
Content: ${email.content.substring(0, 2000)} ${email.content.length > 2000 ? '...' : ''}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      
      console.log('AI Classification Result:', {
        subject: email.subject,
        from: email.from,
        result: result
      })
      
      // Validate and normalize the response
      const classification: EmailClassification = {
        isFeedback: Boolean(result.isFeedback),
        confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0))
      }

      if (classification.isFeedback && result.category) {
        classification.category = result.category as FeedbackType
        classification.suggestedPriority = Math.max(1, Math.min(10, Number(result.suggestedPriority) || 5))
        classification.summary = result.summary || ''
        classification.suggestedTitle = result.suggestedTitle || email.subject
      }

      console.log('Final Classification:', classification)
      
      return classification
    } catch (error) {
      console.error('Email classification error:', error)
      // Default to not feedback if classification fails
      return {
        isFeedback: false,
        confidence: 0
      }
    }
  }

  /**
   * Batch classify multiple emails for efficiency
   */
  async classifyEmails(emails: Array<{
    from: string
    subject: string
    content: string
  }>): Promise<EmailClassification[]> {
    // Process in batches of 5 to avoid rate limits
    const batchSize = 5
    const results: EmailClassification[] = []
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(email => this.classifyEmail(email))
      )
      results.push(...batchResults)
      
      // Add small delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }
}