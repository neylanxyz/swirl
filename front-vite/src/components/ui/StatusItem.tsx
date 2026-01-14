import { useEffect, useState } from "react"

interface StatItemProps {
    value: string | bigint | number | undefined
    label: string
}

export const StatusItem = ({ value, label }: StatItemProps) => {
    const [showValue, setShowValue] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowValue(true)
        }, 1250)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="flex flex-col gap-1">
            {/* Slot fixo com sobreposição */}
            <div className="relative h-[34px] sm:h-[42px]">
                {/* Loader */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out
    ${showValue && value !== undefined ? "opacity-0" : "opacity-100"}`}
                >
                    <div className="loader" />
                </div>

                {/* Valor */}
                <div
                    className={`absolute inset-0 flex items-center transition-all duration-300 ease-out
            ${showValue && value !== undefined
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-1"
                        }`}
                >
                    <span className="text-[28px] sm:text-[34px] font-bold text-[#00FFB3] leading-none text-nowrap">
                        {value}
                    </span>
                </div>
            </div>

            <div className="text-[11px] sm:text-[12px] uppercase tracking-wider text-[#666666]">
                {label}
            </div>
        </div>
    )
}
