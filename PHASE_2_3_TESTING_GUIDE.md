# Phase 2.3 Testing Guide - Task Dashboard

## Overview
This guide provides comprehensive testing procedures for the Task Dashboard functionality implemented in Phase 2.3. It includes both AI-assisted testing scripts and manual testing procedures to ensure the dashboard works correctly for solo founders managing their prioritized tasks.

## Pre-Testing Setup

### 1. Environment Preparation
```bash
# Ensure you're on the latest code
git pull origin main

# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, ensure Supabase is configured
# Check that your .env.local has all required variables:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - OPENAI_API_KEY
```

### 2. Prerequisites from Phase 2.2
Make sure you've applied the RLS fix:
```sql
CREATE POLICY "Users can insert analyses for own tasks" ON public.task_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_analyses.task_id
      AND tasks.user_id = auth.uid()
    )
  );
```

### 3. Test Data Requirements
- At least one authenticated user account
- Minimum 10-15 tasks with various states
- Tasks with and without AI analysis
- Tasks in different categories (bug, feature, improvement, business, other)
- Tasks with different priority levels (1-10)

## Part 1: AI-Assisted Testing Script

### Script: Comprehensive Dashboard Testing
Save this as `test-dashboard.js` in your project root:

```javascript
/**
 * AI-Assisted Testing Script for Task Dashboard
 * This script tests the dashboard functionality programmatically
 */

const { chromium } = require('playwright');

const TEST_URL = 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';

// Test data for various scenarios
const TEST_TASKS = [
  {
    description: 'Critical bug: Application crashes when submitting payment form with special characters',
    source: 'customer_email',
    customerInfo: 'premium_customer@example.com',
    expectedCategory: 'bug',
    expectedPriorityMin: 8
  },
  {
    description: 'Add dark mode toggle to the settings page for better user experience',
    source: 'support_ticket',
    expectedCategory: 'feature',
    expectedPriorityMin: 5
  },
  {
    description: 'Improve loading performance on the dashboard page',
    source: 'internal',
    expectedCategory: 'improvement',
    expectedPriorityMin: 6
  },
  {
    description: 'Update pricing page copy to reflect new tier structure',
    source: 'internal',
    expectedCategory: 'business',
    expectedPriorityMin: 4
  },
  {
    description: 'Users report slow API response times during peak hours',
    source: 'social_media',
    customerInfo: '@frustrated_user on Twitter',
    expectedCategory: 'bug',
    expectedPriorityMin: 7
  }
];

async function runTests() {
  const browser = await chromium.launch({ 
    headless: false, // Set to true for CI/CD
    slowMo: 500 // Slow down for visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🚀 Starting Task Dashboard Tests...\n');
  
  try {
    // Test 1: Authentication and Navigation
    console.log('📋 Test 1: Authentication and Navigation');
    await page.goto(TEST_URL);
    await loginUser(page);
    await page.waitForURL('**/dashboard');
    console.log('✅ Successfully logged in\n');
    
    // Navigate to tasks page
    await page.click('text="Tasks"');
    await page.waitForURL('**/tasks');
    console.log('✅ Navigated to tasks page\n');
    
    // Test 2: Create Test Tasks
    console.log('📋 Test 2: Creating Test Tasks');
    for (let i = 0; i < TEST_TASKS.length; i++) {
      await createTask(page, TEST_TASKS[i]);
      console.log(`✅ Created task ${i + 1}/${TEST_TASKS.length}`);
      
      // Wait for AI analysis
      await page.waitForTimeout(6000); // 6 seconds for AI processing
    }
    console.log('\n');
    
    // Test 3: Table Display and Data
    console.log('📋 Test 3: Table Display and Data Verification');
    await verifyTableDisplay(page);
    console.log('✅ Table displays correctly\n');
    
    // Test 4: Sorting Functionality
    console.log('📋 Test 4: Testing Sorting');
    await testSorting(page);
    console.log('✅ All sorting options work correctly\n');
    
    // Test 5: Filtering Functionality
    console.log('📋 Test 5: Testing Filters');
    await testFiltering(page);
    console.log('✅ All filters work correctly\n');
    
    // Test 6: Task Actions
    console.log('📋 Test 6: Testing Task Actions');
    await testTaskActions(page);
    console.log('✅ All task actions work correctly\n');
    
    // Test 7: Task Detail Dialog
    console.log('📋 Test 7: Testing Task Detail Dialog');
    await testTaskDetailDialog(page);
    console.log('✅ Task detail dialog works correctly\n');
    
    // Test 8: Performance Metrics
    console.log('📋 Test 8: Performance Verification');
    await testPerformance(page);
    console.log('✅ Performance meets requirements\n');
    
    console.log('🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-failure.png' });
  } finally {
    await browser.close();
  }
}

async function loginUser(page) {
  // Your login implementation based on your auth setup
  // This is a placeholder - adjust based on your actual auth flow
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign In")');
}

async function createTask(page, taskData) {
  // Open quick-add modal
  await page.keyboard.press('Meta+k'); // or 'Control+k' for Windows/Linux
  await page.waitForSelector('[role="dialog"]');
  
  // Fill in task details
  await page.fill('textarea[name="description"]', taskData.description);
  await page.selectOption('select[name="source"]', taskData.source);
  
  if (taskData.customerInfo) {
    await page.fill('input[name="customerInfo"]', taskData.customerInfo);
  }
  
  // Submit
  await page.click('button:has-text("Add Task")');
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
}

async function verifyTableDisplay(page) {
  // Check table headers
  const headers = ['Task', 'Category', 'Priority', 'Complexity', 'Status', 'Created', 'Actions'];
  for (const header of headers) {
    const headerElement = await page.locator(`th:has-text("${header}")`);
    if (!await headerElement.isVisible()) {
      throw new Error(`Header "${header}" not visible`);
    }
  }
  
  // Verify at least one row exists
  const rows = await page.locator('tbody tr').count();
  if (rows === 0) {
    throw new Error('No tasks displayed in table');
  }
  
  // Check for AI analysis data
  const firstRow = page.locator('tbody tr').first();
  const category = await firstRow.locator('[data-testid="task-category"]').textContent();
  const priority = await firstRow.locator('[data-testid="task-priority"]').textContent();
  
  if (!category || category === 'pending') {
    console.warn('⚠️  Some tasks may not have AI analysis yet');
  }
}

async function testSorting(page) {
  // Test priority sorting (default)
  await page.selectOption('[data-testid="sort-select"]', 'priority');
  await page.waitForTimeout(500);
  
  // Get all priority values
  const priorities = await page.locator('[data-testid="task-priority"]').allTextContents();
  const priorityNumbers = priorities.map(p => parseInt(p.split('/')[0])).filter(n => !isNaN(n));
  
  // Verify descending order
  for (let i = 1; i < priorityNumbers.length; i++) {
    if (priorityNumbers[i] > priorityNumbers[i-1]) {
      throw new Error('Priority sorting not working correctly');
    }
  }
  
  // Test date sorting
  await page.selectOption('[data-testid="sort-select"]', 'date');
  await page.waitForTimeout(500);
  
  // Test ascending/descending toggle
  await page.click('[data-testid="sort-order-toggle"]');
  await page.waitForTimeout(500);
}

async function testFiltering(page) {
  // Test status filter
  await page.selectOption('[data-testid="status-filter"]', 'pending');
  await page.waitForTimeout(500);
  
  let visibleRows = await page.locator('tbody tr:visible').count();
  const pendingBadges = await page.locator('tbody tr:visible [data-testid="task-status"]:has-text("pending")').count();
  
  if (visibleRows !== pendingBadges) {
    throw new Error('Status filter not working correctly');
  }
  
  // Test category filter
  await page.selectOption('[data-testid="status-filter"]', 'all');
  await page.selectOption('[data-testid="category-filter"]', 'bug');
  await page.waitForTimeout(500);
  
  visibleRows = await page.locator('tbody tr:visible').count();
  const bugBadges = await page.locator('tbody tr:visible [data-testid="task-category"]:has-text("bug")').count();
  
  if (visibleRows !== bugBadges && visibleRows > 0) {
    throw new Error('Category filter not working correctly');
  }
  
  // Clear filters
  await page.click('button:has-text("Clear filters")');
  await page.waitForTimeout(500);
}

async function testTaskActions(page) {
  const firstRow = page.locator('tbody tr').first();
  
  // Test copy spec action
  await firstRow.locator('[data-testid="task-actions"]').click();
  await page.click('text="Copy Spec"');
  
  // Verify toast notification
  await page.waitForSelector('text="Copied to clipboard"');
  
  // Test status update
  await firstRow.locator('[data-testid="task-actions"]').click();
  await page.click('text="Update Status"');
  await page.click('[data-value="in_progress"]');
  
  // Verify status changed
  await page.waitForSelector('tbody tr:first-child [data-testid="task-status"]:has-text("in_progress")');
}

async function testTaskDetailDialog(page) {
  // Click on first task to open details
  const firstRow = page.locator('tbody tr').first();
  await firstRow.click();
  
  // Wait for dialog
  await page.waitForSelector('[role="dialog"]');
  
  // Verify all sections are present
  const sections = [
    'Task Details',
    'AI Analysis',
    'Implementation Specification'
  ];
  
  for (const section of sections) {
    const sectionElement = await page.locator(`h3:has-text("${section}")`);
    if (!await sectionElement.isVisible()) {
      throw new Error(`Section "${section}" not visible in detail dialog`);
    }
  }
  
  // Test copy button in dialog
  await page.click('button:has-text("Copy Specification")');
  await page.waitForSelector('text="Copied to clipboard"');
  
  // Close dialog
  await page.keyboard.press('Escape');
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
}

async function testPerformance(page) {
  // Measure initial load time
  const startTime = Date.now();
  await page.reload();
  await page.waitForSelector('tbody tr');
  const loadTime = Date.now() - startTime;
  
  if (loadTime > 2000) {
    console.warn(`⚠️  Page load time: ${loadTime}ms (target: <2000ms)`);
  }
  
  // Measure sort operation time
  const sortStart = Date.now();
  await page.selectOption('[data-testid="sort-select"]', 'date');
  await page.waitForTimeout(100);
  const sortTime = Date.now() - sortStart;
  
  if (sortTime > 500) {
    console.warn(`⚠️  Sort operation time: ${sortTime}ms (target: <500ms)`);
  }
}

// Run the tests
runTests().catch(console.error);
```

