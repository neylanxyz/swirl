import { memo } from 'react'
import { cn } from '../../utils/classNames'

interface InfoBoxProps {
  icon?: React.ReactNode
  title?: string
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

const variantStyles = {
  default: 'bg-[#00D395]/5 border-[#00D395]/15',
  success: 'bg-[#00D395]/10 border-[#00D395]/30',
  warning: 'bg-[#FFB800]/10 border-[#FFB800]/30',
  error: 'bg-red-500/10 border-red-500/30',
}

export const InfoBox = memo(function InfoBox({
  icon,
  title,
  children,
  variant = 'default',
  className,
}: InfoBoxProps) {
  return (
    <div className={cn('info-box border rounded-xl p-4 md:p-5', variantStyles[variant], className)}>
      {(icon || title) && (
        <div className="flex items-start gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          {title && (
            <h4 className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider">
              {title}
            </h4>
          )}
        </div>
      )}
      <div className={cn(icon || title ? 'pl-0' : '')}>{children}</div>
    </div>
  )
})
