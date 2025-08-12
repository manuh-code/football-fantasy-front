# Global Animation System

This document describes the global animation utilities available in the application.

## Overview

The animation system provides consistent, reusable animations across all components. All animations are defined in `src/assets/styles/main.scss` and can be used as CSS classes. The animations are designed to be smooth and non-jarring, with subtle opacity and movement changes.

## Available Animations

### Basic Animations

- `.animate-fade-in-up` - Smooth fade in with subtle upward motion
- `.animate-fade-in-down` - Smooth fade in with subtle downward motion
- `.animate-fade-in-left` - Smooth fade in from left
- `.animate-fade-in-right` - Smooth fade in from right
- `.animate-fade-in` - Simple smooth fade in
- `.animate-slide-in-up` - Enhanced slide up with subtle scale effect

### Component Animations

- `.animate-card-entrance` - Optimized card animation with scale
- `.animate-header-entrance` - Quick header section animation
- `.animate-content-entrance` - Content section animation

### Timing Utilities

#### Delays (Fine-grained control)
- `.animate-delay-50` through `.animate-delay-500` (0.05s to 0.5s increments)
- `.animate-delay-600` through `.animate-delay-1000` (larger increments)

#### Durations
- `.animate-duration-200` through `.animate-duration-1000` (0.2s to 1s)

### Staggered Animations

- `.animate-stagger` - Standard stagger timing (0.05s increments)
- `.animate-stagger-fast` - Fast stagger for dense content (0.02s increments)

## Usage Examples

### Basic Card with Entrance Animation
```vue
<div class="animate-card-entrance bg-white rounded-lg shadow-md">
  <h2>Card Title</h2>
  <p>Card content</p>
</div>
```

### Staggered Grid Animation
```vue
<div class="animate-stagger grid grid-cols-2 gap-4">
  <div class="animate-fade-in-up">Item 1</div>
  <div class="animate-fade-in-up">Item 2</div>
  <div class="animate-fade-in-up">Item 3</div>
  <div class="animate-fade-in-up">Item 4</div>
</div>
```

### Custom Timing
```vue
<div class="animate-fade-in-up animate-delay-500 animate-duration-800">
  Delayed and slower animation
</div>
```

### Sequential Section Layout
```vue
<div class="container">
  <header class="animate-header-entrance">
    <h1>Page Title</h1>
  </header>
  
  <main class="animate-content-entrance">
    <div class="animate-stagger grid grid-cols-3 gap-6">
      <div class="animate-fade-in-up">Card 1</div>
      <div class="animate-fade-in-up">Card 2</div>
      <div class="animate-fade-in-up">Card 3</div>
    </div>
  </main>
</div>
```

## Accessibility

The animation system respects the `prefers-reduced-motion` CSS media query. When users have reduced motion preferences enabled, all animations are disabled automatically.

## Best Practices

1. **Use semantic classes**: Prefer `.animate-card-entrance` over custom combinations
2. **Stagger related elements**: Use `.animate-stagger` for lists and grids
3. **Don't overuse delays**: Keep animations feeling snappy
4. **Test with reduced motion**: Always verify animations gracefully degrade
5. **Consistent timing**: Stick to the predefined duration and delay utilities

## Performance

- All animations use `transform` and `opacity` for optimal performance
- Animations are hardware-accelerated where possible
- No JavaScript is required for these animations

## Component Integration

### Profile Component Example
```vue
<template>
  <div class="animate-card-entrance">
    <header class="animate-header-entrance">...</header>
    <div class="animate-content-entrance">
      <div class="animate-stagger grid">
        <div class="animate-fade-in-up">Field 1</div>
        <div class="animate-fade-in-up">Field 2</div>
      </div>
    </div>
  </div>
</template>
```

### Dashboard Component Example
```vue
<template>
  <div class="container">
    <header class="animate-header-entrance">...</header>
    <div class="animate-stagger grid grid-cols-4">
      <div class="animate-fade-in-up">Stat 1</div>
      <div class="animate-fade-in-up">Stat 2</div>
      <div class="animate-fade-in-up">Stat 3</div>
      <div class="animate-fade-in-up">Stat 4</div>
    </div>
  </div>
</template>
```
