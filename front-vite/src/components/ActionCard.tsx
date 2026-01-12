import { useState, memo } from 'react'
import { DepositButton } from './DepositButton'
import { WithdrawButton } from './WithdrawButton'
import { TabButton } from './ui/TabButton'
import { Icon } from './ui/Icon'
import { cn, containerPadding } from '../utils/classNames'

interface ActionCardProps {
  isConnected: boolean
}

const ConnectWalletPrompt = memo(function ConnectWalletPrompt() {
  return (
    <div className="card w-full lg:w-4/5 xl:w-3/4 2xl:w-2/3 p-12 sm:p-16 flex flex-col items-center gap-8 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#00D395]/10">
        <Icon name="user" size={40} color="#00FFB3" />
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-[24px] sm:text-[28px] font-bold">Connect Your Wallet</h3>
        <p className="text-[14px] sm:text-[15px] text-[#888888] leading-relaxed">
          Please connect your wallet to start using Swirl Pool
        </p>
      </div>
    </div>
  )
})

export function ActionCard({ isConnected }: ActionCardProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')

  return (
    <section className={cn('w-full py-10 md:py-16 lg:py-20', containerPadding)}>
      <div className="flex justify-center">
        {isConnected ? (
          <div className="card-flat w-full lg:w-4/5 xl:w-3/4 2xl:w-2/3">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              <TabButton
                label="Deposit"
                icon={<Icon name="deposit" size={16} />}
                isActive={activeTab === 'deposit'}
                onClick={() => setActiveTab('deposit')}
              />
              <TabButton
                label="Withdraw"
                icon={<Icon name="withdraw" size={16} />}
                isActive={activeTab === 'withdraw'}
                onClick={() => setActiveTab('withdraw')}
              />
            </div>

            {/* Tab Content - Fixed min-height for consistency */}
            <div className="p-8 md:p-10 lg:p-12 min-h-[400px] flex flex-col">
              {activeTab === 'deposit' ? <DepositButton /> : <WithdrawButton />}
            </div>
          </div>
        ) : (
          <ConnectWalletPrompt />
        )}
      </div>
    </section>
  )
}
