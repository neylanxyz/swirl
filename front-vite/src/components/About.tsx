import { memo, type ReactNode } from 'react'
import { containerPadding } from '@/utils/classNames'
import { Icon } from '@/components/ui'
import { AlertCircleIcon, ChevronRight } from 'lucide-react'

interface SectionCardProps {
  icon: ReactNode
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

const SectionCard = memo(function SectionCard({
  icon,
  title,
  subtitle,
  children,
  className = ''
}: SectionCardProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Icon & Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#00FFB3]/10 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-[20px] sm:text-[22px] font-bold text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[13px] text-[#00FFB3] font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="text-[14px] sm:text-[15px] text-[#888888] leading-relaxed">
        {children}
      </div>
    </div>
  )
})

interface RoadmapItemProps {
  phase: string
  status: 'completed' | 'in-progress' | 'upcoming'
  title: string
  description: string
}

const RoadmapItem = memo(function RoadmapItem({
  phase,
  status,
  title,
  description
}: RoadmapItemProps) {
  const statusConfig = {
    completed: { color: '#00FFB3', label: 'Completed' },
    'in-progress': { color: '#00D395', label: 'In Progress' },
    upcoming: { color: '#666666', label: 'Upcoming' }
  }

  const config = statusConfig[status]

  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div
          className="w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all duration-300"
          style={{
            borderColor: config.color,
            backgroundColor: status === 'completed' ? config.color : 'transparent'
          }}
        />
        <div className="w-0.5 flex-1 bg-white/5 mt-2 group-hover:bg-white/10 transition-colors duration-300" />
      </div>

      <div className="flex-1 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.color }}>
            {phase}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-[#666666]">
            {config.label}
          </span>
        </div>
        <h4 className="text-[16px] font-semibold text-white mb-2">
          {title}
        </h4>
        <p className="text-[13px] text-[#888888] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
})

export const About = memo(function About() {
  return (
    <section className={`w-full min-h-screen py-12 md:py-16 lg:py-20 ${containerPadding}`}>
      <div className="max-w-4xl mx-auto flex flex-col gap-16 lg:gap-20">

        {/* Hero Header */}
        <div className="flex flex-col gap-4 items-center text-center">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={16} color="#00FFB3" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#00FFB3]">
              About
            </span>
          </div>

          <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-white leading-tight">
            The Future of<br />
            <span className="text-gradient">On-Chain Privacy</span>
          </h1>

          <p className="text-[15px] sm:text-[16px] text-[#888888] max-w-2xl leading-relaxed">
            Swirl is a privacy-preserving protocol that enables confidential transactions
            on Mantle Network using zero-knowledge proofs.
          </p>
        </div>

        {/* Problem Section */}
        <div className="border-l-2 border-white/10 pl-6 sm:pl-8">
          <SectionCard
            icon={<AlertCircleIcon name="alert" size={24} color="#ef4444" />}
            title="The Problem"
            subtitle="Public Blockchains Expose Everything"
          >
            <div className="flex flex-col gap-4">
              <p>
                Every transaction on public blockchains is visible to everyone, forever.
                Your balance, your counterparties, your activity patterns—all exposed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {[
                  'Complete transaction traceability',
                  'Permanent on-chain history',
                  'Identity linkage risks',
                  'Surveillance & censorship'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[13px]">
                    <ChevronRight size={14} className="text-[#ef4444] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2">
                This lack of privacy undermines the core promise of cryptocurrency—
                financial sovereignty—and creates real risks for users worldwide.
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Solution Section */}
        <div className="border-l-2 border-white/10 pl-6 sm:pl-8">
          <SectionCard
            icon={<Icon name="shield" size={24} color="#00FFB3" />}
            title="The Solution"
            subtitle="Privacy by Zero-Knowledge Proofs"
          >
            <div className="flex flex-col gap-4">
              <p>
                Swirl breaks the link between deposits and withdrawals using advanced
                cryptography. Your funds become indistinguishable from everyone else's,
                giving you plausible deniability.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="p-4 rounded-xl bg-[#00FFB3]/5 border border-[#00FFB3]/10">
                  <h4 className="text-[14px] font-semibold text-white mb-2">
                    Zero-Knowledge Proofs
                  </h4>
                  <p className="text-[12px] text-[#888888]">
                    Prove you own a valid deposit without revealing which one
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#00FFB3]/5 border border-[#00FFB3]/10">
                  <h4 className="text-[14px] font-semibold text-white mb-2">
                    Merkle Tree Storage
                  </h4>
                  <p className="text-[12px] text-[#888888]">
                    Deposits are stored in a Poseidon-hashed commitment tree
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#00FFB3]/5 border border-[#00FFB3]/10">
                  <h4 className="text-[14px] font-semibold text-white mb-2">
                    Fixed Denominations
                  </h4>
                  <p className="text-[12px] text-[#888888]">
                    All deposits are identical amounts, preventing amount correlation
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#00FFB3]/5 border border-[#00FFB3]/10">
                  <h4 className="text-[14px] font-semibold text-white mb-2">
                    Nullifier System
                  </h4>
                  <p className="text-[12px] text-[#888888]">
                    Prevents double-spending without revealing deposit identities
                  </p>
                </div>
              </div>

              <p className="mt-2">
                The result? You can withdraw to a completely different address,
                and only you can prove it came from your deposit.
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Business Model Section */}
        <div className="border-l-2 border-white/10 pl-6 sm:pl-8">
          <SectionCard
            icon={<Icon name="lock" size={24} color="#00D395" />}
            title="Business Model"
            subtitle="Sustainable & Transparent"
          >
            <div className="flex flex-col gap-4">
              <p>
                Swirl is designed to be sustainable while maintaining user trust.
                The protocol generates revenue through transparent, predictable fees.
              </p>

              <div className="p-5 rounded-xl bg-[#00D395]/5 border border-[#00D395]/15">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] font-semibold text-white">
                    Protocol Fee
                  </span>
                  <span className="text-[18px] font-bold text-[#00FFB3]">
                    0.1 MNT
                  </span>
                </div>
                <p className="text-[12px] text-[#888888]">
                  Per deposit (1 MNT denomination + 0.1 MNT fee)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Non-Custodial',
                    desc: 'Protocol owner can only collect fees, never user funds'
                  },
                  {
                    title: 'Transparent',
                    desc: 'All fees are visible on-chain and predictable'
                  },
                  {
                    title: 'Volume-Based',
                    desc: 'Revenue scales with adoption and usage'
                  },
                  {
                    title: 'Emergency Controls',
                    desc: 'Owner can pause contracts in extreme situations'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB3] mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-[13px] font-semibold text-white">
                        {item.title}
                      </h4>
                      <p className="text-[12px] text-[#888888] mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Roadmap Section */}
        <div className="border-l-2 border-white/10 pl-6 sm:pl-8">
          <SectionCard
            icon={<Icon name="document" size={24} color="#00D395" />}
            title="Roadmap"
            subtitle="Building Privacy Infrastructure"
            className="pb-0"
          >
            <div className="flex flex-col gap-2">
              <RoadmapItem
                phase="Phase 1"
                status="completed"
                title="Testnet Launch"
                description="Deployment on Mantle Sepolia with 1 MNT denomination. Testing core functionality and ZK proofs."
              />

              <RoadmapItem
                phase="Phase 2"
                status="in-progress"
                title="Mainnet Beta"
                description="Conduct comprehensive security audits and launch a bug bounty program. Deploy to production on the Mantle Network with enhanced monitoring, followed by a phased increase in deposit limits to ensure stability and risk mitigation."
              />

              <RoadmapItem
                phase="Phase 3"
                status="upcoming"
                title="Multi-Denomination"
                description="Support for multiple deposit amounts (0.1 MNT, 1 MNT, 10 MNT) to improve anonymity sets and flexibility."
              />

              <RoadmapItem
                phase="Phase 4"
                status="upcoming"
                title="Advanced Features"
                description="Multi-hop withdrawals, light client integration, mobile wallet support, and cross-chain compatibility."
              />

              <RoadmapItem
                phase="Phase 5"
                status="upcoming"
                title="Decentralized Governance"
                description="Transition to community governance with transparent treasury management and protocol upgrade mechanisms."
              />
            </div>
          </SectionCard>
        </div>

        {/* CTA Section */}
        <div className="text-center pt-4">
          <p className="text-[14px] text-[#666666] mb-4">
            Ready to experience private transactions?
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00FFB3] to-[#00D395] text-[#0a0a0a] font-semibold text-[14px] hover:shadow-lg hover:shadow-[#00D395]/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started
            <ChevronRight size={16} />
          </a>
        </div>

      </div>
    </section>
  )
})
