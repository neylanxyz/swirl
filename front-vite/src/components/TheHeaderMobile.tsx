import { NAV_LINKS } from "@/utils";
import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { CustomConnectButton } from "@/components";
import { createPortal } from "react-dom";

interface TheHeaderMobileProps {
    isOpen: boolean;
    toggleMenu: () => void;
}

export const TheHeaderMobile: React.FC<TheHeaderMobileProps> = ({
    isOpen,
    toggleMenu,
}) => {
    if (!isOpen) return null;

    function useLockBodyScroll(isLocked: boolean) {
        useEffect(() => {
            if (isLocked) {
                document.body.classList.add("overflow-hidden");
            } else {
                document.body.classList.remove("overflow-hidden");
            }

            return () => {
                document.body.classList.remove("overflow-hidden");
            };
        }, [isLocked]);
    }
    useLockBodyScroll(isOpen);


    return createPortal(
        <div
            className={`fixed right-0 top-0 z-50 flex h-screen w-full flex-col justify-between rounded-md bg-black transition-transform duration-500  ${isOpen ? "translate-x-0" : "translate-x-full"
                }`}
        >
            <div className="flex flex-col">
                <div className="flex items-center justify-between px-2 py-4 sm:px-8">

                    <CustomConnectButton label="Connect" className="p-2!" />

                    <button onClick={toggleMenu} aria-label="Close Icon">
                        <XIcon className="text-white" />
                    </button>
                </div>

                <div className="flex w-full flex-col gap-8 p-4">
                    <ul className="flex flex-col space-y-4">
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
                    </ul>
                </div>
            </div>
        </div>,
        document.body
    );
};
