import { Label } from "./Label";

export function DepositButtonLabel({
    isGenerationCommitmentBytes32,
    isDepositing,
    isDepositSubmitted,
    isConfirming,
    isDepositConfirmed,
    depositTxHash,
}: {
    isGenerationCommitmentBytes32: boolean,
    isDepositing: boolean,
    isDepositSubmitted: boolean
    isConfirming: boolean,
    isDepositConfirmed: boolean,
    depositTxHash: `0x${string}` | undefined,
}) {

    if (isGenerationCommitmentBytes32)
        return (
            <Label text="Generating commitment data" />
        )

    if (isDepositing && isGenerationCommitmentBytes32)
        return (
            <Label text="Awaiting Wallet Confirmation" />
        )

    if (isDepositSubmitted)
        return (
            <Label text="Depositing 1 MNT" />
        )


    if (isConfirming)
        return (
            <Label text="Awaiting Wallet Approval" />
        )

    if (isDepositConfirmed && depositTxHash)
        return (
            <span className="fade-in">
                ✓ Deposit Completed!
            </span>
        )

    return !isGenerationCommitmentBytes32 ? (
        <Label text="Deposit 1 MNT" />
    ) : isGenerationCommitmentBytes32 && (
        <Label text="Generating commitment data" />
    )
}
