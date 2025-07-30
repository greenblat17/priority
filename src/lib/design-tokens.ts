/**
 * Minimal Design Tokens for TaskPriority AI
 * Philosophy: Less is more. Every design decision must justify its existence.
 */

export const colors = {
  background: '#FFFFFF',
  foreground: '#111111',
  muted: '#666666',
  border: '#E5E5E5',
  accent: '#2563EB',
  // Semantic aliases
  primary: '#2563EB',
  textPrimary: '#111111',
  textSecondary: '#666666',
} as const

export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: {
    sm: '14px',
    base: '16px',
    lg: '20px',
  },
  fontWeight: {
    normal: 400,
    semibold: 600,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
} as const

export const borderRadius = {
  none: '0px',
  sm: '4px',
} as const

export const transitions = {
  colors: 'color 200ms ease-in-out, background-color 200ms ease-in-out, border-color 200ms ease-in-out',
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
} as const

// Component-specific tokens
export const components = {
  button: {
    padding: {
      sm: `${spacing[1]} ${spacing[2]}`,
      default: `${spacing[2]} ${spacing[4]}`,
    },
    variants: {
      primary: {
        background: colors.primary,
        color: colors.background,
        hover: '#1d4ed8',
      },
      ghost: {
        background: 'transparent',
        color: colors.textSecondary,
        hover: colors.textPrimary,
      },
    },
  },
  input: {
    padding: `${spacing[2]} ${spacing[4]}`,
    border: `1px solid ${colors.border}`,
    focusBorder: colors.primary,
  },
  card: {
    padding: spacing[6],
    border: `1px solid ${colors.border}`,
  },
  table: {
    cellPadding: spacing[4],
    headerPadding: `${spacing[2]} ${spacing[4]}`,
    border: `1px solid ${colors.border}`,
  },
} as const

// Utility functions
export function getSpacing(size: keyof typeof spacing): string {
  return spacing[size]
}

export function getColor(color: keyof typeof colors): string {
  return colors[color]
}

export function getFontSize(size: keyof typeof typography.fontSize): string {
  return typography.fontSize[size]
}

// CSS variable names for runtime access
export const cssVariables = {
  colors: {
    background: '--color-background',
    foreground: '--color-foreground',
    muted: '--color-muted',
    border: '--color-border',
    accent: '--color-accent',
  },
  spacing: {
    1: '--space-1',
    2: '--space-2',
    4: '--space-4',
    6: '--space-6',
    8: '--space-8',
    12: '--space-12',
    16: '--space-16',
  },
  typography: {
    fontFamily: '--font-family',
    fontSize: {
      sm: '--text-sm',
      base: '--text-base',
      lg: '--text-lg',
    },
    fontWeight: {
      normal: '--font-normal',
      semibold: '--font-semibold',
    },
  },
} as const

// Export everything as a single object for convenience
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  transitions,
  breakpoints,
  components,
  cssVariables,
} as const

export type DesignTokens = typeof designTokens
export type ColorToken = keyof typeof colors
export type SpacingToken = keyof typeof spacing
export type FontSizeToken = keyof typeof typography.fontSize
export type FontWeightToken = keyof typeof typography.fontWeight