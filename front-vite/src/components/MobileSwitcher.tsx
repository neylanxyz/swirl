"use client";

import { Menu, XIcon } from "lucide-react";
import { useState } from "react";
import { CustomConnectButton, TheHeaderMobile } from "@/components";

export const MobileSwitcher = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <>
            <div className="flex items-center sm:hidden gap-4">
                {isOpen ? (
                    <XIcon
                        className="w-8 cursor-pointer text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    />
                ) : (
                    <>
                        <CustomConnectButton label="Connect" className="p-2!" />
                        <Menu
                            className="w-8 cursor-pointer text-white"
                            onClick={() => setIsOpen(!isOpen)}
                        />
                    </>
                )}
            </div>
            <TheHeaderMobile isOpen={isOpen} toggleMenu={() => setIsOpen(!open)} />
        </>
    );
};
