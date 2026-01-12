import { memo } from 'react'
import { cn } from '../../utils/classNames'

interface TabButtonProps {
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}

export const TabButton = memo(function TabButton({
  label,
  icon,
  isActive,
  onClick,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 px-6 py-5 sm:py-6 text-[14px] sm:text-[15px] font-semibold transition-all duration-200 relative',
        isActive ? 'text-[#00FFB3]' : 'text-[#666666] hover:text-[#888888]'
      )}
    >
      <span className="flex items-center justify-center gap-3">
        {icon}
        {label}
      </span>
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00FFB3]" />
      )}
    </button>
  )
})
