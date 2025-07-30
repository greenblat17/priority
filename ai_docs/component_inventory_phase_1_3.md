# Component Inventory - Phase 1.3

**Date**: 2025-01-30  
**Total Components**: 37 files analyzed  
**Goal**: Identify which components to keep, simplify, or remove for minimal design

## Component Categories

### 1. UI Primitives (Keep & Simplify)

| Component | Current State | Action | shadcn/ui | Notes |
|-----------|--------------|--------|-----------|-------|
| `button.tsx` | 6 variants, 4 sizes | **Simplify** to 2 variants | ✅ | Keep: default, ghost |
| `input.tsx` | Multiple styles | **Simplify** to 1 style | ✅ | Single border style |
| `label.tsx` | Basic implementation | **Keep** as-is | ✅ | Already minimal |
| `card.tsx` | Has shadows | **Remove** shadows | ✅ | Border only |
| `dialog.tsx` | Complex animations | **Simplify** animations | ✅ | Remove transitions |
| `badge.tsx` | Multiple variants | **Simplify** to 1 variant | ✅ | Border style only |
| `table.tsx` | Zebra stripes option | **Remove** stripes | ✅ | Clean lines only |
| `skeleton.tsx` | Animated | **Remove** animation | ✅ | Static placeholder |
| `separator.tsx` | Basic | **Keep** as-is | ✅ | Already minimal |
| `checkbox.tsx` | Styled | **Simplify** styling | ✅ | Minimal check |

### 2. Complex Components (Simplify or Remove)

| Component | Current State | Action | Notes |
|-----------|--------------|--------|-------|
| `form.tsx` | React Hook Form | **Keep** but simplify usage | Reduce field complexity |
| `select.tsx` | Complex dropdown | **Simplify** to native-like | ✅ Use shadcn/ui |
| `textarea.tsx` | Styled | **Merge** with input styling | Same as input |
| `dropdown-menu.tsx` | Multi-level | **Simplify** to single level | ✅ Use shadcn/ui |
| `progress.tsx` | Animated bar | **Remove** - use text instead | "23% complete" |
| `alert.tsx` | Multiple variants | **Remove** - use inline text | Less intrusive |
| `sonner.tsx` | Toast library | **Keep** but minimal config | Only essential toasts |

### 3. Task Components (Core - Simplify)

| Component | Current State | Action | Priority |
|-----------|--------------|--------|----------|
| `task-table.tsx` | 7+ columns | **Simplify** to 4 columns | High |
| `task-list.tsx` | Complex wrapper | **Simplify** structure | High |
| `task-filters.tsx` | Multiple filters | **Reduce** to 2-3 filters | Medium |
| `task-detail-dialog.tsx` | Many fields | **Simplify** to essentials | High |
| `task-table-grouped.tsx` | Grouped view | **Simplify** UI but keep functionality | Medium |
| `task-group.tsx` | Group component | **Simplify** visual design | Medium |
| `quick-add-modal.tsx` | Multi-field form | **Simplify** to single input | High |
| `duplicate-review-dialog.tsx` | Complex review | **Simplify** UI | Medium |

### 4. Dashboard Components (Simplify)

| Component | Current State | Action | Notes |
|-----------|--------------|--------|-------|
| `dashboard-content.tsx` | 4 metric cards | **Replace** with single line | Inline metrics |
| `skeleton-dashboard-card.tsx` | Card skeleton | **Remove** with cards | Not needed |
| `skeleton-task-table.tsx` | Table skeleton | **Simplify** to lines | Minimal loading |

### 5. Auth Components (Keep Minimal)

| Component | Current State | Action | Notes |
|-----------|--------------|--------|-------|
| `auth-button.tsx` | Login/logout | **Keep** minimal | Text only |
| `login-form.tsx` | Styled form | **Simplify** styling | Match input style |
| `user-menu.tsx` | Dropdown menu | **Simplify** to button | Just logout |

### 6. Provider Components (Keep As-Is)

| Component | Current State | Action | Notes |
|-----------|--------------|--------|-------|
| `supabase-provider.tsx` | Context provider | **Keep** | Required |
| `query-provider.tsx` | React Query | **Keep** | Required |
| `web-vitals-provider.tsx` | Performance | **Keep** | Required |

### 7. Other Components

| Component | Current State | Action | Notes |
|-----------|--------------|--------|-------|
| `gtm-manifest-form.tsx` | Complex form | **Simplify** fields | Reduce to essentials |
| `pagination.tsx` | Custom implementation | **Keep** but simplify | Numbers only |
| `examples.tsx` | Minimal examples | **Keep** as reference | Good patterns |

## shadcn/ui Components to Install

Based on our minimal needs, install only these shadcn/ui components:

