import { useSwirlPool } from "../hooks/useSwirlPool";
import { compute } from "../scripts/compute"
import { useCommitmentStore } from "../stores/commitmentStore";

export const WithdrawButton = () => {
    const { currentRoot, getAllFilledSubtrees } = useSwirlPool();
    const { commitmentData } = useCommitmentStore();
    if (!commitmentData) return;

    return (
        <button
            onClick={() => compute(commitmentData.secret, commitmentData.nullifier, 3n, currentRoot, getAllFilledSubtrees)
            }
        >
            Withdraw
        </button>
    )
}