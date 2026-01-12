import { useState, useCallback } from 'react';

const INDEXER_URL = process.env.VITE_PONDER_API_URL || "https://swirl-production-9f99.up.railway.app";

interface Commitment {
    leafIndex: number;
    commitment: string;
}

/**
 * Hook para buscar commitments do indexer GraphQL
 */
export function useIndexer() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Busca todos os commitments do índice 0 até maxLeafIndex
     */
    const fetchCommitments = useCallback(async (maxLeafIndex: number): Promise<Commitment[]> => {
        setLoading(true);
        setError(null);

        if (!INDEXER_URL) {
            const errorMsg = 'Indexer URL is not defined';
            setError(errorMsg);
            console.error(errorMsg);
            setLoading(false);
            return [];
        }

        try {
            const query = `
                query GetCommitments($maxLeafIndex: Int!) {
                    depositEvents(
                        where: { leafIndex_lte: $maxLeafIndex }
                        orderBy: "leafIndex"
                        orderDirection: "asc"
                    ) {
                        items {
                            leafIndex
                            commitment
                        }
                    }
                }
            `;

            const response = await fetch(INDEXER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: { maxLeafIndex }
                })
            });
            console.log("response,", response)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("resspos", result)

            if (result.errors) {
                throw new Error(result.errors[0]?.message || 'GraphQL error');
            }

            // O caminho correto é depositEvents.items (não commitments)
            const commitments = result.data?.depositEvents?.items || [];

            console.log(`✅ Fetched ${commitments.length} commitments from indexer (0 to ${maxLeafIndex})`);

            return commitments;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            console.error('Error fetching commitments from indexer:', errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Busca um commitment específico pelo leafIndex
     */
    const fetchCommitmentByIndex = useCallback(async (leafIndex: number): Promise<Commitment | null> => {
        setLoading(true);
        setError(null);

        if (!INDEXER_URL) {
            const errorMsg = 'Indexer URL is not defined';
            setError(errorMsg);
            console.error(errorMsg);
            setLoading(false);
            return null;
        }

        try {
            const query = `
                query GetCommitmentByIndex($leafIndex: Int!) {
                    commitments(where: { leafIndex: $leafIndex }) {
                        leafIndex
                        commitment
                    }
                }
            `;

            const response = await fetch(INDEXER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables: { leafIndex }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors[0]?.message || 'GraphQL error');
            }

            const commitments = result.data?.commitments || [];
            return commitments.length > 0 ? commitments[0] : null;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            console.error('Error fetching commitment by index:', errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        fetchCommitments,
        fetchCommitmentByIndex
    };
}