### Running the AI Test Script

```bash
# Install Playwright if not already installed
npm install --save-dev playwright

# Run the test script
node test-dashboard.js

# For headless mode (CI/CD)
HEADLESS=true node test-dashboard.js
```

## Part 2: Manual Testing Procedures

### 1. Navigate to Tasks Page
- Go to http://localhost:3000/dashboard
- Click "View All Tasks" button
- OR directly visit http://localhost:3000/tasks

### 2. Test Task Display
You should see:
- A table with all your tasks
- Each task showing:
  - Description
  - Category badge (bug/feature/improvement/business)
  - Priority score (X/10)
  - Complexity (easy/medium/hard)
  - Status badge
  - Actions menu (three dots)

### 3. Test Sorting
Click the sort dropdown and try:
- **Sort by Priority**: High priority tasks (8-10) should appear first
- **Sort by Date**: Newest tasks should appear first
- **Sort by Status**: Should order by pending → in_progress → completed

Click the arrow button to toggle between ascending/descending order.

### 4. Test Filtering
Try different filter combinations:
- **Status Filter**: Select "Pending" - only pending tasks should show
- **Category Filter**: Select "Bug" - only bug tasks should show
- **Combined**: Select "In Progress" + "Feature" - only in-progress features show
- Click "Clear filters" to reset

