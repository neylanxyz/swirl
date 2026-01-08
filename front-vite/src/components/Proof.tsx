"use client";
import { useState } from "react";
import { Barretenberg, UltraHonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";

export default function ProofComponent() {
    const [secret, setSecret] = useState("221298477636339949057548167593224959821007762943954710158846228018887916899");
    const [nullifier, setNullifier] = useState("449923872617343972930614807539800076469236091160820040557567436683998548601");
    const [nullifierHash, setNullifierHash] = useState("4867713083140620832476915549029464798695675444814685227265708504592835451276");
    const [root, setRoot] = useState("21183323962847963401757235586527753430082850194744802344553123514502094281487");
    const [merklePath, setMerklePath] = useState("");
    const [merkleIndices, setMerkleIndices] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [proofResult, setProofResult] = useState<{ proof: string, publicInputs: any } | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

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
        setIsLoading(true);
        setProofResult(null);
        setErrorMsg("");

        try {
            // Carregue o circuito Noir compilado (JSON)
            console.log("Carregando circuit...");
            const circuit_json = await fetch("/program.json");
            if (!circuit_json.ok) {
                throw new Error(`Erro ao carregar program.json: ${circuit_json.status}`);
            }
            const circuit = await circuit_json.json();
            console.log("Circuit carregado:", circuit);

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
            const noir = new Noir(circuit);

            console.log("Inicializando Barretenberg...", noir);
            const api = await Barretenberg.new({ threads: navigator.hardwareConcurrency });

            console.log("Inicializando backend...", api);
            const backend = new UltraHonkBackend(circuit.bytecode, api);

            // Gere o witness
            console.log("Gerando witness...", backend);
            const { witness } = await noir.execute(input);
            console.log("Witness gerado:", witness);

            // Gere a proof 
            console.log("Gerando proof...");
            const proof = await backend.generateProof(witness);
            console.log("Proof gerada:", proof);

            setProofResult({
                proof: "0x" + Array.from(new Uint8Array(proof.proof)).map(b => b.toString(16).padStart(2, "0")).join(""),
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
            <button onClick={handleGenerateProof} disabled={isLoading} >
                {isLoading ? "Gerando..." : "Gerar Proof"}
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
