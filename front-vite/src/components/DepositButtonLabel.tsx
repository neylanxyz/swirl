import { EncryptedText } from "@/components"

export function DepositButtonLabel({
    isDepositing,
    isConfirming,
    isDepositConfirmed,
}: any) {
    if (isDepositing)
        return (
            <span className="flex items-center gap-2 text-black">
                <span className="loader-btn" />
                <span className="fade-text">
                    <EncryptedText
                        text="Depositing 1 MNT"
                        className="text-black!"
                    />
                </span>
            </span>
        )

    if (isConfirming)
        return (
            <span className="flex items-center gap-2 text-black">
                <span className="loader-btn" />
                <span className="fade-text">
                    <EncryptedText
                        text="Awaiting Wallet Approval"
                        className="text-black!"
                    />
                </span>
            </span>
        )
    if (isDepositConfirmed)
        return (
            <span className="fade-in">
                ✓ Deposit Completed!
            </span>
        )

    return (
        <span className="flex items-center gap-2 text-black fade-in">
            <span className="loader-btn" />
            <span className="fade-text">
                <EncryptedText
                    text="Deposit 1 MNT"
                    className="text-black!"
                />
            </span>
        </span>
    )
}