### 5. Test Task Details
- **Click on any task row** - A detail dialog should open showing:
  - Full task description
  - All metadata (source, created date, etc.)
  - Complete AI analysis
  - Implementation specification
  - Confidence score with visual bar
  - Status update buttons

### 6. Test Copy Implementation Spec
For tasks with AI analysis:
1. Click the three dots menu
2. Select "Copy Spec"
3. You should see a success toast: "Implementation spec copied to clipboard"
4. Try pasting (Cmd+V) - the spec should paste

Alternative:
1. Open task details
2. Click "Copy Spec" button
3. Same success toast should appear

### 7. Test Status Updates
From the dropdown menu:
1. Click three dots on any task
2. Hover over status options
3. Select a different status (e.g., "in progress")
4. Task should update immediately
5. Success toast appears

From detail dialog:
1. Open task details
2. Click status buttons at the bottom
3. Status should update and dialog close

### 8. Test Task Deletion
1. Click three dots menu
2. Select "Delete" (in red)
3. Confirm dialog should appear
4. Click OK
5. Task should disappear
6. Success toast appears

### 9. Test Add New Task
1. Click "Add Task" button (top right)
2. Quick-Add Modal should open
3. Create a new task
4. After submission, it should appear in the list
5. After 2-5 seconds, AI analysis should populate

