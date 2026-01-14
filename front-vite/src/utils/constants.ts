/**
 * Application constants
 */

export const APP_NAME = 'SWIRL'

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
  { label: 'Docs', externalPage: 'https://github.com/neylanxyz/swirl/blob/main/README.md' },
  { label: 'FAQ', href: '/FAQ' },
]

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const
