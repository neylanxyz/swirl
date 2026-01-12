import { memo } from 'react'
import { containerPadding } from '../utils/classNames'
import { STATS } from '../utils/constants'
import LogoImage from "../../public/logo.png"

interface StatItemProps {
  value: string
  label: string
}

const StatItem = memo(function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[28px] sm:text-[34px] font-bold text-[#00FFB3]">{value}</div>
      <div className="text-[11px] sm:text-[12px] uppercase tracking-wider text-[#666666]">{label}</div>
    </div>
  )
})

export const Hero = memo(function Hero() {
  return (
    <section className={`w-full py-12 md:py-20 lg:py-28 ${containerPadding}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-16 xl:gap-20">
        {/* Left: Hero Content */}
        <div className="flex-1 flex flex-col gap-12 sm:gap-16">
          <div className="flex flex-col gap-8 sm:gap-10">
            <h2 className="heading-hero">
              <span className="text-white">Privacy with</span>
              <br />
              <span className="text-gradient">Compliance</span>
            </h2>
            <p className="text-[15px] sm:text-[16px] lg:text-[17px] text-[#888888] leading-relaxed lg:pr-8">
              The first compliant privacy pool on Mantle Network. Break the on-chain link between your addresses while
              proving your funds are clean.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 sm:gap-12 lg:gap-16">
            <StatItem value={STATS.tvl} label="Total Value Locked" />
            <StatItem value={STATS.deposits} label="Total Deposits" />
            <StatItem value={STATS.compliance} label="Compliance Rate" />
          </div>
        </div>

        <div className="size-12 sm:size-14 md:size-100 flex-shrink-0 " >
          <img src={LogoImage} alt="SWIRL Logo" className="w-full h-full object-contain" />
        </div>
      </div>
    </section>
  )
})
