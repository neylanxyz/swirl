import { useState, useCallback } from 'react';
import { useSwirlPool } from './useSwirlPool';
import { useIndexer } from './useIndexer';
import { publicClient } from '@/config';
import { compute } from '@/scripts/compute.mjs';
import { generateProof } from '@/helpers/generateProof';

export const WithdrawStep = {
    IDLE: 'IDLE',
    FETCHING_DATA: 'FETCHING_DATA',
    GENERATING_INPUTS: 'GENERATING_INPUTS',
    GENERATING_PROOF: 'GENERATING_PROOF',
    SIMULATING: 'SIMULATING',
    AWAITING_SIGNATURE: 'AWAITING_SIGNATURE',
    SENDING_TRANSACTION: 'SENDING_TRANSACTION',
    CONFIRMING_TRANSACTION: 'CONFIRMING_TRANSACTION',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
} as const;

export type WithdrawStep = typeof WithdrawStep[keyof typeof WithdrawStep];

const LOADING_STEPS: WithdrawStep[] = [
    WithdrawStep.FETCHING_DATA,
    WithdrawStep.GENERATING_INPUTS,
    WithdrawStep.GENERATING_PROOF,
    WithdrawStep.SIMULATING,
    WithdrawStep.AWAITING_SIGNATURE,
    WithdrawStep.SENDING_TRANSACTION,
    WithdrawStep.CONFIRMING_TRANSACTION,
];

export function useWithdrawTransaction() {
    const [step, setStep] = useState<WithdrawStep>(WithdrawStep.IDLE);
    const [txHash, setTxHash] = useState<string | undefined>();
    const [error, setError] = useState<Error | undefined>();

    const { withdrawAction, address } = useSwirlPool();
    const { fetchCommitments } = useIndexer();

    const executeWithdraw = useCallback(async (
        encodedInput: string,
        leafIndex: number,
        recipientAddress?: string
    ) => {
        try {
            setStep(WithdrawStep.IDLE);
            setError(undefined);
            setTxHash(undefined);

            if (!address) throw new Error("Wallet not connected");

            // --- ETAPA 1: Fetch Commitments (Indexer) ---
            setStep(WithdrawStep.FETCHING_DATA);
            const deposits = await fetchCommitments(leafIndex);

            if (!deposits || deposits.length === 0) {
                throw new Error('No commitments found in indexer');
            }

            // --- ETAPA 2: Gerar Inputs (Off-chain) ---
            setStep(WithdrawStep.GENERATING_INPUTS);

            // Validating
            for (let i = 0; i < deposits.length; i++) {
                if (deposits[i].leafIndex !== i) {
                    throw new Error(`Commitments out of order! Expected ${i}, got ${deposits[i].leafIndex}`);
                }
            }

            const commitments = deposits.map((d) => d.commitment);

            // Delay para UI (Essencial)
            await new Promise(resolve => setTimeout(resolve, 2500));

            // @ts-ignore
            const inputs = await compute(commitments, encodedInput);

            // --- ETAPA 3: Gerar ZK Proof ---
            setStep(WithdrawStep.GENERATING_PROOF);

            // Delay para UI (Essencial)
            await new Promise(resolve => setTimeout(resolve, 2500));

            // @ts-ignore
            const proof = await generateProof(inputs);

            // --- ETAPA 4: Assinar & Enviar ---
            setStep(WithdrawStep.AWAITING_SIGNATURE);

            const finalRecipient = (recipientAddress || address) as `0x${string}`;

            // @ts-ignore
            const hash = await withdrawAction(
                proof.proof as `0x${string}`,
                // @ts-ignore
                inputs.root_bytes32 as `0x${string}`,
                // @ts-ignore
                inputs.nullifier_hash_bytes32 as `0x${string}`,
                finalRecipient
            );

            setTxHash(hash);
            setStep(WithdrawStep.SENDING_TRANSACTION);

            // --- ETAPA 5: Confirmar ---
            setStep(WithdrawStep.CONFIRMING_TRANSACTION);

            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            if (receipt.status === 'success') {
                setStep(WithdrawStep.SUCCESS);
            } else {
                throw new Error('Transaction reverted');
            }

        } catch (err) {
            console.error(err);
            setStep(WithdrawStep.ERROR);
            setError(err as Error);
            throw err;
        }
    }, [withdrawAction, address, fetchCommitments]);

    const reset = useCallback(() => {
        setStep(WithdrawStep.IDLE);
        setError(undefined);
        setTxHash(undefined);
    }, []);

    return {
        step,
        txHash,
        error,
        executeWithdraw,
        reset,

        // Helpers
        isIdle: step === WithdrawStep.IDLE,
        isFetchingData: step === WithdrawStep.FETCHING_DATA,
        isGeneratingInputs: step === WithdrawStep.GENERATING_INPUTS,
        isGeneratingProof: step === WithdrawStep.GENERATING_PROOF,
        isAwaitingSignature: step === WithdrawStep.AWAITING_SIGNATURE,
        isSending: step === WithdrawStep.SENDING_TRANSACTION,
        isConfirming: step === WithdrawStep.CONFIRMING_TRANSACTION,
        isSuccess: step === WithdrawStep.SUCCESS,
        isError: step === WithdrawStep.ERROR,

        isLoading: LOADING_STEPS.includes(step),
    };
}