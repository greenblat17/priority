# Component Simplification Guide

**Date**: 2025-01-30  
**Purpose**: Specific instructions for simplifying each component to achieve minimal design

## 1. Button Component Simplification

### Current State (6 variants × 4 sizes = 24 combinations)
```tsx
// Current variants
default, destructive, outline, secondary, ghost, link
// Current sizes
default, sm, lg, icon
```

### Target State (2 variants × 2 sizes = 4 combinations)
```tsx
// Keep only
variant: "default" | "ghost"
size: "default" | "sm"
```

### Implementation
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        ghost: "text-gray-600 hover:text-gray-900"
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-2 text-xs"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

## 2. Card Component Simplification

### Current State
- Has shadow (`shadow-sm`)
- Complex grid layouts in header
- Multiple sub-components

### Target State
```tsx
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded p-6",
        className
      )}
      {...props}
    />
  )
}

// Simplify sub-components
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4", className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />
}
```

## 3. Task Table Simplification

### Current Structure (7+ columns)
1. Checkbox
2. Title
3. Context
4. Category (with badge)
5. Priority (with badge)
6. Status (with badge)
7. Actions (dropdown menu)

### Target Structure (4 columns)
1. Title
2. Category (text only)
3. Priority (number only)
4. Action (single button)

### Implementation
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Task</TableHead>
      <TableHead>Category</TableHead>
      <TableHead>Priority</TableHead>
      <TableHead className="text-right">Action</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {tasks.map((task) => (
      <TableRow key={task.id}>
        <TableCell className="font-medium">{task.title}</TableCell>
        <TableCell className="text-gray-600">{task.category}</TableCell>
        <TableCell>
          <span className="font-mono">{task.priority_score}/10</span>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">•••</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## 4. Quick Add Modal Simplification

### Current State
```tsx
// Multiple form fields
<Form>
  <FormField name="title">
    <FormLabel>Task Title</FormLabel>
    <FormControl><Input /></FormControl>
    <FormDescription>Brief description</FormDescription>
  </FormField>
  <FormField name="context">
    <FormLabel>Context</FormLabel>
    <FormControl><Textarea /></FormControl>
  </FormField>
  <FormField name="category">
    <FormLabel>Category</FormLabel>
    <Select>...</Select>
  </FormField>
</Form>
```

### Target State
```tsx
// Single input with smart parsing
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Add Task</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        placeholder="Describe your task..."
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        className="text-base"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Add Task
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

## 5. Dashboard Simplification

### Current State
```tsx
// 4 metric cards in a grid
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card>
    <CardHeader>
      <CardTitle>Total Tasks</CardTitle>
      <ListTodo className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{totalTasks}</div>
      <p className="text-xs text-muted-foreground">+20.1% from last month</p>
    </CardContent>
  </Card>
  {/* 3 more cards */}
</div>
```

### Target State
```tsx
// Single header with inline metrics
<div className="mb-8">
  <div className="flex items-baseline justify-between">
    <div>
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <p className="text-sm text-gray-600 mt-1">
        {pendingTasks} active • {completedTasks} completed today
      </p>
    </div>
    <Button onClick={() => setQuickAddOpen(true)}>
      Add Task
    </Button>
  </div>
</div>
```

## 6. Input & Form Simplification

### Current State
- Complex form validation
- Multiple field types
- Error states with descriptions

### Target State
```tsx
// Simple input with minimal styling
<input
  type="text"
  className="w-full px-3 py-2 text-base border border-gray-200 rounded focus:outline-none focus:border-blue-600"
  placeholder="Enter value..."
/>

// Simple label
<label className="block text-sm font-medium text-gray-900 mb-1">
  Field Name
</label>
```

## 7. Dialog Simplification

### Current State
- Complex animations
- Multiple nested components
- Various sizes and styles

### Target State
```tsx
// Minimal dialog wrapper
function MinimalDialog({ open, onClose, children }) {
  if (!open) return null
  
  return (
    <>
      {/* Simple overlay */}
      <div 
        className="fixed inset-0 bg-white/80" 
        onClick={onClose}
      />
      
      {/* Simple content */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded p-6 w-full max-w-md">
        {children}
      </div>
    </>
  )
}
```

## 8. Components to Remove Entirely

### Progress Component
```tsx
// Instead of:
<Progress value={33} />

// Use:
<span className="text-sm text-gray-600">33% complete</span>
```

### Alert Component
```tsx
// Instead of:
<Alert variant="success">
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Task saved successfully.</AlertDescription>
</Alert>

// Use:
<p className="text-sm text-gray-600">Task saved</p>
```

### Grouped Task View (Simplify, Don't Remove)
**Why Keep**: This helps identify duplicate/related tasks - core value for saving time

**Current State**:
- Complex visual grouping with borders and backgrounds
- Multiple badge styles
- Heavy visual hierarchy

**Target State**:
```tsx
// Minimal group header
<div className="mt-6 mb-2">
  <h3 className="text-sm font-semibold text-gray-900">
    Related Tasks ({group.task_count})
  </h3>
  <p className="text-sm text-gray-600">{group.common_themes}</p>
</div>

// Simple indented tasks under group
<div className="ml-4">
  {groupTasks.map(task => (
    <TaskRow key={task.id} minimal={true} />
  ))}
</div>
```

**Visual Simplification**:
- Remove borders and backgrounds
- Use indentation instead of boxes
- Subtle typography for hierarchy
- Keep the smart grouping logic intact

## 9. Style Consolidation

### Colors (Use only these)
```tsx
// Text
className="text-gray-900"    // Primary text
className="text-gray-600"    // Secondary text

// Backgrounds
className="bg-white"         // Background
className="bg-blue-600"      // Primary action

// Borders
className="border-gray-200"  // All borders
```

### Spacing (Use only these)
```tsx
// Padding
className="p-0"   // 0
className="p-1"   // 4px
className="p-2"   // 8px
className="p-4"   // 16px
className="p-6"   // 24px

// Margin
className="m-0"   // 0
className="mt-1"  // 4px top
className="mt-2"  // 8px top
className="mt-4"  // 16px top
className="mb-4"  // 16px bottom
```

### Typography (Use only these)
```tsx
// Sizes
className="text-xs"   // 12px (sparingly)
className="text-sm"   // 14px
className="text-base" // 16px (default)
className="text-lg"   // 20px (headings)

// Weights
className="font-normal"   // 400
className="font-semibold" // 600

// Font
className="font-mono"     // For numbers only
```

## 10. Implementation Checklist

### Phase 1 (Core Components)
- [ ] Simplify Button to 2 variants
- [ ] Remove shadows from Card
- [ ] Simplify Table to 4 columns
- [ ] Convert Quick Add to single input

### Phase 2 (Supporting Components)
- [ ] Simplify all inputs to one style
- [ ] Remove Progress component
- [ ] Remove Alert component
- [ ] Simplify Dialog animations

### Phase 3 (Final Polish)
- [ ] Remove all hover effects except color
- [ ] Consolidate all spacing
- [ ] Remove unused CSS classes
- [ ] Delete removed component files

## Testing Each Simplification

After each component change:
1. Test functionality still works
2. Check accessibility (keyboard nav, screen readers)
3. Verify mobile responsiveness
4. Measure bundle size reduction

Remember: Every element must justify its existence. When in doubt, remove it.