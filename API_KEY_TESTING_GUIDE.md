# API Key Testing Guide

This guide will help you verify that the API key functionality is working correctly in your TaskPriority AI application.

## Prerequisites

1. **Add Supabase service role key to your environment:**
   ```env
   # In your .env.local file:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   Find this key in Supabase Dashboard → Settings → API → service_role

2. Make sure your app is running locally:
   ```bash
   npm run dev
   ```

3. Ensure you're logged in to the application

4. Run the database migration to create the API keys table:
   ```bash
   # Using Supabase CLI
   supabase migration up

   # Or manually in Supabase Dashboard:
   # Go to SQL Editor and run the migration from:
   # supabase/migrations/20240131_create_api_keys.sql
   ```

## Step 1: Test API Key Management UI

### 1.1 Navigate to API Keys Settings
1. Go to http://localhost:3000/settings/api-keys
2. You should see an empty state with "No API keys yet"
3. Verify the "Create New Key" button is visible

### 1.2 Create an API Key
1. Click "Create New Key"
2. Enter a name (e.g., "Test MCP Server")
3. Click "Create Key"
4. **IMPORTANT**: Copy the API key that appears - you won't see it again!
5. The key should start with `tp_live_`
6. Click "Done"

### 1.3 Verify API Key List
1. You should now see your API key in the list
2. Check that it shows:
   - The name you entered
   - Key preview (tp_live_...XXXX)
   - "Never" for Last Used
   - Today's date for Created

### 1.4 Test API Key Deletion
1. Create another test key
2. Click the trash icon to delete it
3. Confirm the deletion
4. Verify it's removed from the list

## Step 2: Test API Endpoints with cURL

Replace `YOUR_API_KEY` with the key you copied in step 1.2.

### 2.1 Test Creating a Task
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test task from API",
    "source": "internal",
    "customerInfo": "Testing API key authentication"
  }'
```

Expected response:
```json
{
  "task": {
    "id": "some-uuid",
    "description": "Test task from API",
    "source": "internal",
    "customer_info": "Testing API key authentication",
    "status": "pending",
    "created_at": "2025-01-31T...",
    "updated_at": "2025-01-31T..."
  }
}
```

Save the task ID from the response for the next tests.

### 2.2 Test Listing Tasks
```bash
curl http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Expected: Array of tasks including the one you just created

### 2.3 Test Getting a Single Task
Replace `TASK_ID` with the ID from step 2.1:
```bash
curl http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Expected: The task object with analysis data (if AI analysis completed)

### 2.4 Test Updating a Task
```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "description": "Updated test task from API"
  }'
```

Expected: Updated task object

### 2.5 Test Deleting a Task
```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Expected response:
```json
{
  "success": true
}
```

### 2.6 Test Invalid API Key
```bash
curl http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer invalid_key_here"
```

Expected response (401):
```json
{
  "error": "Invalid API key format"
}
```

### 2.7 Test Missing API Key
```bash
curl http://localhost:3000/api/v1/tasks
```

Expected response (401):
```json
{
  "error": "Unauthorized"
}
```

## Step 3: Verify Last Used Timestamp

1. Go back to http://localhost:3000/settings/api-keys
2. Check that your API key now shows today's date in "Last Used"
3. This confirms the API key tracking is working

## Step 4: Test with JavaScript/Node.js

Create a test file `test-api.js`:

```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
const API_BASE = 'http://localhost:3000/api/v1';

async function testAPI() {
  try {
    // Create a task
    console.log('Creating task...');
    const createResponse = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Implement user authentication',
        source: 'internal',
        customerInfo: 'High priority feature'
      })
    });
    
    if (!createResponse.ok) {
      throw new Error(`HTTP error! status: ${createResponse.status}`);
    }
    
    const { task } = await createResponse.json();
    console.log('Created task:', task);
    
    // Wait for AI analysis
    console.log('Waiting 5 seconds for AI analysis...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get task with analysis
    console.log('Fetching task with analysis...');
    const getResponse = await fetch(`${API_BASE}/tasks/${task.id}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    const { task: taskWithAnalysis } = await getResponse.json();
    console.log('Task with analysis:', taskWithAnalysis);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
```

Run it:
```bash
node test-api.js
```

## Step 5: Test API Documentation

1. Go to http://localhost:3000/settings/api-keys/docs
2. Verify the documentation loads correctly
3. Check that the base URL shows your current domain

## Step 6: Test with Postman or Insomnia

If you prefer using a GUI tool:

1. Create a new request collection
2. Set up environment variable for your API key
3. Add Authorization header: `Bearer {{API_KEY}}`
4. Test all endpoints:
   - GET `/api/v1/tasks`
   - POST `/api/v1/tasks`
   - GET `/api/v1/tasks/:id`
   - PATCH `/api/v1/tasks/:id`
   - DELETE `/api/v1/tasks/:id`

## Troubleshooting

### API Key not working
1. Check the format starts with `tp_live_`
2. Ensure no extra spaces in the Authorization header
3. Try both formats:
   - `Authorization: Bearer tp_live_...`
   - `Authorization: tp_live_...`

### Database errors
1. Check Supabase logs in the Dashboard
2. Verify the migration ran successfully
3. Check RLS policies are enabled

### Tasks not showing
1. Ensure you're using the same user account
2. Check that tasks have the correct `user_id`
3. Verify RLS policies on the tasks table

## Next Steps

Once all tests pass, you can:

1. Create an MCP server that uses these APIs
2. Set up the MCP server with your API key
3. Use the MCP server to create and manage tasks programmatically

Example MCP server test:
```javascript
// mcp-test.js
const { Client } = require('@modelcontextprotocol/sdk');

const client = new Client({
  name: 'taskpriority-test',
  version: '1.0.0',
});

// Your MCP server would use the API key like this:
const API_KEY = process.env.TASKPRIORITY_API_KEY;
const API_URL = process.env.TASKPRIORITY_API_URL;

// Then make requests to your API endpoints
```

## Security Checklist

- [ ] API keys are never logged to console in production
- [ ] API keys are stored as hashed values in database
- [ ] API keys are only shown once during creation
- [ ] RLS policies prevent users from seeing other users' keys
- [ ] API endpoints validate user ownership of resources
- [ ] Invalid API keys return 401 Unauthorized
- [ ] API key format validation is working

If all tests pass, your API key system is working correctly! 🎉