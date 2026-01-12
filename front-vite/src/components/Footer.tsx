import { memo } from 'react'
import { containerPadding } from '../utils/classNames'
import { APP_NAME, FOOTER_LINKS } from '../utils/constants'
import LogoImage from "../../public/logo.png"

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

const FooterNav = memo(function FooterNav() {
  return (
    <nav className="flex items-center gap-6 sm:gap-8">
      {FOOTER_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-[13px] sm:text-[14px] text-[#888888] hover:text-white transition-colors duration-200"
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
})

export const Footer = memo(function Footer() {
  return (
    <footer className={`w-full py-10 md:py-12 border-t border-white/5 ${containerPadding}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
        <FooterLogo />
        <FooterNav />
        <div className="text-[13px] sm:text-[14px] text-[#666666]">
          Powered by <span className="text-[#00FFB3]">Mantle Network</span>
        </div>
      </div>
    </footer>
  )
})
