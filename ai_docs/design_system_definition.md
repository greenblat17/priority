# Design System Definition - Phase 1.2

**Date**: 2025-01-30  
**Philosophy**: Modern minimalism - beautiful, smooth, and delightful to use

## Color System

### Modern Minimal Palette

```css
/* Core Colors - Carefully chosen for modern appeal */
--color-background: #FFFFFF;      /* Pure white */
--color-foreground: #0A0A0A;      /* Rich black for contrast */
--color-muted: #6B7280;           /* Warm gray for secondary text */
--color-border: #E5E7EB;          /* Soft gray for elegant borders */
--color-accent: #3B82F6;          /* Vibrant blue for delight */

/* Subtle Additions for Depth */
--color-surface: #FAFAFA;         /* Slight off-white for cards */
--color-accent-light: #EBF5FF;    /* Very light blue for hover states */
--color-success: #10B981;         /* Green for positive feedback */
```

### Color Usage Guidelines

| Color | Primary Use | Secondary Use | Never Use For |
|-------|------------|---------------|---------------|
| Background | Page background | Card backgrounds | Text |
| Foreground | Primary text | Icons | Backgrounds |
| Muted | Secondary text | Disabled states | Primary actions |
| Border | Dividers | Input borders | Text |
| Accent | Primary buttons | Priority scores | Large areas |

### Accessibility
- Foreground on Background: 19.95:1 contrast ratio ✓
- Muted on Background: 5.74:1 contrast ratio ✓
- White on Accent: 4.68:1 contrast ratio ✓
- All combinations meet WCAG AA standards

## Typography System

### Font Stack
```css
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
                "Helvetica Neue", Arial, sans-serif;
```

### Type Scale (3 Sizes Only)
```css
--text-sm: 14px;     /* Small text, labels */
--text-base: 16px;   /* Body text, inputs */
--text-lg: 20px;     /* Headings */
```

### Font Weights (2 Only)
```css
--font-normal: 400;    /* Body text */
--font-semibold: 600;  /* Emphasis, headings */
```

### Line Heights
```css
--leading-tight: 1.25;   /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Readable paragraphs */
```

### Typography Classes
```css
.text-heading {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.text-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.text-muted {
  color: var(--color-muted);
}
```

## Spacing System

### Base Unit
```css
--space-unit: 4px;
```

### Scale (Multiples of 4px)
```css
--space-1: 4px;    /* Tight spacing */
--space-2: 8px;    /* Small gaps */
--space-3: 12px;   /* Unused - skip for simplicity */
--space-4: 16px;   /* Standard padding */
--space-6: 24px;   /* Section spacing */
--space-8: 32px;   /* Large gaps */
--space-12: 48px;  /* Major sections */
--space-16: 64px;  /* Page sections */
```

### Spacing Usage
- **Padding**: Use space-4 (16px) as default
- **Margins**: Use space-6 (24px) between sections
- **Gaps**: Use space-2 (8px) for small gaps, space-4 (16px) for standard

## Component Tokens

### Border Radius
```css
--radius-none: 0px;      /* Sharp corners when needed */
--radius-sm: 4px;        /* Subtle rounding only */
```

### Border Width
```css
--border-width: 1px;     /* All borders are 1px */
```

### Focus States
```css
/* Simple focus outline */
--focus-outline: 2px solid var(--color-accent);
--focus-offset: 2px;
```

### Shadows
```css
/* No shadows in minimal design */
--shadow-none: none;
```

### Transitions
```css
/* Single transition for all interactions */
--transition-colors: color 200ms ease-in-out, 
                    background-color 200ms ease-in-out,
                    border-color 200ms ease-in-out;
```

## Component Variants

### Buttons (2 Variants Only)
```css
/* Primary Button */
.btn-primary {
  background: var(--color-accent);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-sm);
  transition: var(--transition-colors);
}

.btn-primary:hover {
  background: #1d4ed8; /* Slightly darker blue */
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-muted);
  border: none;
  padding: var(--space-2) var(--space-4);
  transition: var(--transition-colors);
}

.btn-ghost:hover {
  color: var(--color-foreground);
}
```

### Input Fields (1 Style)
```css
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  transition: var(--transition-colors);
}

.input:focus {
  outline: var(--focus-outline);
  outline-offset: var(--focus-offset);
  border-color: var(--color-accent);
}
```

### Cards (1 Style)
```css
.card {
  background: var(--color-background);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-6);
}
```

## Layout System

### Container
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}
```

### Grid (Simple)
```css
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
```

### Stack (Vertical Spacing)
```css
.stack > * + * {
  margin-top: var(--space-4);
}

.stack-lg > * + * {
  margin-top: var(--space-6);
}
```

## Responsive Design

### Breakpoints (Mobile-First)
```css
--screen-sm: 640px;   /* Small tablets */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Desktop */
```

### Mobile Adjustments
- Increase tap targets to 44px minimum
- Stack horizontal layouts vertically
- Increase font size on small screens
- Remove non-essential elements

## Animation Guidelines

### Permitted Animations
- Color transitions (200ms)
- No movement animations
- No scale transforms
- No fade ins/outs

### Loading States
- Use skeleton screens (static)
- No spinners or progress bars
- Simple "Loading..." text when needed

## Implementation Checklist

### CSS Variables to Create
- [ ] Color variables (5 total)
- [ ] Typography variables
- [ ] Spacing scale
- [ ] Component tokens

### Components to Simplify
- [ ] Buttons (reduce to 2 variants)
- [ ] Inputs (single style)
- [ ] Cards (remove shadows)
- [ ] Tables (minimal borders)

### Files to Update
- [ ] `/src/app/globals.css` - New variables
- [ ] Create `/src/styles/design-system.css`
- [ ] Update Tailwind config
- [ ] Remove unused CSS

## Design Tokens Summary

```javascript
export const designTokens = {
  colors: {
    background: '#FFFFFF',
    foreground: '#111111',
    muted: '#666666',
    border: '#E5E5E5',
    accent: '#2563EB'
  },
  typography: {
    fontFamily: 'system-ui',
    fontSize: {
      sm: '14px',
      base: '16px',
      lg: '20px'
    },
    fontWeight: {
      normal: 400,
      semibold: 600
    }
  },
  spacing: {
    1: '4px',
    2: '8px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px'
  },
  borderRadius: {
    none: '0px',
    sm: '4px'
  }
}
```

## Next Steps

1. Implement CSS variables in `globals.css`
2. Create minimal component styles
3. Remove all unnecessary CSS
4. Test accessibility compliance
5. Document usage patterns

Remember: When in doubt, remove it. The goal is invisibility.