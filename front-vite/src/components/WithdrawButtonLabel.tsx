import { Label } from "@/components"

export function WithdrawButtonLabel({
    isGeneratingProof,
    isWithdrawing,
    isWithdrawConfirming,
    isWithdrawConfirmed,
    commitmentData,
}: any) {

    if (isGeneratingProof)
        return (
            <Label text="Generating Proof" />
        )

    if (isWithdrawing)
        return (
            <Label text="Awaiting Wallet Approval" />
        )

    if (isWithdrawConfirming)
        return (
            <Label text="Confirming on Blockchain" />
        )

    if (isWithdrawConfirmed)
        return (
            <span className="fade-in">
                ✓ Withdrawal Complete!
            </span>
        )

    return commitmentData ? (
        < Label text="Withdraw 1 MNT" />
    ) : (
        < Label text="Paste Encoded Note" />
    )
}