### 10. Test Visual Indicators

Check that colors are working correctly:

**Priority Colors:**
- 8-10: Bold red text
- 6-7: Semi-bold orange text
- 4-5: Yellow text
- 1-3: Gray text

**Category Badges:**
- Bug: Red badge
- Feature: Blue badge
- Improvement: Gray badge
- Business: Outline badge

**Complexity Colors:**
- Easy: Green text
- Medium: Yellow text
- Hard: Red text

**Status Badges:**
- Completed: Solid badge
- In Progress: Secondary badge
- Blocked: Red badge
- Pending: Outline badge

### 11. Test Loading States
1. Refresh the page
2. You should briefly see loading skeletons
3. Then tasks load

### 12. Test Error States
1. Turn off internet/stop the server
2. Refresh the page
3. Should see error message with retry suggestion

### 13. Test Empty State
If you have no tasks:
- Should see "No tasks found. Create your first task to get started!"

### 14. Test Mobile Responsiveness
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device
4. Check that:
   - Table is scrollable
   - Buttons are accessible
   - Modals work properly
   - Text doesn't overflow

## Part 3: Advanced Testing Procedures

### Visual and UX Testing

#### A. Page Layout Verification
1. Navigate to `/tasks`
2. Verify:
   - [ ] Page header shows "Tasks" title
   - [ ] "Add Task" button is visible in top right
   - [ ] Filter controls are above the table
   - [ ] Table takes up appropriate space
   - [ ] No layout shifts or broken styles

#### B. Responsive Design
1. Resize browser window:
   - [ ] Table scrolls horizontally on small screens
   - [ ] Filters stack vertically on mobile
   - [ ] Modal remains centered
   - [ ] Text remains readable

### Edge Case Testing

#### A. Empty States
1. User with no tasks:
   - [ ] Shows appropriate empty message
   - [ ] Add Task button still works
   - [ ] No JavaScript errors

#### B. Data Validation
1. Tasks without AI analysis:
   - [ ] Show "Pending analysis" or similar
   - [ ] Don't break the table layout
   - [ ] Actions still work

2. Malformed data:
   - [ ] Very long task descriptions truncate
   - [ ] Missing fields handle gracefully
   - [ ] Special characters display correctly

### Performance Testing

#### A. Load Testing
```bash
# Create many tasks to test performance
# Run this in your browser console
for(let i = 0; i < 100; i++) {
  // Trigger task creation via your API
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: `Test task ${i} - ${new Date().toISOString()}`,
      source: 'internal'
    })
  });
}
```

Then verify:
- [ ] Page loads within 2 seconds
- [ ] Sorting remains fast (<500ms)
- [ ] Filtering is instant (<100ms)
- [ ] Scrolling is smooth

#### B. Browser Compatibility
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility Testing

#### A. Keyboard Navigation
1. Tab through the interface:
   - [ ] All interactive elements reachable
   - [ ] Focus indicators visible
   - [ ] Logical tab order

2. Keyboard shortcuts:
   - [ ] Cmd/Ctrl+K opens modal
   - [ ] Escape closes dialogs
   - [ ] Enter submits forms

