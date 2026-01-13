import { memo } from 'react'
import { cn } from '@/utils/classNames'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
  children: React.ReactNode
}

export const Button = memo(function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary'

  return (
    <button
      className={cn(variantClass, 'w-full', className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  )
})
