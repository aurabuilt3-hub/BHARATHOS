import React from 'react'

/**
 * ------------------------------------------------------------------------
 * 1. Container Component
 * ------------------------------------------------------------------------
 * Purpose: Centered main page wrapper constraint.
 * Props: 
 *   - children: React.ReactNode
 *   - className: string (optional)
 * Variants: Default centered max-w-7xl
 * Accessibility: Semantic main layout container.
 * Example:
 *   <Container><YourPageContent /></Container>
 */
interface ContainerProps {
  children: React.ReactNode
  className?: string
}
export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

/**
 * ------------------------------------------------------------------------
 * 2. Section Component
 * ------------------------------------------------------------------------
 * Purpose: Vertical grouping of content blocks.
 * Props:
 *   - children: React.ReactNode
 *   - className: string (optional)
 *   - ariaLabel: string (optional for accessibility)
 * Variants: Default margin-bottom spacing blocks.
 * Accessibility: Semantic section tag mapping.
 * Example:
 *   <Section ariaLabel="Telemetry Metrics Overview"><StatsGrid /></Section>
 */
interface SectionProps {
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}
export function Section({ children, className = '', ariaLabel }: SectionProps) {
  return (
    <section 
      aria-label={ariaLabel} 
      className={`py-6 md:py-8 ${className}`}
    >
      {children}
    </section>
  )
}

/**
 * ------------------------------------------------------------------------
 * 3. Grid Component
 * ------------------------------------------------------------------------
 * Purpose: Responsive multi-column layout wrapper.
 * Props:
 *   - children: React.ReactNode
 *   - cols: 1 | 2 | 3 | 4 | 12 (default: 3)
 *   - gap: 2 | 4 | 6 | 8 (default: 6)
 *   - className: string (optional)
 * Variants: Responsive stacking for grids.
 * Example:
 *   <Grid cols={3} gap={6}><StatCard /><StatCard /><StatCard /></Grid>
 */
interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 12
  gap?: 2 | 4 | 6 | 8
  className?: string
}
export function Grid({ children, cols = 3, gap = 6, className = '' }: GridProps) {
  const getColClass = (c: number) => {
    switch (c) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      case 12: return 'grid-cols-12'
      default: return 'grid-cols-1 md:grid-cols-3'
    }
  }

  const getGapClass = (g: number) => {
    switch (g) {
      case 2: return 'gap-2'
      case 4: return 'gap-4'
      case 6: return 'gap-6'
      case 8: return 'gap-8'
      default: return 'gap-6'
    }
  }

  return (
    <div className={`grid w-full ${getColClass(cols)} ${getGapClass(gap)} ${className}`}>
      {children}
    </div>
  )
}

/**
 * ------------------------------------------------------------------------
 * 4. Stack Component
 * ------------------------------------------------------------------------
 * Purpose: Vertical layout stack with consistent item spacing.
 * Props:
 *   - children: React.ReactNode
 *   - space: 2 | 4 | 6 | 8 (default: 4)
 *   - className: string (optional)
 * Variants: Vertical flexbox alignment.
 * Example:
 *   <Stack space={4}><Title /><Paragraph /></Stack>
 */
interface StackProps {
  children: React.ReactNode
  space?: 2 | 4 | 6 | 8
  className?: string
}
export function Stack({ children, space = 4, className = '' }: StackProps) {
  const getSpaceClass = (s: number) => {
    switch (s) {
      case 2: return 'space-y-2'
      case 4: return 'space-y-4'
      case 6: return 'space-y-6'
      case 8: return 'space-y-8'
      default: return 'space-y-4'
    }
  }

  return (
    <div className={`flex flex-col ${getSpaceClass(space)} ${className}`}>
      {children}
    </div>
  )
}

/**
 * ------------------------------------------------------------------------
 * 5. Flex Component
 * ------------------------------------------------------------------------
 * Purpose: Reusable flexbox utility container.
 * Props:
 *   - children: React.ReactNode
 *   - align: 'start' | 'center' | 'end' | 'baseline' (default: 'center')
 *   - justify: 'start' | 'center' | 'end' | 'between' | 'around' (default: 'start')
 *   - gap: 2 | 4 | 6 | 8 (default: 4)
 *   - className: string (optional)
 * Example:
 *   <Flex justify="between" gap={4}><Logo /><UserMenu /></Flex>
 */
interface FlexProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  gap?: 2 | 4 | 6 | 8
  className?: string
}
export function Flex({
  children,
  align = 'center',
  justify = 'start',
  gap = 4,
  className = ''
}: FlexProps) {
  const getAlignClass = (a: string) => {
    switch (a) {
      case 'start': return 'items-start'
      case 'end': return 'items-end'
      case 'baseline': return 'items-baseline'
      case 'center':
      default: return 'items-center'
    }
  }

  const getJustifyClass = (j: string) => {
    switch (j) {
      case 'center': return 'justify-center'
      case 'end': return 'justify-end'
      case 'between': return 'justify-between'
      case 'around': return 'justify-around'
      case 'start':
      default: return 'justify-start'
    }
  }

  const getGapClass = (g: number) => {
    switch (g) {
      case 2: return 'gap-2'
      case 4: return 'gap-4'
      case 6: return 'gap-6'
      case 8: return 'gap-8'
      default: return 'gap-4'
    }
  }

  return (
    <div className={`flex ${getAlignClass(align)} ${getJustifyClass(justify)} ${getGapClass(gap)} ${className}`}>
      {children}
    </div>
  )
}

/**
 * ------------------------------------------------------------------------
 * 6. Spacer Component
 * ------------------------------------------------------------------------
 * Purpose: Transparent layout spacing nodes.
 * Props:
 *   - size: 2 | 4 | 6 | 8 | 12 (default: 4)
 * Example:
 *   <Spacer size={6} />
 */
interface SpacerProps {
  size?: 2 | 4 | 6 | 8 | 12
}
export function Spacer({ size = 4 }: SpacerProps) {
  const getSizeClass = (s: number) => {
    switch (s) {
      case 2: return 'h-2'
      case 4: return 'h-4'
      case 6: return 'h-6'
      case 8: return 'h-8'
      case 12: return 'h-12'
      default: return 'h-4'
    }
  }

  return <div className={getSizeClass(size)} aria-hidden="true" />
}
