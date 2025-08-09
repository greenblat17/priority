# UI Design Quick Reference (TaskPriority)

Use these minimal, on-brand snippets. Replace any gradient/hero-heavy content from other projects with the following patterns.

## 🚀 Quick Copy-Paste Components

### Navigation Bar

```tsx
<nav className="fixed top-0 w-full bg-white border-b border-gray-200">
  <div className="mx-auto max-w-6xl px-6 py-3">
    <div className="flex items-center justify-between">
      <a href="/" className="text-sm font-semibold text-black">
        TaskPriority
      </a>
      <div className="flex items-center gap-6 text-sm">
        <a className="text-gray-600 hover:text-black" href="/tasks">
          Tasks
        </a>
        <a className="text-gray-600 hover:text-black" href="/pages">
          Pages
        </a>
      </div>
    </div>
  </div>
</nav>
```

### Section Header

```tsx
<section className="mx-auto max-w-6xl px-6 py-10">
  <h1 className="text-3xl font-semibold text-black">Section title</h1>
  <p className="text-gray-600 mt-2">Short supporting description.</p>
  <div className="mt-6 flex gap-3">
    <button className="inline-flex items-center rounded-lg bg-black text-white px-5 py-2 text-sm font-semibold">
      Primary
    </button>
    <button className="inline-flex items-center rounded-lg text-gray-600 hover:text-black px-5 py-2 text-sm font-semibold">
      Ghost
    </button>
  </div>
</section>
```

### Feature Card

```tsx
<div className="bg-white border border-gray-200 rounded p-6">
  <h3 className="text-lg font-semibold text-black">Feature</h3>
  <p className="text-gray-600 mt-2">Description.</p>
  <a className="text-blue-600 inline-flex items-center mt-3">Learn more</a>
</div>
```

### Dark Section (rare)

```tsx
<section className="px-6 py-12 bg-black text-white">
  <div className="mx-auto max-w-6xl">
    <h2 className="text-lg font-semibold">Contrast section</h2>
    <p className="text-white/70 mt-2">Use sparingly.</p>
  </div>
</section>
```

### CTA Section

```tsx
<div className="flex items-center gap-3">
  <button className="inline-flex items-center rounded-lg bg-black text-white px-5 py-2 text-sm font-semibold">
    Primary
  </button>
  <button className="inline-flex items-center rounded-lg text-gray-600 hover:text-black px-5 py-2 text-sm font-semibold">
    Ghost
  </button>
</div>
```

### Footer

```tsx
<footer className="border-t border-gray-200 py-10 px-6 text-sm text-gray-600">
  <div className="mx-auto max-w-6xl flex items-center justify-between">
    <span>TaskPriority</span>
    <span>© {new Date().getFullYear()}</span>
  </div>
</footer>
```

## 🎨 Color Classes Quick Reference

### Backgrounds

```
Light: bg-white
Cards: bg-white + border-gray-200
Dark (rare): bg-black
Accent (text only): text-blue-600
```

### Text Colors

```
Primary: text-black
Secondary: text-gray-600
Muted: text-gray-500
Accent: text-blue-600 (sparingly)
On dark: text-white
```

### Common Patterns

```txt
Borders: border border-gray-200
Containers: rounded p-6
Focus: focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
```

## 📏 Spacing Cheat Sheet

### Padding

```
Small: p-4
Medium: p-6 or p-8
Large: p-12
Section: py-10 px-6
```

### Margins

```
Between elements: mb-4
Between sections: mb-8 or mb-16
Between paragraphs: mb-6
```

### Gaps (for flex/grid)

```
Small: gap-4
Medium: gap-6 or gap-8
Large: gap-12
```

## 🎯 Component States

### Hover Effects (subtle)

```erb
/* Basic */
transition-all duration-200
/* Optional micro lift */
hover:-translate-y-px

<!-- Color change -->
hover:text-slate-900 transition-colors

<!-- Background change -->
hover:bg-slate-200 transition-all duration-200
```

### Focus States (consistent)

```erb
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
```

## 📱 Responsive Utilities

### Hide/Show

```erb
<!-- Hide on mobile, show on desktop -->
hidden md:block

<!-- Show on mobile, hide on desktop -->
block md:hidden
```

### Grid Columns

```erb
<!-- 1 column mobile, 2 tablet, 3 desktop -->
grid md:grid-cols-2 lg:grid-cols-3 gap-8

<!-- 1 column mobile, 2 desktop -->
grid md:grid-cols-2 gap-12
```

### Text Sizes

```erb
<!-- Responsive heading -->
text-4xl md:text-5xl lg:text-6xl

<!-- Responsive body text -->
text-lg md:text-xl
```

## 🔌 Components (shadcn)

- Buttons: `src/components/ui/button.tsx` variants `default|ghost|outline|secondary|destructive|link`, sizes `sm|default|lg|icon`
- Inputs/Labels: `src/components/ui/input.tsx`, `label.tsx`

## 💡 Pro Tips

1. **Always use transitions** for interactive elements
2. **Layer gradients** for depth (background gradient + card gradient)
3. **Use consistent border radius**: rounded-lg, rounded-xl, rounded-2xl
4. **Add shadows on hover** for interactive feedback
5. **Keep text readable** with proper contrast ratios
6. **Use semantic HTML** for better accessibility
7. **Test on mobile first** - the design should work on small screens

## 🎁 Full Page Template (Next.js)

```tsx
export default function Page() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full bg-white border-b border-gray-200" />
      <main className="mx-auto max-w-6xl px-6 py-24 space-y-16">
        <section>
          <h1 className="text-3xl font-semibold text-black">Title</h1>
          <p className="text-gray-600 mt-2">Description</p>
        </section>
        <section className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded p-6">Card</div>
          <div className="border border-gray-200 rounded p-6">Card</div>
        </section>
      </main>
      <footer className="border-t border-gray-200 py-10 px-6 text-sm text-gray-600">
        Footer
      </footer>
    </div>
  )
}
```

These snippets align with our minimal, production-ready style. Use tokens/components from the repo rather than adding new ad-hoc styles.
