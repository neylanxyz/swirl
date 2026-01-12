/**
 * Utility function to merge class names
 * @param classes - Array of class names or conditional classes
 * @returns Merged class names string
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Button variant class generator
 */
export const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'px-4 py-2 text-[#00FFB3] hover:bg-[#00D395]/10 transition-all duration-200',
} as const

/**
 * Card variant class generator
 */
export const cardVariants = {
  default: 'card',
  flat: 'card-flat',
  elevated: 'card shadow-xl',
} as const

/**
 * Container padding responsive classes
 */
export const containerPadding = 'px-6 md:px-12 lg:px-20 xl:px-24'

/**
 * Section spacing responsive classes
 */
export const sectionSpacing = 'py-12 md:py-20 lg:py-28'

/**
 * Text size variants
 */
export const textSizes = {
  xs: 'text-[11px] sm:text-xs',
  sm: 'text-[12px] sm:text-sm',
  base: 'text-[14px] sm:text-base',
  lg: 'text-[16px] sm:text-lg',
  xl: 'text-[18px] sm:text-xl',
  '2xl': 'text-[20px] sm:text-2xl',
  '3xl': 'text-[24px] sm:text-3xl',
  '4xl': 'text-[32px] sm:text-4xl',
} as const
