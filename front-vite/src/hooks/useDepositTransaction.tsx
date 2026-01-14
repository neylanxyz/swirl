import { useState, useCallback } from 'react';
import { useSwirlPool } from './useSwirlPool';
import { publicClient } from '@/config';

export const DepositStep = {
    IDLE: 'IDLE',
    GENERATING_COMMITMENT: 'GENERATING_COMMITMENT',
    SIMULATING: 'SIMULATING',
    AWAITING_SIGNATURE: 'AWAITING_SIGNATURE',
    SENDING_TRANSACTION: 'SENDING_TRANSACTION',
    CONFIRMING_TRANSACTION: 'CONFIRMING_TRANSACTION',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
} as const;

export type DepositStep =
    typeof DepositStep[keyof typeof DepositStep];

const LOADING_STEPS: DepositStep[] = [
    DepositStep.GENERATING_COMMITMENT,
    DepositStep.SIMULATING,
    DepositStep.AWAITING_SIGNATURE,
    DepositStep.SENDING_TRANSACTION,
    DepositStep.CONFIRMING_TRANSACTION,
];

export function useDepositTransaction() {
    const [step, setStep] = useState<DepositStep>(DepositStep.IDLE);
    const [txHash, setTxHash] = useState<string | undefined>();
    const [error, setError] = useState<Error | undefined>();

    const { depositAction, refetchNextIndex } = useSwirlPool();

    const executeDeposit = useCallback(async (generateZKProof: () => Promise<string>) => {
        try {
            setStep(DepositStep.IDLE);
            setError(undefined);
            setTxHash(undefined);

            // 1. Gerar Proof (Off-chain)
            setStep(DepositStep.GENERATING_COMMITMENT);

            await new Promise(resolve => setTimeout(resolve, 2500));
            const commitment = await generateZKProof();

            // 2. Simular
            setStep(DepositStep.SIMULATING);

            // 3. Assinar & Enviar
            setStep(DepositStep.AWAITING_SIGNATURE);
            const hash = await depositAction(commitment as `0x${string}`);

            setTxHash(hash);

            // 4. Enviado para Mempool
            setStep(DepositStep.SENDING_TRANSACTION);
            await new Promise(resolve => setTimeout(resolve, 2500));

            // 5. Aguardar Confirmação (On-chain)
            setStep(DepositStep.CONFIRMING_TRANSACTION);

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            await new Promise(resolve => setTimeout(resolve, 2500));

            if (receipt.status === 'success') {
                setStep(DepositStep.SUCCESS);
                refetchNextIndex();
            } else {
                throw new Error('Transaction reverted');
            }

        } catch (err) {
            console.error(err);
            setStep(DepositStep.ERROR);
            setError(err as Error);

            throw err;
        }
    }, [depositAction, refetchNextIndex]);

    const reset = useCallback(() => {
        setStep(DepositStep.IDLE);
        setError(undefined);
        setTxHash(undefined);
    }, []);

    return {
        step,
        txHash,
        error,
        executeDeposit,
        reset,

        // States
        isIdle: step === DepositStep.IDLE,
        isGenerating: step === DepositStep.GENERATING_COMMITMENT,
        isSimulating: step === DepositStep.SIMULATING,
        isAwaitingSignature: step === DepositStep.AWAITING_SIGNATURE,
        isSending: step === DepositStep.SENDING_TRANSACTION,
        isConfirming: step === DepositStep.CONFIRMING_TRANSACTION,
        isSuccess: step === DepositStep.SUCCESS,
        isError: step === DepositStep.ERROR,

        isLoading: LOADING_STEPS.includes(step),
    };
}