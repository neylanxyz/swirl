import { memo } from 'react'
import { APP_NAME, containerPadding } from '@/utils'
import LogoImage from "../../public/logo.png"
import { GithubIcon } from 'lucide-react'

const FooterLogo = memo(function FooterLogo() {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
        <img src={LogoImage} alt="SWIRL Logo" className="w-full h-full object-contain" />
      </div>
      <span className="text-[13px] text-[#888888]">{APP_NAME}</span>
    </div>
  )
})

export const Footer = memo(function Footer() {
  return (
    <footer className={`w-full py-10 md:py-12 border-t border-white/5 ${containerPadding}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
        <FooterLogo />
        <div className='flex gap-2 items-center'>
          <GithubIcon className='text-[#666666] hover:text-[#00FFB3] cursor-pointer transition-colors duration-300 ease-in-out ' onClick={() => {
            window.open(
              "https://github.com/neylanxyz/swirl/blob/main",
              "_blank",
              "noreferrer noopener"
            )
          }} />
          <div className="text-[13px] sm:text-[14px] text-[#666666]">
            Powered by <span className="text-[#00FFB3] cursor-pointer hover:text-[#00FFB3]/75" onClick={() => {
              window.open(
                "https://www.mantle.xyz/",
                "_blank",
                "noreferrer noopener"
              )
            }} >Mantle Network</span>
          </div>
        </div>

      </div>
    </footer>
  )
})
