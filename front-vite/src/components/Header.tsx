import { memo } from 'react'
import { containerPadding } from '@/utils/classNames'
import { APP_NAME, NAV_LINKS } from '@/utils/constants'
import LogoImage from "../../public/logo.png"
import { CustomConnectButton } from './CustomConnectButton'

const Logo = memo(function Logo() {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="size-12 sm:size-14 md:size-22 flex-shrink-0 " >
        <img src={LogoImage} alt="SWIRL Logo" className="w-full h-full object-contain" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <h1 className="text-lg sm:text-xl font-bold text-white">{APP_NAME}</h1>
        <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-[#00FFB3]/10 text-[#00FFB3] rounded">
          BETA
        </span>
      </div>
    </div>
  )
})

const Navigation = memo(function Navigation() {
  return (
    <nav className="flex items-center gap-5 sm:gap-6">
      {NAV_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href ?? link.externalPage}
          className="text-[13px] sm:text-[14px] text-[#888888] hover:text-[#00FFB3] transition-colors duration-200"
          target={link.externalPage ? '_blank' : "_self"}
          rel='noopener noreferrer'
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
})

export const Header = memo(function Header() {
  return (
    <header
      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 py-6 sm:py-8 border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl ${containerPadding}`}
    >
      <Logo />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full sm:w-auto">
        <Navigation />
        <div className="w-full sm:w-auto">
          <CustomConnectButton />
        </div>
      </div>
    </header>
  )
})
