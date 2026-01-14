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
        <div className="flex flex-col gap-4 text-start min-w-[160px] sm:min-w-[180px] flex-shrink-0">

            {/* Área de Sobreposição (Grid) */}
            <div className="stat-overlay h-[42px] relative">

                {/* VALOR (Texto) 
                    - Define a altura do container.
                    - text-wrap: permite quebra se o número for muito grande.
                    - transition: controla o aparecimento.
                */}
                <span
                    className={`
                        text-[28px] sm:text-[34px] font-bold text-[#00FFB3] leading-none 
                        text-center text-wrap break-words w-full px-2
                        transition-opacity duration-500 ease-in-out
                        ${showValue && value !== undefined ? "opacity-100" : "opacity-0"}
                    `}
                >
                    {value}
                </span>

                {/* LOADER 
                    - Fica fixo no centro da área do texto.
                    - Desaparece quando o valor aparece.
                */}
                <div
                    className={`
                        transition-opacity duration-300 ease-out
                        ${showValue && value !== undefined ? "opacity-0 pointer-events-none" : "opacity-100"}
                    `}
                >
                    <div className="loader" />
                </div>

            </div>

            {/* LABEL */}
            <div className="text-[11px] sm:text-[12px] uppercase tracking-wider text-[#666666] text-center">
                {label}
            </div>
        </div>
    )
}