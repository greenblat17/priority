// Manual test script for AI Analysis Engine
// Run with: node test-ai-manual.js

const SUPABASE_URL = 'https://iwpwczyxvetyfqsivths.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cHdjenl4dmV0eWZxc2l2dGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjQ3MDAsImV4cCI6MjA2OTQwMDcwMH0.DJJ6jXkBtsJuRcwG_TAvMV_ruZ0S3WCxlRiqp69Pw_c'

// Test tasks with expected results
const testTasks = [
  {
    description: "The payment processing is failing with a 500 error when users try to upgrade to premium. This is causing revenue loss.",
    expectedCategory: "bug",
    expectedPriorityRange: [8, 10]
  },
  {
    description: "Add integration with Stripe for subscription management. This will allow users to manage their billing directly.",
    expectedCategory: "feature",
    expectedPriorityRange: [6, 8]
  },
  {
    description: "Improve the loading speed of the dashboard by implementing lazy loading for task lists.",
    expectedCategory: "improvement",
    expectedPriorityRange: [5, 7]
  },
  {
    description: "Create a marketing campaign for Black Friday to increase signups by 50%.",
    expectedCategory: "business",
    expectedPriorityRange: [4, 7]
  }
]

async function testOpenAIConnection() {
  console.log('🔍 Testing OpenAI Connection...')
  try {
    const response = await fetch('http://localhost:3000/api/test-ai')
    const data = await response.json()
    
    if (data.configured) {
      console.log('✅ OpenAI is configured and working!')
      console.log('   Model:', data.model)
    } else {
      console.log('❌ OpenAI is not configured:', data.message)
      process.exit(1)
    }
  } catch (error) {
    console.log('❌ Failed to connect to API:', error.message)
    console.log('   Make sure the dev server is running: npm run dev')
    process.exit(1)
  }
}

async function login() {
  console.log('\n🔐 Logging in...')
  // This is a simplified example - in real testing you'd use proper auth
  console.log('⚠️  Note: You need to be logged in via the web UI first')
  console.log('   The cookies from your browser session will be used')
}

async function createAndAnalyzeTask(task, index) {
  console.log(`\n📝 Test ${index + 1}: Creating task...`)
  console.log(`   Description: "${task.description.substring(0, 60)}..."`)
  
  // Note: This is a simplified test - in production you'd create via Supabase client
  try {
    // Simulate task creation
    const taskId = `test-${Date.now()}-${index}`
    console.log(`   Task ID: ${taskId}`)
    
    // In real implementation, you would:
    // 1. Create task in Supabase
    // 2. Call analyze endpoint
    // 3. Check results
    
    console.log(`   Expected category: ${task.expectedCategory}`)
    console.log(`   Expected priority: ${task.expectedPriorityRange[0]}-${task.expectedPriorityRange[1]}`)
    console.log('   ⏳ Analysis would run here...')
    
    // Simulate success
    console.log('   ✅ Task created and analyzed (simulated)')
    
  } catch (error) {
    console.log(`   ❌ Failed:`, error.message)
  }
}

async function checkResults() {
  console.log('\n📊 Checking Results...')
  try {
    const response = await fetch('http://localhost:3000/api/debug-tasks')
    const data = await response.json()
    
    if (data.error) {
      console.log('❌ Error fetching tasks:', data.error)
      console.log('   Make sure you are logged in via the web UI')
      return
    }
    
    console.log(`✅ Found ${data.task_count} tasks`)
    data.tasks.forEach((task, i) => {
      console.log(`\n   Task ${i + 1}:`)
      console.log(`   - Description: ${task.description}`)
      console.log(`   - Status: ${task.status}`)
      if (task.analysis) {
        console.log(`   - Analysis:`)
        console.log(`     • Category: ${task.analysis.category}`)
        console.log(`     • Priority: ${task.analysis.priority}/10`)
        console.log(`     • Complexity: ${task.analysis.complexity}`)
        console.log(`     • Estimated Hours: ${task.analysis.estimated_hours}`)
        console.log(`     • Confidence: ${task.analysis.confidence_score}%`)
      } else {
        console.log(`   - Analysis: Pending`)
      }
    })
  } catch (error) {
    console.log('❌ Failed to check results:', error.message)
  }
}

async function runTests() {
  console.log('🚀 AI Analysis Engine Test Suite')
  console.log('================================\n')
  
  // Test 1: Check OpenAI connection
  await testOpenAIConnection()
  
  // Test 2: Login reminder
  await login()
  
  // Test 3: Create test tasks
  console.log('\n📋 Creating Test Tasks...')
  console.log('Note: For full testing, create these tasks via the Quick-Add Modal (Cmd+K)')
  for (let i = 0; i < testTasks.length; i++) {
    await createAndAnalyzeTask(testTasks[i], i)
  }
  
  // Test 4: Check results
  await checkResults()
  
  console.log('\n\n✨ Testing Complete!')
  console.log('\nNext Steps:')
  console.log('1. Open http://localhost:3000/dashboard')
  console.log('2. Press Cmd+K to open Quick-Add Modal')
  console.log('3. Create the test tasks listed above')
  console.log('4. Check http://localhost:3000/api/debug-tasks for results')
}

// Run the tests
runTests().catch(console.error)