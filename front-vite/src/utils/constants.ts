/**
 * Application constants
 */

export const APP_NAME = 'SWIRL'

export const STATS = {
  tvl: '$18.4M',
  deposits: '4,889',
  compliance: '100%',
} as const

export const FEATURES = [
  {
    id: 'non-custodial',
    title: 'Non-Custodial',
    description: 'Your funds are secured by smart contracts. Only you control your assets.',
    icon: 'lock',
  },
  {
    id: 'compliant',
    title: 'Compliant by Design',
    description: 'Association Set Provider screens deposits to block illicit funds.',
    icon: 'shield',
  },
  {
    id: 'privacy',
    title: 'Prove Innocence',
    description: "Generate ZK proofs showing your funds aren't linked to bad actors.",
    icon: 'document',
  },
] as const

export const NAV_LINKS = [
  { label: 'Docs', href: '#' },
  { label: 'Stats', href: '#' },
  { label: 'FAQ', href: '#' },
] as const

export const FOOTER_LINKS = [
  { label: 'GitHub', href: '#' },
  { label: 'Documentation', href: '#' },
  { label: 'Audits', href: '#' },
  { label: 'Twitter', href: '#' },
] as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const
