"use client"

interface StatItemProps {
    value: string | bigint | undefined | number
    label: string
}

export const StatusItem = ({ value, label }: StatItemProps) => {

    return (
        <div className="flex flex-col gap-1">
            <div className="text-[28px] sm:text-[34px] font-bold text-[#00FFB3]">{value}</div>
            <div className="text-[11px] sm:text-[12px] uppercase tracking-wider text-[#666666]">{label}</div>
        </div>
    )
}