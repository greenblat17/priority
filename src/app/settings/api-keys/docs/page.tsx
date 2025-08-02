import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ApiDocsPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings/api-keys">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to API Keys
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to use the TaskPriority AI API with your MCP server or other integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h2>Authentication</h2>
          <p>All API requests require authentication using an API key. Include your API key in the Authorization header:</p>
          <pre><code>Authorization: Bearer tp_live_your_api_key_here</code></pre>

          <h2>Base URL</h2>
          <pre><code>{typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/v1</code></pre>

          <h2>Endpoints</h2>

          <h3>List Tasks</h3>
          <pre><code>GET /api/v1/tasks</code></pre>
          <p>Query parameters:</p>
          <ul>
            <li><code>status</code> - Filter by status (pending, in_progress, completed, blocked)</li>
            <li><code>category</code> - Filter by category (bug, feature, improvement, business, other)</li>
            <li><code>limit</code> - Results per page (default: 50)</li>
            <li><code>offset</code> - Pagination offset (default: 0)</li>
          </ul>

          <h3>Get Single Task</h3>
          <pre><code>GET /api/v1/tasks/[id]</code></pre>

          <h3>Create Task</h3>
          <pre><code>POST /api/v1/tasks</code></pre>
          <p>Request body:</p>
          <pre><code>{`{
  "description": "Task description",
  "source": "internal",
  "customerInfo": "Optional context"
}`}</code></pre>

          <h3>Update Task</h3>
          <pre><code>PATCH /api/v1/tasks/[id]</code></pre>
          <p>Request body (all fields optional):</p>
          <pre><code>{`{
  "status": "in_progress",
  "description": "Updated description",
  "customer_info": "Updated context"
}`}</code></pre>

          <h3>Delete Task</h3>
          <pre><code>DELETE /api/v1/tasks/[id]</code></pre>

          <h2>MCP Server Configuration</h2>
          <p>Example configuration for your MCP server:</p>
          <pre><code>{`{
  "servers": {
    "taskpriority": {
      "command": "node",
      "args": ["taskpriority-mcp-server.js"],
      "env": {
        "TASKPRIORITY_API_KEY": "tp_live_your_api_key",
        "TASKPRIORITY_API_URL": "${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/v1"
      }
    }
  }
}`}</code></pre>

          <h2>Error Handling</h2>
          <p>All errors return appropriate HTTP status codes with JSON error messages:</p>
          <ul>
            <li><code>401</code> - Unauthorized (invalid or missing API key)</li>
            <li><code>404</code> - Resource not found</li>
            <li><code>400</code> - Bad request (invalid input)</li>
            <li><code>500</code> - Internal server error</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}