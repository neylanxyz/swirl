import { memo } from 'react'
import { InfoBox } from './InfoBox'

interface StatusMessageProps {
  message: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export const StatusMessage = memo(function StatusMessage({
  message,
  variant = 'default',
}: StatusMessageProps) {
  const textColor = {
    default: 'text-[#888888]',
    success: 'text-[#00FFB3]',
    warning: 'text-[#FFB800]',
    error: 'text-red-300',
  }

  return (
    <InfoBox variant={variant}>
      <p className={`text-[12px] sm:text-sm whitespace-pre-wrap ${textColor[variant]}`}>
        {message}
      </p>
    </InfoBox>
  )
})
