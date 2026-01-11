import { useState } from "react";
import { useCommitmentStore } from "../stores/commitmentStore";
import { compute33 } from "../scripts/compute33.mjs";

export const WithdrawButton = () => {
    const { commitmentData, decodeData, error } = useCommitmentStore();
    const [encodedInput, setEncodedInput] = useState("");
    const [isDecoding, setIsDecoding] = useState(false);

    const handleDecode = () => {
        if (!encodedInput.trim()) return;

        try {
            setIsDecoding(true);
            decodeData(encodedInput);
        } catch (err) {
            console.error("Erro ao decodificar:", err);
        } finally {
            setIsDecoding(false);
        }
    };

    const handleWithdraw = () => {
        if (!commitmentData) {
            alert("Por favor, cole e decodifique seu código primeiro!");
            return;
        }

        // TODO: Use commitmentData.leafIndex para gerar merkle proof
        console.log("Dados para withdraw:", {
            secret: commitmentData.secret.toString(),
            nullifier: commitmentData.nullifier.toString(),
            leafIndex: commitmentData.leafIndex
        });

        compute33();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', maxWidth: '600px' }}>
            <h3 style={{ margin: 0 }}>Withdraw</h3>

            {/* Input para código encodado */}
            <div>
                <label
                    style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                    }}
                >
                    Cole seu código de deposit:
                </label>
                <textarea
                    value={encodedInput}
                    onChange={(e) => setEncodedInput(e.target.value)}
                    placeholder="Cole aqui o código que você guardou após o deposit..."
                    style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '0.75rem',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        resize: 'vertical'
                    }}
                />
            </div>

            {/* Botão decodificar */}
            <button
                onClick={handleDecode}
                disabled={!encodedInput.trim() || isDecoding}
                style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: !encodedInput.trim() || isDecoding ? 'not-allowed' : 'pointer',
                    opacity: !encodedInput.trim() || isDecoding ? 0.5 : 1
                }}
            >
                {isDecoding ? 'Decodificando...' : 'Decodificar Código'}
            </button>

            {/* Erro */}
            {error && (
                <div
                    style={{
                        padding: '0.75rem',
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '0.5rem',
                        color: '#c00',
                        fontSize: '0.875rem'
                    }}
                >
                    {error}
                </div>
            )}

            {/* Dados decodados */}
            {commitmentData && (
                <div
                    style={{
                        padding: '1rem',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '0.5rem'
                    }}
                >
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#1e40af' }}>
                        Dados Decodados:
                    </h4>
                    <div
                        style={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            wordBreak: 'break-all'
                        }}
                    >
                        <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Secret:</strong> {commitmentData.secret.toString()}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Nullifier:</strong> {commitmentData.nullifier.toString()}
                        </div>
                        <div>
                            <strong>Leaf Index:</strong> {commitmentData.leafIndex}
                        </div>
                    </div>
                </div>
            )}

            {/* Botão withdraw */}
            {commitmentData && (
                <button
                    onClick={handleWithdraw}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Fazer Withdraw
                </button>
            )}
        </div>
    );
};