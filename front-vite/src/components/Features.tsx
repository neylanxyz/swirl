import { memo } from 'react'
import { containerPadding } from '../utils/classNames'
import { Icon } from './ui/Icon'

interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard = memo(function FeatureCard({ icon, title, description }: FeatureProps) {
  return (
    <div className="flex flex-col items-center text-center gap-5 sm:gap-6">
      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl flex items-center justify-center bg-[#00D395]/10">
        {icon}
      </div>
      <h4 className="text-[18px] sm:text-[20px] font-bold text-white">{title}</h4>
      <p className="text-[14px] sm:text-[15px] text-[#888888] leading-relaxed">{description}</p>
    </div>
  )
})

export const Features = memo(function Features() {
  return (
    <section className={`w-full py-16 md:py-24 lg:py-32 border-t border-white/5 ${containerPadding}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-16">
        <FeatureCard
          icon={<Icon name="lock" size={32} color="#00FFB3" />}
          title="Non-Custodial"
          description="Your funds are secured by smart contracts. Only you control your assets."
        />
        <FeatureCard
          icon={<Icon name="shield" size={32} color="#00FFB3" />}
          title="Compliant by Design"
          description="Association Set Provider screens deposits to block illicit funds."
        />
        <FeatureCard
          icon={<Icon name="document" size={32} color="#00FFB3" />}
          title="Prove Innocence"
          description="Generate ZK proofs showing your funds aren't linked to bad actors."
        />
      </div>
    </section>
  )
})
