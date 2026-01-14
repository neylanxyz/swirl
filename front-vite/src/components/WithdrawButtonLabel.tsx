import { EncryptedText } from "@/components"

export function WithdrawButtonLabel({
    isGeneratingProof,
    isWithdrawing,
    isConfirmingWithdraw,
    isWithdrawConfirmed,
    commitmentData,
}: any) {
    if (isGeneratingProof)
        return (
            <span className="flex items-center gap-2 text-black">
                <span className="loader-btn" />
                <span className="fade-text">
                    <EncryptedText
                        text="Generating Proof"
                        className="text-black!"
                    />
                </span>
            </span>
        )

    if (isWithdrawing)
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

    if (isConfirmingWithdraw)
        return (
            <span className="flex items-center gap-2 text-black">
                <span className="loader-btn" />
                <span className="fade-text">
                    <EncryptedText
                        text="Confirming on Blockchain"
                        className="text-black!"
                    />
                </span>
            </span>
        )

    if (isWithdrawConfirmed)
        return (
            <span className="fade-in">
                ✓ Withdrawal Complete!
            </span>
        )

    return commitmentData ? (
        <span className="flex items-center gap-2 text-black fade-in">
            <span className="loader-btn" />
            <span className="fade-text">
                <EncryptedText
                    text="Withdraw 1 MNT"
                    className="text-black!"
                />
            </span>
        </span>
    ) : (
        <span className="flex items-center gap-2 text-black fade-in">
            <span className="loader-btn" />
            <span className="fade-text">
                <EncryptedText
                    text="Paste Encoded Note"
                    className="text-black!"
                />
            </span>
        </span>
    )
}
