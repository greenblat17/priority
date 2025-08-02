# API Key Correct Usage Guide

## Important: How API Keys Work

1. **Each API key is unique** - You cannot use a random `tp_live_` key. You must use the exact key that was generated for you.

2. **Keys are shown only once** - When you create an API key through the UI, it's displayed only once. After that, only the hash is stored in the database.

3. **The hash in the database** - The value like `$2b$10$rGW/RoW4/ZirGJxsKBPubuqlNy6hJcUR26oH7mbjIvecNjYam1TGi` is a bcrypt hash of the original API key. You cannot reverse this to get the original key.

## Correct Workflow

### Step 1: Create a New API Key

1. Go to http://localhost:3000/settings/api-keys
2. Click "Create New Key"
3. Enter a name (e.g., "Test Key")
4. Click "Create Key"
5. **IMPORTANT**: Copy the API key that appears in the dialog. It will look like:
   ```
   tp_live_ABC123randomcharacters456
   ```
6. Save this key securely - you won't be able to see it again!

### Step 2: Test the API Key

Use the exact key you copied in Step 1:

```bash
# Test authentication endpoint
curl -X GET http://localhost:3000/api/test-auth \
  -H "Authorization: Bearer YOUR_ACTUAL_API_KEY_HERE"

# Test creating a task
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_ACTUAL_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test task from API",
    "source": "internal",
    "customerInfo": "Testing API key authentication"
  }'
```

### Step 3: Verify It Works

If successful, you should see:
- For `/api/test-auth`: A success message with your user information
- For `/api/v1/tasks`: The created task with its ID and details

## Common Mistakes

1. **Using a made-up key** - Don't use `tp_live_KYayctoM1wYIoqkARqFuWJc6FcfV-9Vv` unless that's the exact key you were given
2. **Using the hash** - Don't try to use the bcrypt hash from the database
3. **Not copying the key** - Make sure to copy the key when it's shown in the creation dialog

## Debugging

If you're getting "Unauthorized" errors:

1. Check that you're using the exact API key that was generated
2. Make sure you're including "Bearer " before the key in the Authorization header
3. Check the server logs for detailed debugging information
4. Use the `/api/test-auth` endpoint to verify your key is valid

## If You Lost Your API Key

If you didn't save the API key when it was shown:
1. You cannot recover it (it's hashed with bcrypt)
2. Delete the old key from the settings page
3. Create a new key and save it this time

## Example: Full Testing Session

```bash
# 1. First, create a new API key through the UI
# 2. Copy the key when it's shown (e.g., tp_live_xyzabc123)
# 3. Test authentication
curl -X GET http://localhost:3000/api/test-auth \
  -H "Authorization: Bearer tp_live_xyzabc123"

# 4. If that works, create a task
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer tp_live_xyzabc123" \
  -H "Content-Type: application/json" \
  -d '{"description": "My test task", "source": "api"}'

# 5. Get all tasks
curl -X GET http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer tp_live_xyzabc123"
```

Remember: The API key `tp_live_xyzabc123` in these examples is just a placeholder. Use your actual API key!