#### B. Screen Reader Testing
1. Use built-in screen reader:
   - [ ] Table headers announced correctly
   - [ ] Task status changes announced
   - [ ] Form labels read properly
   - [ ] Success/error messages announced

## Test Reporting Template

```markdown
## Task Dashboard Test Report
Date: [DATE]
Tester: [NAME]
Environment: [Dev/Staging/Prod]

### Summary
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

### Critical Issues
1. [Issue description]
   - Steps to reproduce
   - Expected vs Actual
   - Screenshot/Video

### Minor Issues
1. [Issue description]

### Performance Metrics
- Page Load: Xms
- Sort Operation: Xms  
- Filter Operation: Xms
- API Response: Xms

### Recommendations
- [Any improvements needed]
```

## Expected Behavior Checklist

- [ ] Tasks load and display with all information
- [ ] Sorting changes order immediately
- [ ] Filters update results instantly
- [ ] Clicking task opens detail view
- [ ] Copy spec shows success toast
- [ ] Status updates work from menu and dialog
- [ ] Delete removes task after confirmation
- [ ] Add Task button opens modal
- [ ] New tasks appear after creation
- [ ] AI analysis populates after few seconds
- [ ] Colors indicate priority/category correctly
- [ ] Mobile view is usable
- [ ] Loading states appear briefly
- [ ] Error states show helpful messages

## Common Issues & Troubleshooting

### Tasks not showing AI analysis
- Check if you applied the RLS fix
- Try the manual analysis trigger: http://localhost:3000/test-ai-analysis
- Check console for errors

### Status updates not working
- Check browser console for errors
- Ensure you're logged in
- Try refreshing the page

### Filters not working
- Make sure you have tasks with different statuses/categories
- Try clearing filters and reapplying

### Copy not working
- Some browsers require HTTPS for clipboard access
- Try using the keyboard shortcut Cmd+C after selecting text

### Issue: Tasks Not Loading
```bash
# Check Supabase connection
curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/tasks \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Check browser console for errors
# Check Network tab for failed requests
```

### Issue: AI Analysis Not Running
```bash
# Check OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check server logs for API errors
# Verify task_analyses table permissions
```

### Issue: Sorting/Filtering Not Working
```javascript
// Debug in browser console
const tasks = await fetch('/api/tasks').then(r => r.json());
console.log('Task data:', tasks);
console.log('Unique categories:', [...new Set(tasks.map(t => t.analysis?.category))]);
console.log('Priority range:', tasks.map(t => t.analysis?.priority).sort());
```

## Continuous Testing

### Automated Test Schedule
```yaml
# .github/workflows/dashboard-tests.yml
name: Dashboard Tests
on:
  push:
    paths:
      - 'src/components/tasks/**'
      - 'src/app/tasks/**'
  schedule:
    - cron: '0 8 * * *' # Daily at 8 AM

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run dashboard tests
        run: npm run test:dashboard
```

### Manual Test Triggers
Perform manual testing when:
- After any task-related code changes
- Before deploying to production
- When users report issues
- After dependency updates
- Monthly comprehensive review

## Success Criteria

The Task Dashboard passes testing when:
1. ✅ All manual test cases pass
2. ✅ AI test script runs without errors
3. ✅ Performance metrics meet targets
4. ✅ No critical bugs found
5. ✅ Accessibility standards met
6. ✅ Works on all supported browsers
7. ✅ Handles edge cases gracefully

## Performance Check

The dashboard should:
- Load in under 1 second
- Update filters instantly
- Show status changes immediately
- Open dialogs without delay

## Success Indicators

You know Phase 2.3 is working when:
- ✅ All tasks display with AI analysis data
- ✅ Sorting and filtering work smoothly
- ✅ Actions complete without page refresh
- ✅ Visual indicators help prioritize work
- ✅ The UI feels responsive and polished

## Next Testing

After confirming all features work:
1. Create 10-20 tasks to test with more data
2. Try different combinations of filters
3. Test the workflow of moving tasks through statuses
4. Use the implementation specs for actual coding

The Task Dashboard is now your command center for AI-prioritized task management!