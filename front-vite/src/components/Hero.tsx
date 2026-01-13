import { useEffect, useState } from 'react'
import { containerPadding } from '../utils/classNames'
import { STATS } from '../utils/constants'
import LogoImage from "../../public/logo.png"
import { SWIRL_PRIVATE_POOL_ADDRESS } from '../helpers/contract'
import { publicClient } from '../config/client'
import { useSwirlPool } from '../hooks/useSwirlPool'
import { formatEther } from 'viem'
import { StatusItem } from './ui/StatusItem'

export const Hero = () => {

  const { nextIndex } = useSwirlPool();
  const [balance, setBalance] = useState<bigint | undefined | string>(undefined);

  useEffect(() => {
    try {
      const contractBalance = async () => {

        const balanceContract = await publicClient.getBalance({
          address: SWIRL_PRIVATE_POOL_ADDRESS,
        })
        setBalance(`${formatEther(balanceContract)} MNT`)
      }
      contractBalance()
    }
    catch (error) {
      console.log("error =", error)
    }

  }, [balance])

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

          <div className="flex flex-wrap gap-8 sm:gap-12 lg:gap-16">
            <StatusItem value={balance} label="Total Value Locked" />
            <StatusItem value={nextIndex ? nextIndex : STATS.deposits} label="Total Deposits" />
            <StatusItem value={STATS.compliance} label="Compliance Rate" />
          </div>
        </div>

        <div className="size-12 sm:size-14 md:size-100 flex-shrink-0 " >
          <img src={LogoImage} alt="SWIRL Logo" className="w-full h-full object-contain" />
        </div>
      </div>
    </section>
  )
}
