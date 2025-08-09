# TaskPriority UI/Design System

## 🎨 Design Philosophy

Our system uses black/white minimalism with restrained gray and sparing blue accents. Built for Next.js App Router with Tailwind and shadcn/Radix primitives. Tokens live in code and changes should flow from there.

## 🎯 Core Design Principles

### 1. **Minimal Surfaces**

- Flat white surfaces with subtle 1px borders
- Depth via spacing and hierarchy, not shadows
- Avoid decorative gradients by default

### 2. **Card-Based Architecture**

- Content organized in cards with consistent styling
- Multiple elevation levels using shadows
- Hover states for interactive feedback

### 3. **Color Palette**

- Primary action: Black (`bg-primary`)
- Accent: Blue (`#3B82F6`) for priority and rare emphasis
- Success/Warning/Error: Green/Amber/Red used for states only
- Neutral: Gray scale with `border-gray-200`, `text-gray-600`

### 4. **Strategic White Space**

- 20-30% white space for breathing room
- Consistent spacing scale (Tailwind's spacing system)
- Clear content separation

## 🎨 Color System

### Primary Tokens

```ts
// See src/lib/design-tokens.ts
export const colors = {
  background: '#FFFFFF',
  foreground: '#0A0A0A',
  border: '#E5E7EB',
  blue: '#3B82F6',
}
```

### Semantic Colors

```css
/* Status Colors */
.success {
  @apply text-green-600 bg-green-50;
}
.warning {
  @apply text-amber-600 bg-amber-50;
}
.error {
  @apply text-red-600 bg-red-50;
}
.info {
  @apply text-blue-600 bg-blue-50;
}
```

### Dark Sections

```css
/* High contrast sections */
.dark-section {
  @apply bg-slate-900 text-white;
}

.dark-card {
  @apply bg-slate-800 border-slate-700;
}
```

## 🏗️ Layout Patterns

### 1. **Fixed Navigation (minimal)**

```html
<nav class="fixed top-0 w-full bg-white z-50 border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-6 py-4">
    <!-- Navigation content -->
  </div>
</nav>
```

### 2. **Section Header**

```html
<section class="pt-32 pb-20 px-6 text-center">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-semibold text-black">Section title</h1>
    <p class="text-gray-600 mt-2">Short supporting description.</p>
  </div>
</section>
```

### 3. **Cards**

```html
<div class="bg-white rounded p-6 border border-gray-200">
  <!-- Icon container -->
  <div
    class="w-10 h-10 rounded flex items-center justify-center mb-4 border border-gray-200"
  >
    <svg class="w-7 h-7 text-blue-600"><!-- Icon --></svg>
  </div>

  <h3 class="text-xl font-semibold text-slate-900 mb-3">Feature Title</h3>
  <p class="text-slate-600">Description text</p>
</div>
```

## 🧩 Component Library (shadcn-based)

### 1. **Buttons**

#### Primary Button (black)

```tsx
import { Button } from '@/components/ui/button'

;<Button>Primary</Button>
```

#### Ghost Button

```tsx
<Button variant="ghost">Ghost</Button>
```

#### Ghost Button

```html
<a
  href="#"
  class="px-5 py-2.5 text-slate-600 hover:text-slate-900 transition-colors"
>
  Button Text
</a>
```

### 2. **Cards (simple)**

```html
<div class="relative">
  <!-- Floating background -->
  <div class="bg-white border border-gray-200 rounded p-6">
    <!-- Content -->
  </div>
</div>
```

### 3. **Status Badges (minimal)**

```html
<!-- Success -->
<span
  class="inline-flex items-center border border-gray-200 rounded px-2 py-1 text-sm"
  >Todo</span
>

<!-- Warning -->
<span class="px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full"
  >Pending</span
>

<!-- Info -->
<span class="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
  >#engineer</span
>
```

### 4. **Avatar Circles**

```html
<div
  class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center"
>
  <span class="text-white font-bold">JD</span>
</div>
```

## 🎭 Visual Effects (subtle)

### 1. **Hover Transitions**

```css
/* Standard hover effect */
.hover-lift {
  transition: all 200ms ease;
  transform: translateY(0);
}
.hover-lift:hover {
  transform: translateY(-1px);
}

/* With transform */
.hover-lift-transform {
  @apply hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5;
}
```

### 2. **Floating Animation**

```css
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

### 3. **Accent Text (rare)**

```html
<span class="text-blue-600">Emphasized</span>
```

## 📱 Responsive Design

### Breakpoint Strategy

```css
/* Mobile First Approach */
/* Default: Mobile (< 768px) */
/* md: Tablet (≥ 768px) */
/* lg: Desktop (≥ 1024px) */
/* xl: Large Desktop (≥ 1280px) */
```

### Responsive Grid Examples

```html
<!-- Feature grid: 1 column mobile, 2 tablet, 3 desktop -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  <!-- Cards -->
</div>

<!-- Two column layout with responsive behavior -->
<div class="grid md:grid-cols-2 gap-12 items-center">
  <!-- Content -->
</div>
```

## 🎨 Advanced Design Patterns

### 1. **Mock UI Elements**

Create realistic UI mockups without images:

```html
<!-- Search Bar Mock -->
<div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
  <h3 class="text-2xl font-bold mb-4">Advanced Search</h3>
  <div class="flex items-center space-x-4">
    <input
      type="text"
      placeholder="Search..."
      class="flex-1 px-6 py-3 rounded-lg text-slate-900 placeholder-slate-400"
    />
    <button
      class="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
    >
      Search
    </button>
  </div>
</div>
```

### 2. **Progress Indicators**

```html
<div class="bg-slate-50 rounded-lg p-4 text-sm">
  <div class="flex items-center justify-between mb-2">
    <span class="text-slate-600">Upload</span>
    <span class="text-green-600">✓</span>
  </div>
  <div class="flex items-center justify-between mb-2">
    <span class="text-slate-600">Processing</span>
    <span class="text-green-600">✓</span>
  </div>
  <div class="flex items-center justify-between">
    <span class="text-slate-600">Ready</span>
    <span class="text-green-600">✓</span>
  </div>
</div>
```

### 3. **Statistics Cards**

```html
<div class="bg-blue-50 rounded-lg p-4">
  <p class="text-2xl font-bold text-blue-600">2,847</p>
  <p class="text-sm text-slate-600">Total CVs Processed</p>
</div>
```

## 🌓 Dark Sections (rare)

For emphasis and visual variety:

```html
<section class="px-6 py-20 bg-slate-900 text-white">
  <div class="max-w-7xl mx-auto">
    <!-- Dark theme content -->
    <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700">
      <!-- Card content -->
    </div>
  </div>
</section>
```

## 🎯 Best Practices

### 1. **Consistent Spacing**

- Use Tailwind's spacing scale consistently
- Common padding: `p-4`, `p-6`, `p-8`
- Common margins: `mb-4`, `mb-6`, `mb-8`, `mb-16`

### 2. **Typography Hierarchy**

```css
/* Headings */
h1 {
  @apply text-5xl md:text-6xl font-bold;
}
h2 {
  @apply text-3xl font-bold;
}
h3 {
  @apply text-xl font-semibold;
}

/* Body text */
p {
  @apply text-slate-600;
}
.text-large {
  @apply text-xl;
}
.text-small {
  @apply text-sm;
}
```

### 3. **Interactive States**

- Always include hover states
- Use transitions for smooth interactions
- Provide visual feedback for all actions

### 4. **Accessibility**

- Maintain color contrast ratios
- Use semantic HTML
- Include focus states for keyboard navigation
- Add appropriate ARIA labels

## 🚀 Implementation Notes

### 1. **TailwindCSS Configuration**

Ensure Tailwind scans app/ components and pages in Next.js:

```javascript
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: { extend: {} },
}
```

### 2. **Button Variants**

See `src/components/ui/button.tsx` for supported variants: `default` (black), `ghost`, `outline`, `secondary`, `destructive`, `link` and sizes `sm|default|lg|icon`.

### 3. **Client Components**

Limit to places that need browser APIs or rich interaction. Prefer RSC for data.

## 🎁 Quick Start Template (Next.js)

Here's a basic page template incorporating all design elements:

```tsx
export default function Page() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full bg-white border-b border-gray-200" />
      <main className="mx-auto max-w-6xl px-6 py-24 space-y-16">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold text-black">Title</h1>
          <p className="text-gray-600">Description</p>
        </section>
        <section className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded p-6">Card</div>
          <div className="border border-gray-200 rounded p-6">Card</div>
        </section>
      </main>
    </div>
  )
}
```

## 📚 Resources

- **Tailwind CSS**: https://tailwindcss.com/
- **Heroicons**: https://heroicons.com/ (for SVG icons)
- **Color Psychology**: Use colors intentionally to evoke emotions
- **F-Pattern Design**: Optimize layouts for natural eye movement

This design system matches TaskPriority’s minimal product aesthetic. Always prefer existing tokens and primitives before introducing new styles.
