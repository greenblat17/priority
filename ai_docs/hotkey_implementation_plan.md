# Hotkey Implementation Plan for TaskPriority AI

## Overview
This document outlines the comprehensive plan for implementing keyboard shortcuts (hotkeys) in the TaskPriority AI application to improve user efficiency and productivity.

## Current State Analysis

### Existing Implementation
- ✅ Basic keyboard handling for Escape key in modals
- ✅ Cross-platform support (Cmd/Ctrl) in quick add modal
- ❌ Limited shortcuts available
- ❌ No keyboard shortcut discovery UI
- ❌ Missing accessibility features (aria-keyshortcuts)
- ❌ No task list keyboard navigation

## Recommended Hotkey Map

### Core Shortcuts
```typescript
const HOTKEYS = {
  // Quick Actions
  'cmd+k, ctrl+k': 'Quick add task / Command palette',
  'n': 'New task (when not in input)',
  'cmd+enter, ctrl+enter': 'Save task (when in modal)',
  
  // Navigation
  'g h': 'Go home (dashboard)',
  'g t': 'Go to tasks',
  'g g': 'Go to groups',
  'g m': 'Go to GTM manifest',
  
  // Task List Navigation
  'j, ArrowDown': 'Next task',
  'k, ArrowUp': 'Previous task',
  'Enter': 'Open selected task',
  'x': 'Toggle task selection',
  
  // Task Actions
  'Space': 'Toggle task status',
  'p': 'Open priority picker',
  'd': 'Delete selected tasks',
  'e': 'Edit selected task',
  
  // View Controls
  'v': 'Toggle view (table/kanban)',
  '/': 'Focus search',
  '?': 'Show keyboard shortcuts',
  'Escape': 'Close modal/deselect'
}
```

## Implementation Phases

### Phase 1 (Immediate) - Core Navigation & Discovery
**Goal**: Implement essential navigation shortcuts and help system

**Features**:
1. **Quick Add (Cmd+K)**
   - Global shortcut to open quick add modal
   - Works from any page in the app
   
2. **Task List Navigation (J/K)**
   - Navigate up/down through tasks
   - Visual selection indicator
   - Enter to open selected task
   
3. **Search Focus (/)**
   - Quick focus on search input
   - Clear visual focus state
   
4. **Help Dialog (?)**
   - Beautiful keyboard shortcuts reference
   - Organized by category
   - Shows platform-specific keys

**Technical Requirements**:
- Enhanced keyboard hook with input detection
- Visual selection state for task list
- Keyboard shortcuts dialog component
- ARIA attributes for accessibility

### Phase 2 (Next Week) - Task Actions & Navigation
**Goal**: Implement task manipulation shortcuts and go-to navigation

**Features**:
1. **Command Palette**
   - VS Code-style command interface
   - Fuzzy search for commands
   - Recent commands history
   
2. **Task Actions**
   - Space: Toggle complete/incomplete
   - D: Delete selected tasks
   - E: Edit selected task
   - P: Set priority
   
3. **View Switching (V)**
   - Toggle between table and kanban views
   - Smooth transition animation
   
4. **Go-To Navigation**
   - G then T: Go to tasks
   - G then H: Go to home
   - G then G: Go to groups

### Phase 3 (Future) - Advanced Features
**Goal**: Power user features and customization

**Features**:
1. **Customizable Shortcuts**
   - User-defined key bindings
   - Saved to user preferences
   - Import/export configurations
   
2. **Context-Aware Shortcuts**
   - Different shortcuts for different views
   - Task-specific actions when selected
   
3. **Vim Mode**
   - Full vim-style navigation
   - Command mode
   - Visual selection mode

## Technical Architecture

### 1. Enhanced Keyboard Hook
```tsx
// hooks/use-enhanced-keyboard.ts
interface HotkeyConfig {
  key: string | string[]
  description: string
  category: 'navigation' | 'actions' | 'tasks' | 'global'
  action: () => void
  enableInInputs?: boolean
  requiresSelection?: boolean
  preventDefault?: boolean
}

export function useHotkeys(config: HotkeyConfig[]) {
  // Implementation with:
  // - Multiple key support (arrays)
  // - Input field detection
  // - Platform detection (Mac/Windows)
  // - Conflict prevention
  // - ARIA attribute injection
}
```

