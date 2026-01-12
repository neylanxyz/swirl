"use client";

import { useState, useEffect } from "react";
import { Barretenberg, UltraHonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import type { CompiledCircuit } from "@noir-lang/noir_js";
import initNoirC from "@noir-lang/noirc_abi";
import initACVM from "@noir-lang/acvm_js";
import acvm from "@noir-lang/acvm_js/web/acvm_js_bg.wasm?url";
import noirc from "@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url";
import circuitData from "../../../circuits/swirlpool/build/program.json";
import { useReadContract } from "wagmi";
import { toHex } from "viem";

export default function ProofComponent() {
    const [secret, setSecret] = useState("233059915283501120245914147287482709492674151675748512632742081224693189698");
    const [nullifier, setNullifier] = useState("66052917457433030267338072579808797017720814188022824331373777771187555167");
    const [nullifierHash, setNullifierHash] = useState("5090999298501428903568174885822910196436209423450142532698639722508698947986");
    const [root, setRoot] = useState("4142377687233293613315720496008586516649299330675084560754282781441333341827");
    const [merklePath, setMerklePath] = useState("");
    const [merkleIndices, setMerkleIndices] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [proofResult, setProofResult] = useState<{ proof: string, publicInputs: any } | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const TEST_CONTRACT_ADDRESS = "0xa1fcC0Ac35C469924aB9DB667802f479398aE6c6"
    const ABI_TEST_CONTRACT = [
        {
            "inputs": [],
            "name": "ProofLengthWrong",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "PublicInputsLengthWrong",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "ShpleminiFailed",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "SumcheckFailed",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes",
                    "name": "proof",
                    "type": "bytes"
                },
                {
                    "internalType": "bytes32[]",
                    "name": "publicInputs",
                    "type": "bytes32[]"
                }
            ],
            "name": "verify",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    // Hook deve estar no nível superior - vai re-executar quando proofResult mudar
    const { data: verify, isLoading: isLoadingVerify, error, status, fetchStatus } = useReadContract({
        address: TEST_CONTRACT_ADDRESS,
        abi: ABI_TEST_CONTRACT,
        functionName: 'verify',
        args: proofResult ? [proofResult.proof, proofResult.publicInputs] : undefined,
        query: {
            enabled: !!proofResult, // Só chama quando tiver proofResult
        }
    });

    console.log("=== DEBUG USEREADCONTRACT ===")
    console.log("proofResult existe?", !!proofResult)
    console.log("status:", status)
    console.log("fetchStatus:", fetchStatus)
    console.log("isLoading:", isLoadingVerify)
    console.log("verify:", verify)
    console.log("error:", error)
    if (proofResult) {
        console.log("proof (hex):", proofResult.proof)
        console.log("publicInputs:", proofResult.publicInputs)
    }
    console.log("=== FIM DEBUG ===")

    // Inicializar módulos WASM uma vez quando o componente montar
    useEffect(() => {
        const initializeWasm = async () => {
            try {
                setIsInitializing(true);
                await Promise.all([
                    initACVM(fetch(acvm)),
                    initNoirC(fetch(noirc))
                ]);
                setIsInitializing(false);
            } catch (error: any) {
                console.error("Erro ao inicializar WASM:", error);
                setErrorMsg(`Erro ao inicializar WASM: ${error.message || "Erro desconhecido"}`);
                setIsInitializing(false);
            }
        };
        initializeWasm();
    }, []);

    // UseEffect apenas para logar o resultado da verificação
    useEffect(() => {
        if (verify !== undefined && proofResult) {
            console.log("verify", verify)
        }
    }, [verify, proofResult])

    // Helper para parsear arrays do formato TOML (aceita colchetes, aspas, quebras de linha, etc)
    const parseTomlArray = (input: string, removeQuotes = false): string[] => {
        return input
            .replace(/[\[\]]/g, "") // Remove colchetes
            .split(/[,\n]/) // Separa por vírgula ou quebra de linha
            .map(s => {
                let cleaned = s.trim();
                if (removeQuotes) {
                    cleaned = cleaned.replace(/^["']|["']$/g, ""); // Remove aspas
                }
                return cleaned;
            })
            .filter(s => s !== "" && s !== "]" && s !== "[");
    };

    const handleGenerateProof = async () => {
        if (isInitializing) {
            setErrorMsg("Aguardando inicialização dos módulos WASM...");
            return;
        }

        setIsLoading(true);
        setProofResult(null);
        setErrorMsg("");

        try {
            // Carregue o circuito Noir compilado (JSON)
            console.log("Carregando circuit...");

            // Parse arrays do formato TOML
            const merklePathArray = parseTomlArray(merklePath, true);
            const merkleIndicesArray = parseTomlArray(merkleIndices, false)
                .map(s => parseInt(s, 10))
                .filter(n => !isNaN(n));

            // Inputs para o circuito
            const input = {
                secret: secret,
                nullifier: nullifier,
                nullifier_hash: nullifierHash,
                root: root,
                merkle_path: merklePathArray,
                merkle_indices: merkleIndicesArray
            };
            console.log("Input:", input);

            // Inicialize Noir (seguindo padrão oficial)
            console.log("Inicializando Noir...");
            const circuit = circuitData as CompiledCircuit;
            const noir = new Noir(circuit);

            console.log("Inicializando Barretenberg...");
            const api = await Barretenberg.new({ threads: navigator.hardwareConcurrency || 1 });

            console.log("Inicializando backend...", api);
            const backend = new UltraHonkBackend(circuit.bytecode);

            // Gere o witness
            console.log("Gerando witness...", backend);
            const { witness } = await noir.execute(input);
            console.log("Witness gerado:", witness);

            // Gere a proof 
            console.log("Gerando proof...", typeof witness);
            const proof = await backend.generateProof(witness, { keccakZK: true });
            console.log("Proof gerada:", typeof proof);
            console.log("prooof", proof)

            // Verificar a proof
            console.log("Verificando proof...");
            const isValid = await backend.verifyProof(proof, { keccakZK: true });
            console.log("proof = ", proof)
            console.log(`Proof é ${isValid ? "válida" : "inválida"}`);


            setProofResult({
                proof: toHex(proof.proof),
                publicInputs: proof.publicInputs,
            });
        } catch (error: any) {
            console.error("Erro completo:", error);
            setErrorMsg(`Erro: ${error.message || "Erro desconhecido"}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="secret"
                value={secret}
                onChange={e => setSecret(e.target.value)}
            />
            <input
                type="text"
                placeholder="nullifier"
                value={nullifier}
                onChange={e => setNullifier(e.target.value)}
            />
            <input
                type="text"
                placeholder="nullifier_hash"
                value={nullifierHash}
                onChange={e => setNullifierHash(e.target.value)}
            />
            <input
                type="text"
                placeholder="root"
                value={root}
                onChange={e => setRoot(e.target.value)}
            />
            <textarea
                placeholder="merkle_path (cole direto do Prover.toml com colchetes e aspas)"
                value={merklePath}
                onChange={e => setMerklePath(e.target.value)}
                rows={5}
            />
            <textarea
                placeholder="merkle_indices (cole direto do Prover.toml com colchetes)"
                value={merkleIndices}
                onChange={e => setMerkleIndices(e.target.value)}
                rows={5}
            />
            <button onClick={handleGenerateProof} disabled={isLoading || isInitializing} >
                {isInitializing ? "Inicializando..." : isLoading ? "Gerando..." : "Gerar Proof"}
            </button>
            {errorMsg && <div>{errorMsg} </div>}
            {
                proofResult && (
                    <pre>{JSON.stringify(proofResult, null, 2)} </pre>
                )
            }
        </div>
    );
}
