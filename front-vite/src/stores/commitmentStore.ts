import { create } from 'zustand';

interface CommitmentData {
    secret: bigint;
    nullifier: bigint;
    commitment: string;
}

interface CommitmentStore {
    commitmentData: CommitmentData | null;
    setCommitmentData: (data: CommitmentData) => void;
    clearCommitmentData: () => void;
}

export const useCommitmentStore = create<CommitmentStore>((set) => ({
    commitmentData: null,
    setCommitmentData: (data) => set({ commitmentData: data }),
    clearCommitmentData: () => set({ commitmentData: null }),
}));
