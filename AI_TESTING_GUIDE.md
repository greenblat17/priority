# AI Analysis Engine Testing Guide

## Prerequisites

1. **Update Node.js** (if needed):
   ```bash
   # Check current version
   node --version
   
   # If less than 18.18.0, update using nvm or download from nodejs.org
   ```

2. **Verify OpenAI API Key**:
   - Check `.env.local` has a valid `OPENAI_API_KEY`
   - The key should start with `sk-proj-` or `sk-`
   - You can get one from https://platform.openai.com/api-keys

## Testing Steps

### 1. Test OpenAI Connection

Start the dev server:
```bash
npm run dev
```

Visit: http://localhost:3000/api/test-ai

Expected response:
```json
{
  "configured": true,
  "message": "OpenAI integration is working",
  "test": "OK",
  "model": "gpt-3.5-turbo-0125"
}
```

If you see an error, check:
- Is your OpenAI API key valid?
- Do you have credits in your OpenAI account?
- Is the API key correctly set in `.env.local`?

### 2. Test Task Creation and Analysis

1. **Login to the app**: http://localhost:3000/auth/login
2. **Go to dashboard**: http://localhost:3000/dashboard
3. **Press Cmd+K (Mac) or Ctrl+K (Windows/Linux)** to open Quick-Add Modal

### 3. Create Test Tasks

Try these different types of tasks to test the AI categorization:

#### Bug Task:
```
The login button on the homepage is not working. When users click it, 
nothing happens and there's a console error saying "Cannot read property 
'auth' of undefined". This is blocking all user logins.
```
Expected: Category = "bug", Priority = 8-10

#### Feature Task:
```
Add a dark mode toggle to the settings page. Users have been requesting 
this feature to reduce eye strain during night-time usage. Should remember 
the user's preference across sessions.
```
Expected: Category = "feature", Priority = 5-7

#### Improvement Task:
```
The dashboard takes 5 seconds to load. We should optimize the database 
queries and add pagination to improve performance.
```
Expected: Category = "improvement", Priority = 6-8

#### Business Task:
```
Write a blog post about our new AI task prioritization feature to 
attract more solo founders to our platform.
```
Expected: Category = "business", Priority = 4-6

### 4. Check Analysis Results

Visit: http://localhost:3000/api/debug-tasks

This will show your recent tasks with their AI analysis. Look for:
- Correct categorization
- Reasonable priority scores
- Appropriate complexity estimates
- Confidence scores

### 5. Monitor Logs

Watch the terminal running `npm run dev` for:
```
[AI Analysis] Starting analysis request
[AI Analysis] Processing task: <task-id>
[AI Analysis] Building prompt with context
[AI Analysis] Calling OpenAI API
[AI Analysis] Parsing OpenAI response
[AI Analysis] Saving analysis to database
[AI Analysis] Analysis completed successfully
```

### 6. Test Error Scenarios

#### Invalid API Key:
1. Temporarily change `OPENAI_API_KEY` in `.env.local` to "invalid"
2. Restart the dev server
3. Try creating a task
4. Should see: "AI service not configured"

#### Rate Limiting:
The retry logic will automatically handle this, but you'll see in logs:
```
Retry attempt 1 after 1000ms delay
```

### 7. Verify Database Records

Check Supabase dashboard:
1. Go to your Supabase project
2. Navigate to Table Editor
3. Check `tasks` table - should have your test tasks
4. Check `task_analyses` table - should have AI analysis for each task

## Common Issues and Solutions

### Issue: "AI service not configured"
- **Solution**: Check your OpenAI API key in `.env.local`

### Issue: Analysis takes too long (>30 seconds)
- **Solution**: Check OpenAI service status at https://status.openai.com

### Issue: "Task already analyzed"
- **Solution**: This is expected - we prevent duplicate analysis. Delete the task or its analysis in Supabase to re-analyze.

### Issue: Console errors about cookies or auth
- **Solution**: Clear cookies and login again

## Performance Expectations

- **Analysis Time**: 2-5 seconds per task
- **Success Rate**: >95% with retry logic
- **Cost**: ~$0.01-0.02 per task analysis

## Testing Checklist

- [ ] OpenAI test endpoint returns success
- [ ] Can create tasks via Quick-Add Modal (Cmd+K)
- [ ] Tasks appear in database
- [ ] AI analysis runs automatically after task creation
- [ ] Analysis results saved to task_analyses table
- [ ] Different task types get appropriate categories
- [ ] Priority scores make sense (1-10)
- [ ] Implementation specs are detailed and actionable
- [ ] Error handling works for invalid API key
- [ ] Retry logic works for transient failures

## Advanced Testing (Optional)

### Test with GTM Manifest:
1. Create a GTM manifest in Supabase for your user
2. Add product context (product_name, target_audience, etc.)
3. Create new tasks
4. Verify AI uses this context in prioritization

### Bulk Testing:
Create multiple tasks quickly to test:
- Rate limiting handling
- Concurrent analysis
- Database performance

## Cleanup

After testing, remember to:
1. Remove `/api/debug-tasks` endpoint before production
2. Set up proper error monitoring (Sentry, etc.)
3. Implement rate limiting for the analyze endpoint
4. Add cost tracking for OpenAI usage

## Success Indicators

You'll know the AI Analysis Engine is working when:
- ✅ Tasks are automatically analyzed after creation
- ✅ Categories match the task content
- ✅ Priorities reflect business impact
- ✅ Implementation specs are detailed and helpful
- ✅ The system handles errors gracefully
- ✅ Performance is consistently under 5 seconds