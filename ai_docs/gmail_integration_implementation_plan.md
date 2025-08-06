# Gmail Integration Implementation Plan

## Overview

This document outlines the implementation plan for integrating Gmail with TaskPriority AI to automatically detect and import feedback emails as tasks.

## Feature Goals

- Integrate Gmail accounts via OAuth
- Automatically fetch emails hourly
- Use OpenAI to classify emails as feedback or not
- Create tasks from feedback emails with proper categorization
- Display feedback tasks in a dedicated section

## Implementation Phases

### Phase 1: Foundation Setup

#### 1. Create Integrations Page & Navigation

- Add "Integrations" to sidebar menu
- Create `/integrations` page with Gmail connection UI
- Design connection status indicators

#### 2. Database Schema

```sql
-- Store Gmail integration credentials
create table gmail_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  access_token text,
  refresh_token text,
  token_expiry timestamp,
  email_address text,
  is_active boolean default true,
  last_sync_at timestamp,
  created_at timestamp default now()
);

-- Store processed emails
create table processed_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  gmail_message_id text unique,
  from_email text,
  subject text,
  content text,
  is_feedback boolean,
  confidence_score float,
  processed_at timestamp default now(),
  task_id uuid references tasks(id)
);

-- Add feedback source to tasks
alter table tasks add column source_type text check (source_type in ('manual', 'gmail', 'feedback'));
alter table tasks add column original_email_id uuid references processed_emails(id);
```

### Phase 2: Gmail OAuth Integration

#### 3. Gmail OAuth Setup

- Set up Google Cloud Console project
- Enable Gmail API
- Configure OAuth consent screen
- Implement OAuth flow:
  - Redirect to Google OAuth
  - Handle callback with tokens
  - Store encrypted tokens in database

#### 4. Gmail API Integration

```typescript
// Key functions needed:
- authenticateGmail(userId: string)
- fetchUnreadEmails(userId: string, since?: Date)
- markEmailAsProcessed(messageId: string)
- refreshAccessToken(refreshToken: string)
```

### Phase 3: Email Processing & AI Classification

#### 5. OpenAI Email Classification

```typescript
interface EmailClassification {
  isFeedback: boolean
  confidence: number
  // Only set if isFeedback is true
  category?: 'bug_report' | 'feature_request' | 'question' | 'complaint' | 'praise'
  suggestedPriority?: number
  summary?: string
}

// Prompt structure for OpenAI
const classifyEmail = async (
  email: EmailContent
): Promise<EmailClassification> => {
  // Use GPT-4 to analyze email content
  // If not feedback, only return { isFeedback: false, confidence }
  // If feedback, return full classification
}
```

#### 6. Email Processing Workflow

```typescript
// Hourly cron job workflow:
1. Fetch all active Gmail integrations
2. For each integration:
   - Authenticate with Gmail
   - Fetch new emails since last_sync
   - For each email:
     - Check if already processed (by gmail_message_id)
     - Send to OpenAI for classification
     - If feedback (confidence > 0.7):
       - Save to processed_emails table
       - Create task with source_type='feedback'
       - Link to original email
     - If not feedback:
       - Skip (don't save to database)
       - Log for monitoring purposes only
     - Mark email as read in Gmail
   - Update last_sync_at
```

### Phase 4: UI Implementation

#### 7. Integrations Page Features

- Gmail connection button
- Connection status
- Sync frequency settings
- Email filtering rules
- Test sync button

#### 8. Tasks UI Updates

- Add "Feedback" tab to task views
- Show email source indicator
- Display original email preview
- Add confidence score badge

## Technical Considerations

### Security

- Encrypt Gmail tokens at rest
- Use secure token storage
- Implement token refresh mechanism
- Add rate limiting for API calls

### Performance

- Process emails in background jobs
- Implement pagination for large inboxes
- Cache processed email IDs
- Add circuit breaker for API failures

### User Experience

- Show sync status in UI
- Email processing notifications
- Manual email import option
- Feedback classification override

## Task Breakdown

1. Create integrations page and add to sidebar navigation ✓
2. Set up Gmail OAuth integration ✓
3. Create database schema for email integration ✓
4. Implement Gmail API email fetching ✓
5. Create OpenAI integration for email classification ✓
6. Implement email processing job/cron ✓
7. Add feedback section to tasks UI
8. Create email-to-task conversion logic ✓

## Cron Setup

### Vercel Deployment
If deploying to Vercel, the cron job will run automatically based on `vercel.json` configuration.

### Other Deployments
For other platforms, you can:
1. Use an external cron service to call `/api/cron/gmail-sync` hourly
2. Add `CRON_SECRET` environment variable for security
3. Include `Authorization: Bearer YOUR_CRON_SECRET` header in requests

### Local Testing
Test the cron endpoint locally:
```bash
curl http://localhost:3000/api/cron/gmail-sync
```

## Timeline Estimate

- Phase 1: 2-3 days (Foundation & UI)
- Phase 2: 3-4 days (Gmail OAuth & API)
- Phase 3: 2-3 days (AI Processing)
- Phase 4: 2-3 days (UI Polish & Testing)

Total: ~2 weeks for complete implementation
