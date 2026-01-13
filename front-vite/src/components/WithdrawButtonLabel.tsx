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
                <EncryptedText
                    text="Generating Proof"
                    className="text-black!"
                />
            </span>
        )

    if (isWithdrawing)
        return (
            <span className="flex items-center gap-2 text-black">
                <span className="loader-btn" />
                <EncryptedText
                    text="Awaiting Wallet Approval"
                    className="text-black!"
                />
            </span>
        )

    if (isConfirmingWithdraw)
        return (
            <span className="flex items-center gap-2 text-black">
                <span className="loader-btn" />
                <EncryptedText
                    text="Confirming on Blockchain"
                    className="text-black!"
                />
            </span>
        )

    if (isWithdrawConfirmed)
        return <span>✓ Withdrawal Complete!</span>

    return commitmentData ? "Withdraw 1 ETH" : "Paste Code First"
}
