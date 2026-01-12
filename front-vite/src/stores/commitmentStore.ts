import { create } from 'zustand';

export interface CommitmentData {
    secret: bigint;
    nullifier: bigint;
    leafIndex: number;
}

/**
 * Encode CommitmentData to base64 string
 * Use this after deposit to save the secret data
 * NOTE: Commitment is NOT stored (can be recalculated from secret + nullifier)
 */
export function encodeCommitmentData(data: CommitmentData): string {
    const obj = {
        secret: data.secret.toString(),
        nullifier: data.nullifier.toString(),
        leafIndex: data.leafIndex.toString()
    };

    const jsonString = JSON.stringify(obj);
    const encoded = btoa(jsonString);
    return encoded;
}

/**
 * Decode base64 string back to CommitmentData
 * Use this before withdraw to restore the secret data
 */
export function decodeCommitmentData(encoded: string): CommitmentData {
    try {
        const jsonString = atob(encoded);
        const obj = JSON.parse(jsonString);

        return {
            secret: BigInt(obj.secret),
            nullifier: BigInt(obj.nullifier),
            leafIndex: parseInt(obj.leafIndex, 10)
        };
    } catch (error) {
        throw new Error('Invalid encoded commitment data');
    }
}

interface CommitmentStore {
    // State
    commitmentData: CommitmentData | null;
    encodedData: string;
    error: string;
    copySuccess: boolean;

    // Actions
    /**
     * Encode commitment data to base64
     * Use after deposit to get shareable code
     * This is the ONLY way to set commitmentData
     */
    encodeData: (data: CommitmentData) => string;

    /**
     * Decode base64 string back to commitment data
     * Use before withdraw to restore data
     */
    decodeData: (encoded: string) => CommitmentData;

    /**
     * Copy encoded data to clipboard
     * Auto-resets copySuccess after 2 seconds
     */
    copyToClipboard: () => Promise<boolean>;

    /**
     * Clear all data including encoded string
     */
    clearAll: () => void;
}

export const useCommitmentStore = create<CommitmentStore>((set, get) => ({
    // Initial state
    commitmentData: null,
    encodedData: '',
    error: '',
    copySuccess: false,

    // Encode commitment data (ONLY way to set commitmentData)
    encodeData: (data: CommitmentData) => {
        try {
            const encoded = encodeCommitmentData(data);
            set({
                commitmentData: data,
                encodedData: encoded,
                error: '',
                copySuccess: false
            });
            return encoded;
        } catch (err: any) {
            const errorMsg = `Erro ao encodar dados: ${err.message}`;
            set({ error: errorMsg });
            throw new Error(errorMsg);
        }
    },

    // Decode commitment data
    decodeData: (encoded: string) => {
        try {
            const decoded = decodeCommitmentData(encoded);
            set({
                commitmentData: decoded,
                encodedData: encoded,
                error: '',
                copySuccess: false
            });
            return decoded;
        } catch (err: any) {
            const errorMsg = `Erro ao decodar dados: ${err.message}`;
            set({ error: errorMsg, commitmentData: null });
            throw new Error(errorMsg);
        }
    },

    // Copy to clipboard with auto-reset
    copyToClipboard: async () => {
        const { encodedData } = get();
        if (!encodedData) {
            set({ error: 'Nenhum dado para copiar', copySuccess: false });
            return false;
        }

        try {
            await navigator.clipboard.writeText(encodedData);
            set({ copySuccess: true, error: '' });

            // Auto-reset after 2 seconds
            setTimeout(() => {
                set({ copySuccess: false });
            }, 2000);

            return true;
        } catch (err: any) {
            set({ error: `Erro ao copiar: ${err.message}`, copySuccess: false });
            return false;
        }
    },

    // Clear all
    clearAll: () => set({
        commitmentData: null,
        encodedData: '',
        error: '',
        copySuccess: false
    }),
}));