### 2. Keyboard Context Provider
```tsx
// providers/keyboard-provider.tsx
interface KeyboardContext {
  registerShortcut: (config: HotkeyConfig) => void
  unregisterShortcut: (key: string) => void
  getAllShortcuts: () => HotkeyConfig[]
  isInputFocused: () => boolean
}
```

### 3. Component Integration Pattern
```tsx
// Example: Task List with keyboard navigation
export function TaskList() {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const { tasks } = useTasks()
  
  useHotkeys([
    {
      key: ['j', 'ArrowDown'],
      description: 'Next task',
      category: 'navigation',
      action: () => setSelectedIndex(i => Math.min(i + 1, tasks.length - 1))
    },
    {
      key: ['k', 'ArrowUp'],
      description: 'Previous task',
      category: 'navigation',
      action: () => setSelectedIndex(i => Math.max(i - 1, 0))
    }
  ])
  
  return (
    <div role="list" aria-label="Task list">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          isSelected={index === selectedIndex}
          aria-selected={index === selectedIndex}
        />
      ))}
    </div>
  )
}
```

## Accessibility Considerations

### 1. ARIA Attributes
- `aria-keyshortcuts`: Added to all interactive elements with shortcuts
- `aria-label`: Includes shortcut information
- `aria-selected`: For keyboard navigation states
- `role` attributes: Proper semantic roles for screen readers

### 2. Visual Indicators
- Tooltips showing shortcuts on hover
- Shortcuts displayed in menus and buttons
- Focus indicators for keyboard navigation
- Selected state for navigable items

### 3. Discovery Features
- Help dialog accessible via "?"
- Shortcuts shown in UI next to actions
- First-time user onboarding
- Context-sensitive help

## Best Practices

### 1. Conflict Avoidance
- Never override browser shortcuts (Cmd+S, Cmd+P, etc.)
- Avoid single letters when in input fields
- Use modifier keys for destructive actions
- Test on multiple platforms

### 2. Context Awareness
- Disable shortcuts in input fields (unless intended)
- Different shortcuts for different modes/views
- Respect modal states
- Handle focus management properly

### 3. User Experience
- Consistent with industry standards (Slack, Linear, VS Code)
- Progressive disclosure (basic → advanced)
- Smooth visual feedback
- Undo support for destructive actions

### 4. Performance
- Debounce rapid key presses
- Efficient event listener management
- Lazy load advanced features
- Minimal re-renders on key press

## Success Metrics

1. **Adoption Rate**: % of users using shortcuts
2. **Efficiency Gain**: Time saved per task
3. **Discovery Rate**: % finding help dialog
4. **Error Rate**: Accidental shortcut triggers
5. **Accessibility Score**: WCAG compliance

## Implementation Checklist

### Phase 1 Checklist
- [ ] Create enhanced keyboard hook
- [ ] Implement keyboard shortcuts dialog
- [ ] Add quick add shortcut (Cmd+K)
- [ ] Implement task list navigation (J/K)
- [ ] Add search focus shortcut (/)
- [ ] Create help dialog trigger (?)
- [ ] Add ARIA attributes
- [ ] Test on Mac and Windows
- [ ] Add visual indicators
- [ ] Document in user guide

### Testing Requirements
1. Cross-browser testing (Chrome, Firefox, Safari, Edge)
2. Cross-platform testing (Mac, Windows, Linux)
3. Accessibility testing with screen readers
4. Performance testing (no lag on key press)
5. Conflict testing with browser extensions

## References

### Industry Standards
- **Slack**: Cmd+K for quick switcher
- **Linear**: G+T for go to tasks, J/K for navigation
- **VS Code**: Cmd+Shift+P for command palette
- **Todoist**: Q for quick add, X for selection

### Libraries Considered
1. **react-hotkeys-hook** (Recommended for Phase 1)
2. **react-shortcuts** (Alternative)
3. **mousetrap** (Low-level alternative)
4. **Custom implementation** (Current approach - enhanced)

## Migration Path

1. **Enhance current implementation** rather than replacing
2. **Gradual rollout** with feature flags
3. **User education** through tooltips and onboarding
4. **Feedback collection** for improvements
5. **Iterate based on usage data**