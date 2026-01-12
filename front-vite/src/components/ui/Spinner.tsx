import { memo } from 'react'

interface SpinnerProps {
  size?: number
  color?: string
}

export const Spinner = memo(function Spinner({ size = 16, color = '#FFB800' }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  )
})
