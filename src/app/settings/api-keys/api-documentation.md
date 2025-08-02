# TaskPriority AI API Documentation

## Authentication

All API requests require authentication using an API key. You can generate API keys from the [API Keys settings page](/settings/api-keys).

Include your API key in the `Authorization` header:

```
Authorization: Bearer tp_live_your_api_key_here
```

## Base URL

```
https://your-app-domain.com/api/v1
```

## Endpoints

### Tasks

#### List Tasks

```
GET /api/v1/tasks
```

Query parameters:
- `status` - Filter by status (pending, in_progress, completed, blocked)
- `category` - Filter by category (bug, feature, improvement, business, other)
- `limit` - Number of results per page (default: 50)
- `offset` - Pagination offset (default: 0)

Response:
```json
{
  "tasks": [
    {
      "id": "uuid",
      "description": "Task description",
      "source": "internal",
      "customer_info": "Additional context",
      "status": "pending",
      "created_at": "2025-01-31T12:00:00Z",
      "updated_at": "2025-01-31T12:00:00Z",
      "analysis": {
        "category": "feature",
        "priority": 8,
        "complexity": "medium",
        "estimated_hours": 4.5,
        "confidence_score": 85,
        "implementation_spec": "Detailed implementation guide...",
        "analyzed_at": "2025-01-31T12:01:00Z"
      }
    }
  ]
}
```

#### Get Single Task

```
GET /api/v1/tasks/{id}
```

Response: Single task object (same structure as list)

#### Create Task

```
POST /api/v1/tasks
```

Request body:
```json
{
  "description": "Implement dark mode toggle in settings",
  "source": "internal",
  "customerInfo": "Requested by multiple users"
}
```

Response: Created task object

#### Update Task

```
PATCH /api/v1/tasks/{id}
```

Request body (all fields optional):
```json
{
  "status": "in_progress",
  "description": "Updated description",
  "customer_info": "Updated context"
}
```

Response: Updated task object

#### Delete Task

```
DELETE /api/v1/tasks/{id}
```

Response:
```json
{
  "success": true
}
```

## MCP Server Integration

To use these APIs with an MCP server:

1. Generate an API key from the settings page
2. Configure your MCP server with the API key
3. Use the endpoints above to create, read, update, and delete tasks

Example MCP server configuration:

```json
{
  "servers": {
    "taskpriority": {
      "command": "node",
      "args": ["taskpriority-mcp-server.js"],
      "env": {
        "TASKPRIORITY_API_KEY": "tp_live_your_api_key_here",
        "TASKPRIORITY_API_URL": "https://your-app-domain.com/api/v1"
      }
    }
  }
}
```

## Rate Limits

- 1000 requests per hour per API key
- 100 requests per minute per API key

## Error Responses

All errors return appropriate HTTP status codes with a JSON error message:

```json
{
  "error": "Error description"
}
```

Common status codes:
- `401` - Unauthorized (invalid or missing API key)
- `404` - Resource not found
- `400` - Bad request (invalid input)
- `500` - Internal server error