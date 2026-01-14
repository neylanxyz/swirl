import {
    BaseError,
    ContractFunctionRevertedError,
    UserRejectedRequestError,
} from 'viem';

export function parseViemError(err: unknown) {
    if (!(err instanceof BaseError)) {
        return { type: 'unknown' as const };
    }

    // 1️⃣ User rejected tx
    const rejected = err.walk(
        (e): e is UserRejectedRequestError =>
            e instanceof UserRejectedRequestError
    );

    if (rejected instanceof UserRejectedRequestError) {
        return { type: 'user_rejected' as const };
    }

    // 2️⃣ Contract revert
    const revert = err.walk(
        (e): e is ContractFunctionRevertedError =>
            e instanceof ContractFunctionRevertedError
    );

    if (revert instanceof ContractFunctionRevertedError) {
        return {
            type: 'revert' as const,
            errorName: revert.data?.errorName,
            reason: revert.reason,
        };
    }

    return { type: 'unknown' as const };
}
