import { useState } from "react";
import { useCommitmentStore } from "../stores/commitmentStore";
import { useIndexer } from "../hooks/useIndexer";
import { useSwirlPool } from "../hooks/useSwirlPool";
import { compute33 } from "../scripts/compute33.mjs";
import { generateProof } from "../helpers/generateProof";
import { useAccount } from "wagmi";

export const WithdrawButton = () => {
    const { commitmentData, decodeData, error } = useCommitmentStore();
    const { fetchCommitments, loading: indexerLoading } = useIndexer();
    const { withdraw } = useSwirlPool();
    const { address } = useAccount();
    const [encodedInput, setEncodedInput] = useState("");
    const [isDecoding, setIsDecoding] = useState(false);
    const [isGeneratingProof, setIsGeneratingProof] = useState(false);
    const [proofInputs, setProofInputs] = useState<any>(null);
    const [generatedProof, setGeneratedProof] = useState<any>(null);
    const [status, setStatus] = useState("");

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

    const handleWithdraw = async () => {
        if (!commitmentData || !encodedInput) {
            alert("Por favor, cole e decodifique seu código primeiro!");
            return;
        }

        try {
            setIsGeneratingProof(true);
            setStatus("");
            setProofInputs(null);

            // 1. Buscar commitments do indexer (0 até leafIndex)
            setStatus(`Buscando commitments do indexer (0 até ${commitmentData.leafIndex})...`);
            console.log(`\n🔍 Buscando commitments do leafIndex 0 até ${commitmentData.leafIndex}...`);

            const deposits = await fetchCommitments(commitmentData.leafIndex);

            if (!deposits || deposits.length === 0) {
                throw new Error("Nenhum commitment encontrado no indexer");
            }

            // Validar ordem dos commitments
            for (let i = 0; i < deposits.length; i++) {
                if (deposits[i].leafIndex !== i) {
                    throw new Error(`Commitments fora de ordem! Esperado leafIndex ${i}, recebido ${deposits[i].leafIndex}`);
                }
            }

            console.log(`✅ Encontrados ${deposits.length} commitments`);

            // 2. Converter para array de commitment strings
            const commitments = deposits.map(d => d.commitment);

            // 3. Gerar proof inputs com compute33
            setStatus("Construindo árvore Merkle e gerando proof inputs...");
            console.log("\n🌳 Gerando proof inputs...");

            // @ts-ignore - compute33.mjs exporta função com 2 parâmetros
            const inputs = await compute33(commitments, encodedInput);

            console.log("✅ Proof inputs gerados com sucesso!");
            setProofInputs(inputs);

            // 4. Gerar proof ZK
            setStatus("⚡ Gerando proof ZK... (isso pode levar alguns segundos)");
            console.log("\n⚡ Gerando proof ZK...");

            // @ts-ignore - inputs tem os campos necessários
            const proof = await generateProof(inputs);

            console.log("✅ Proof ZK gerada com sucesso!");
            setGeneratedProof(proof);

            // 5. Chamar withdraw no contrato
            setStatus("📤 Enviando transação de withdraw para o contrato...");
            console.log("\n📤 Chamando withdraw no contrato...");

            if (!address) {
                throw new Error("Conecte sua wallet primeiro!");
            }

            // @ts-ignore - tipos corretos em runtime
            await withdraw(
                proof.proof as `0x${string}`,
                // @ts-ignore
                inputs.root_bytes32 as `0x${string}`,
                // @ts-ignore
                inputs.nullifier_hash_bytes32 as `0x${string}`,
                address
            );

            console.log("✅ Transação de withdraw enviada!");
            setStatus("✅ Withdraw realizado com sucesso! Aguardando confirmação na blockchain...");
            alert("🎉 Withdraw enviado com sucesso! Aguarde a confirmação.");

        } catch (err: any) {
            console.error("❌ Erro ao gerar proof:", err);
            setStatus(`❌ Erro: ${err.message || "Erro desconhecido"}`);
            alert(`Erro: ${err.message || "Erro desconhecido"}`);
        } finally {
            setIsGeneratingProof(false);
        }
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

            {/* Status */}
            {status && (
                <div
                    style={{
                        padding: '0.75rem',
                        backgroundColor: status.includes('❌') ? '#fee' : status.includes('✅') ? '#efe' : '#f0f9ff',
                        border: `1px solid ${status.includes('❌') ? '#fcc' : status.includes('✅') ? '#cfc' : '#bfdbfe'}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {status}
                </div>
            )}

            {/* Botão withdraw */}
            {(
                <button
                    onClick={handleWithdraw}
                    disabled={isGeneratingProof || indexerLoading}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: isGeneratingProof || indexerLoading ? 'not-allowed' : 'pointer',
                        opacity: isGeneratingProof || indexerLoading ? 0.5 : 1
                    }}
                >
                    {isGeneratingProof ? 'Gerando Proof Inputs...' : 'Gerar Proof Inputs'}
                </button>
            )}

            {/* Proof Inputs Gerados */}
            {proofInputs && !generatedProof && (
                <div
                    style={{
                        padding: '1rem',
                        backgroundColor: '#f0fdf4',
                        border: '2px solid #86efac',
                        borderRadius: '0.5rem'
                    }}
                >
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#166534' }}>
                        ✅ Proof Inputs Gerados!
                    </h4>
                    <div
                        style={{
                            fontFamily: 'monospace',
                            fontSize: '0.7rem',
                            wordBreak: 'break-all',
                            maxHeight: '200px',
                            overflow: 'auto'
                        }}
                    >
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(proofInputs, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* Proof ZK Gerada */}
            {generatedProof && (
                <div
                    style={{
                        padding: '1rem',
                        backgroundColor: '#eff6ff',
                        border: '2px solid #60a5fa',
                        borderRadius: '0.5rem'
                    }}
                >
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#1e40af' }}>
                        🎉 Proof ZK Gerada e Withdraw Enviado!
                    </h4>
                    <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                            <strong>Proof:</strong> <code style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>{generatedProof.proof}</code>
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0' }}>
                            <strong>Status:</strong> Transação enviada! Aguardando confirmação na blockchain...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};