```bash
# Essential components only
npx shadcn@latest add button      # 2 variants: default, ghost
npx shadcn@latest add input       # Single style
npx shadcn@latest add label       # For forms
npx shadcn@latest add card        # No shadow variant
npx shadcn@latest add dialog      # Minimal transitions
npx shadcn@latest add table       # Clean style
npx shadcn@latest add badge       # Border variant only
npx shadcn@latest add separator   # Simple divider
npx shadcn@latest add checkbox    # Minimal style
npx shadcn@latest add skeleton    # Static loading
```

## Component Reduction Summary

### Metrics
- **Total Components**: 37
- **To Remove**: 4 (11%)
- **To Simplify**: 27 (73%)
- **Keep As-Is**: 6 (16%)

### Variant Reduction
| Component | Before | After | Reduction |
|-----------|--------|-------|-----------|
| Button | 6 variants × 4 sizes = 24 | 2 variants × 2 sizes = 4 | 83% |
| Badge | 4 variants | 1 variant | 75% |
| Alert | 4 variants | 0 (removed) | 100% |
| Card | 3 styles | 1 style | 67% |
| Table | 3 styles | 1 style | 67% |

## Component Usage Guidelines

### 1. Buttons
```tsx
// ✅ Good - Only 2 variants
<Button>Primary Action</Button>
<Button variant="ghost">Secondary</Button>

// ❌ Bad - No other variants
<Button variant="outline">Not allowed</Button>
<Button variant="destructive">Not allowed</Button>
```

### 2. Forms
```tsx
// ✅ Good - Simple single input
<div>
  <Label>Task</Label>
  <Input placeholder="Describe task..." />
</div>

// ❌ Bad - Complex multi-field forms
<Form>
  <FormField>...</FormField>
  <FormField>...</FormField>
  <FormField>...</FormField>
</Form>
```

### 3. Tables
```tsx
// ✅ Good - 4 columns max
<Table>
  <TableRow>
    <TableCell>Task</TableCell>
    <TableCell>Category</TableCell>
    <TableCell>Priority</TableCell>
    <TableCell>Action</TableCell>
  </TableRow>
</Table>

// ❌ Bad - Too many columns
<Table>
  <TableRow>
    <TableCell>Check</TableCell>
    <TableCell>Title</TableCell>
    <TableCell>Context</TableCell>
    <TableCell>Category</TableCell>
    <TableCell>Priority</TableCell>
    <TableCell>Status</TableCell>
    <TableCell>Actions</TableCell>
  </TableRow>
</Table>
```

### 4. Feedback
```tsx
// ✅ Good - Simple inline text
<p className="text-sm text-muted">Task saved</p>

// ❌ Bad - Complex alerts
<Alert variant="success">
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Your task has been saved.</AlertDescription>
</Alert>
```

## Implementation Priority

### Phase 1 (Immediate)
1. Install minimal shadcn/ui components
2. Simplify Button to 2 variants
3. Remove shadows from Cards
4. Simplify Task Table to 4 columns

### Phase 2 (Core Simplification)
1. Redesign Quick Add Modal (single input)
2. Simplify Dashboard (remove cards)
3. Remove grouped task view
4. Simplify dialogs and modals

### Phase 3 (Polish)
1. Remove progress bars (use text)
2. Simplify all hover states
3. Remove unnecessary animations
4. Consolidate similar components

## File Size Impact

### Estimated Reductions
- **CSS**: ~40% reduction by removing variants
- **JS**: ~30% reduction by removing components
- **Overall**: ~35% smaller bundle size

### Components to Delete
```bash
# Can be removed entirely
src/components/ui/progress.tsx         # Use text: "45% complete"
src/components/ui/alert.tsx            # Use inline text messages
src/components/ui/skeleton-dashboard-card.tsx  # Not needed with simpler dashboard
```

### Components to Simplify (Not Delete)
```bash
# Keep functionality but simplify visual design
src/components/tasks/task-group.tsx           # Simplify UI, keep grouping logic
src/components/tasks/task-table-grouped.tsx   # Minimal styling, keep duplicate detection
```

## Design Token Application

Each component should use only our minimal design tokens:

```tsx
// From design-tokens.ts
colors: 5 only (background, foreground, muted, border, accent)
spacing: 4px base (4, 8, 16, 24, 32, 48, 64)
typography: 3 sizes (14px, 16px, 20px), 2 weights (400, 600)
borderRadius: 2 only (0, 4px)
```

## Next Steps

1. **Install shadcn/ui** with minimal configuration
2. **Override default styles** with our design tokens
3. **Simplify each component** according to this inventory
4. **Delete unnecessary components**
5. **Test each simplification** for usability

Remember: If a component doesn't directly help users prioritize tasks, it shouldn't exist.