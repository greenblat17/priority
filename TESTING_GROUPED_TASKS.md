# Testing Grouped Tasks UI

## What We've Implemented

1. **Task Grouping Backend**:
   - Database schema for `task_groups` and `task_similarities` tables
   - API endpoints for creating and managing groups
   - Integration with duplicate detection flow

2. **Task Grouping UI**:
   - Enhanced duplicate dialog with "Create and Group Together" button
   - New `TaskGroup` component for visual grouping
   - Updated `TaskTableGrouped` component to display grouped tasks
   - Modified `TaskList` to fetch and display group information

## How to Test

### 1. Create Grouped Tasks

1. Go to http://localhost:3000/tasks
2. Click "Add Task" button
3. Enter a task description similar to an existing task (e.g., if you have "Build user authentication", try "Implement user login")
4. The duplicate detection dialog should appear
5. Select the checkbox next to the similar task
6. Click "Create and Group Together" button
7. The tasks should be created and grouped

### 2. View Grouped Tasks

1. After creating grouped tasks, you should see:
   - A group header row with a blue background
   - The group name (auto-generated with timestamp)
   - Number of tasks in the group
   - Expand/collapse chevron icon

2. Click the group header to:
   - Collapse: Hide grouped tasks
   - Expand: Show grouped tasks

3. Visual indicators:
   - Group header has a blue "Group" badge
   - Grouped tasks appear under the group header
   - Clear visual separation between groups

### 3. Interact with Grouped Tasks

1. Each task in a group can still be:
   - Clicked to view details
   - Status updated via dropdown
   - Deleted individually

2. Groups are preserved when:
   - Filtering tasks
   - Sorting tasks
   - Updating task status

## Expected Behavior

### When Creating Similar Tasks

1. **Without Grouping**:
   - Click "Create Anyway" in duplicate dialog
   - Task is created without any group association

2. **With Grouping**:
   - Select checkboxes for similar tasks
   - Click "Create and Group Together"
   - New task + selected tasks are grouped
   - Group gets auto-generated name with timestamp

### Visual Display

1. **Ungrouped Tasks**:
   - Appear at the top of the list
   - No special visual treatment

2. **Grouped Tasks**:
   - Group header row with expand/collapse
   - Blue "Group" badge
   - Task count indicator
   - Tasks nested under group when expanded

### Error Handling

If you encounter RLS errors:
1. Check that you're logged in
2. Ensure the RLS fix migration has been run
3. Try refreshing the page

## What's Not Yet Implemented

1. **Group Management**:
   - Renaming groups
   - Ungrouping tasks
   - Merging groups
   - Dragging tasks between groups

2. **Advanced Features**:
   - Group-level actions (complete all, delete all)
   - Group statistics
   - Similarity scores display
   - Custom group creation without duplicate detection

These features can be added in future phases based on user feedback.