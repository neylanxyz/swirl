import { useSwirlPool } from "../hooks/useSwirlPool";
import { compute } from "../scripts/compute"

export const WithdrawButton = () => {
    const { currentRoot, getAllFilledSubtrees } = useSwirlPool();

    return (
        <button
            onClick={() => compute(427004223558349904752061299763979763480532021383674602493522808220896556501n, 66582530926734022332873511281846420054378440245186832841051227939978137540n, 1n, currentRoot, getAllFilledSubtrees)
            }
        >
            Withdraw
        </button>
    )
}