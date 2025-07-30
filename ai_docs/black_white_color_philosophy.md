# Black & White Color Philosophy

**Updated**: 2025-01-30  
**Core Principle**: Black and white as the foundation, with blue used sparingly as an accent

## Color Hierarchy

### Primary Palette (90% of UI)
```css
/* Main Colors */
--black: #0A0A0A        /* Primary text, buttons, focus states */
--white: #FFFFFF        /* Backgrounds, button text */
--gray-50: #F5F5F5      /* Hover states, subtle backgrounds */
--gray-200: #E5E7EB     /* Borders, dividers */
--gray-500: #6B7280     /* Secondary text, muted elements */
```

### Accent Colors (10% of UI)
```css
/* Use Sparingly */
--blue: #3B82F6         /* Priority scores, key CTAs only */
--green: #10B981        /* Success states */
--red: #EF4444          /* Errors, urgent items */
--amber: #F59E0B        /* Warnings, high priority */
```

## Design Principles

### 1. **Black is the New Blue**
- Primary buttons are black, not blue
- Focus states use black rings
- Main interactions are black/white

### 2. **White Space is Luxury**
- Generous white space
- Clean, uncluttered layouts
- Let the content breathe

### 3. **Blue is Special**
Use blue ONLY for:
- Priority score badges (8/10)
- Critical action buttons (Save, Submit)
- Important status indicators
- Never for general UI elements

### 4. **Gray for Hierarchy**
- Light gray (#F5F5F5) for hover states
- Medium gray (#6B7280) for secondary text
- Border gray (#E5E7EB) for subtle divisions

## Component Examples

### Buttons
```tsx
// Primary button - BLACK
<Button variant="default">
  Add Task
</Button>

// Secondary button - Ghost with gray
<Button variant="ghost">
  Cancel
</Button>

// Special action - Blue accent (rare)
<Button className="bg-blue-500 hover:bg-blue-600 text-white">
  Start Free Trial
</Button>
```

### Task Table
```tsx
// Black text, gray secondary info
<TableRow>
  <TableCell className="font-semibold text-black">
    Build landing page
  </TableCell>
  <TableCell className="text-gray-500">
    Feature
  </TableCell>
  <TableCell>
    {/* Blue ONLY for priority */}
    <span className="text-blue-500 font-mono">8/10</span>
  </TableCell>
</TableRow>
```

### Cards
```tsx
// White background, black text, gray borders
<Card className="bg-white border-gray-200">
  <CardTitle className="text-black">Active Tasks</CardTitle>
  <CardDescription className="text-gray-500">
    23 tasks remaining
  </CardDescription>
</Card>
```

## Color Usage Guidelines

### ✅ DO
- Use black for primary actions and text
- Use white backgrounds for clarity
- Use gray for secondary information
- Reserve blue for priority/importance
- Keep it simple and elegant

### ❌ DON'T
- Don't use blue for general buttons
- Don't use blue for borders or backgrounds
- Don't add colors "for variety"
- Don't use blue for hover states
- Don't make everything blue

## Real-World Examples

### Navigation
```tsx
// Black logo, black menu items
<header className="bg-white border-b border-gray-200">
  <h1 className="text-black font-bold">TaskPriority</h1>
  <button className="text-gray-500 hover:text-black">
    Menu
  </button>
</header>
```

### Form
```tsx
// Black labels, gray placeholders, black focus
<div>
  <label className="text-black font-medium">Task Name</label>
  <input 
    className="border-gray-200 focus:border-black focus:ring-black"
    placeholder="Enter task..." // Gray placeholder
  />
</div>
```

### Priority Indicator
```tsx
// This is where blue shines - making priorities stand out
<div className="flex items-center gap-2">
  <span className="text-black">Priority:</span>
  <span className="text-blue-500 font-semibold">8/10</span>
</div>
```

## Rationale

### Why Black & White?
1. **Timeless**: Never goes out of style
2. **Professional**: Serious, focused appearance
3. **Accessible**: Maximum contrast
4. **Calming**: Less visual noise
5. **Flexible**: Works with any brand

### Why Minimal Blue?
1. **Special**: Blue means "pay attention"
2. **Effective**: Stands out against B&W
3. **Purposeful**: Every use has meaning
4. **Modern**: Contemporary restraint
5. **Clear**: No confusion about importance

## Implementation Checklist

- [ ] Change primary buttons from blue to black
- [ ] Update focus rings to black
- [ ] Use gray for all hover states (not blue)
- [ ] Reserve blue for priority scores
- [ ] Remove blue from general UI elements
- [ ] Add blue accent only for critical CTAs
- [ ] Update all borders to gray
- [ ] Ensure white space is generous

## The Result

A sophisticated, modern interface where:
- **Black** commands attention
- **White** provides clarity
- **Gray** creates subtle hierarchy
- **Blue** highlights what truly matters

This creates a calm, focused environment where users can concentrate on their tasks without distraction, while still having clear visual cues for what's important.