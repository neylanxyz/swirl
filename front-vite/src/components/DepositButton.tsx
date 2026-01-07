import { useState, useEffect } from 'react';
import { useSwirlPool } from '../hooks/useSwirlPool';
import { getPoseidon, randField, toBytes32 } from '../helpers/zk';
import { stringToBytes, bytesToHex } from 'viem';
import { useCommitmentStore } from '../stores/commitmentStore';

export function DepositButton() {
    const { deposit, isDepositing, isConfirming, isConfirmed, depositError, isConnected } = useSwirlPool();
    const [status, setStatus] = useState<string>('');
    const { commitmentData, setCommitmentData } = useCommitmentStore();

    const handleDeposit = async () => {
        if (!isConnected) {
            setStatus('Please connect your wallet first');
            return;
        }

        try {
            setStatus('Generating commitment...');

            // Generate ZK commitment
            const poseidon = await getPoseidon();
            const secret = randField(); // BigInt
            const nullifier = randField(); // BigInt
            const commitment = poseidon([secret, nullifier]); // BigInt
            const commitmentBytes32 = toBytes32(poseidon.F.toObject(commitment)) as `0x${string}`;

            // Store commitment data for display
            setCommitmentData({
                secret,
                nullifier,
                commitment: commitmentBytes32,
            });

            // Create encrypted note (dummy for now) - convert to hex for viem
            const encryptedNoteBytes = stringToBytes('dummy note');
            const encryptedNote = bytesToHex(encryptedNoteBytes);

            setStatus('Sending transaction...');

            // Call deposit function
            await deposit(commitmentBytes32, encryptedNote);

            setStatus('Transaction sent! Waiting for confirmation...');
        } catch (err) {
            console.error('Deposit error:', err);
            setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    // Update status based on transaction state
    useEffect(() => {
        if (isConfirming) {
            setStatus('Transaction confirmed!');
        }
    }, [isConfirming]);

    useEffect(() => {
        if (isConfirmed) {
            setStatus('Deposit successful!');
        }
    }, [isConfirmed]);

    useEffect(() => {
        if (depositError) {
            setStatus(`Error: ${depositError.message}`);
        }
    }, [depositError]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
            <button
                onClick={handleDeposit}
                disabled={isDepositing || isConfirming || !isConnected}
                style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    // backgroundColor: isDepositing || isConfirming ? '#ccc' : '#007bff',
                    // color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: isDepositing || isConfirming || !isConnected ? 'not-allowed' : 'pointer',
                }}
            >
                {isDepositing ? 'Depositing...' : isConfirming ? 'Confirming...' : 'Deposit to Pool'}
            </button>

            {status && (
                <div
                    style={{
                        padding: '0.75rem',
                        // backgroundColor: status.includes('Error') ? '#fee' : '#efe',
                        border: `1px solid ${status.includes('Error') ? '#fcc' : '#cfc'}`,
                        borderRadius: '0.5rem',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                    }}
                >
                    {status}
                </div>
            )}

            {commitmentData && (
                <div
                    style={{
                        padding: '0.75rem',
                        // backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        overflow: 'auto',
                    }}
                >
                    <div><strong>Secret:</strong> {commitmentData.secret.toString()}</div>
                    <div><strong>Nullifier:</strong> {commitmentData.nullifier.toString()}</div>
                    <div><strong>Commitment:</strong> {commitmentData.commitment}</div>
                </div>
            )}
        </div>
    );
}
