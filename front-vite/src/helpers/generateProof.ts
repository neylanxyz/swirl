import { Barretenberg, UltraHonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";
import type { CompiledCircuit } from "@noir-lang/noir_js";
import initNoirC from "@noir-lang/noirc_abi";
import initACVM from "@noir-lang/acvm_js";
import acvm from "@noir-lang/acvm_js/web/acvm_js_bg.wasm?url";
import noirc from "@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url";
import circuitData from "../../../circuits/swirlpool/target/swirl.json";
import { toHex } from "viem";

interface ProofInputs {
    secret: string;
    nullifier: string;
    nullifier_hash: string;
    merkle_path: string[];
    merkle_indices: number[];
    root: string;
    root_bytes32: string;
    nullifier_hash_bytes32: string;
    leafIndex: number;
}

interface GeneratedProof {
    proof: `0x${string}`;
    publicInputs: string[];
}

let wasmInitialized = false;

/**
 * Inicializa módulos WASM (Noir e ACVM)
 * Só precisa ser chamado uma vez
 */
export async function initializeWasm() {
    if (wasmInitialized) {
        console.log("✓ WASM já inicializado");
        return;
    }

    console.log("Inicializando módulos WASM...");
    await Promise.all([
        initACVM(fetch(acvm)),
        initNoirC(fetch(noirc))
    ]).then((e) => console.log("e", e)).catch((e) => { console.log("error ", e) });
    wasmInitialized = true;
    console.log("✓ WASM inicializado com sucesso");
}

/**
 * Gera uma proof ZK a partir dos inputs do compute
 * @param proofInputs - Dados retornados pelo compute
 * @returns Proof formatada para enviar ao contrato
 */
export async function generateProof(proofInputs: ProofInputs): Promise<GeneratedProof> {
    console.log("\n===== Gerando Proof ZK =====");

    // 1. Garantir que WASM está inicializado
    await initializeWasm();

    // 2. Preparar inputs para o circuito
    const input = {
        secret: proofInputs.secret,
        nullifier: proofInputs.nullifier,
        nullifier_hash: proofInputs.nullifier_hash,
        root: proofInputs.root,
        merkle_path: proofInputs.merkle_path,
        merkle_indices: proofInputs.merkle_indices
    };

    console.log("Input preparado para o circuito:");
    console.log(`- secret: ${input.secret}`);
    console.log(`- nullifier: ${input.nullifier}`);
    console.log(`- root: ${input.root}`);
    console.log(`- merkle_path length: ${input.merkle_path.length}`);
    console.log(`- merkle_indices length: ${input.merkle_indices.length}`);

    // 3. Inicializar Noir
    console.log("\nInicializando Noir...");
    const circuit = circuitData as CompiledCircuit;
    const noir = new Noir(circuit);

    // 4. Inicializar Barretenberg
    console.log("Inicializando Barretenberg...");
    await Barretenberg.new({ threads: navigator.hardwareConcurrency || 1 });

    // 5. Inicializar backend
    console.log("Inicializando backend UltraHonk...");
    const backend = new UltraHonkBackend(circuit.bytecode);

    // 6. Gerar witness
    console.log("\nGerando witness...");
    const { witness } = await noir.execute(input);
    console.log("✓ Witness gerado");

    // 7. Gerar proof
    console.log("\nGerando proof ZK...");
    const proof = await backend.generateProof(witness, { keccakZK: true });

    // 8. Verificar proof localmente
    console.log("\nVerificando proof localmente...");
    const isValid = await backend.verifyProof(proof, { keccakZK: true });
    console.log(`✓ Proof é ${isValid ? "VÁLIDA" : "INVÁLIDA"}`);

    if (!isValid) {
        throw new Error("❌ Proof gerada é inválida!");
    }

    // 9. Formatar proof para o contrato
    const formattedProof = {
        proof: toHex(proof.proof),
        publicInputs: proof.publicInputs
    };

    console.log("\n===== Proof ZK Gerada com Sucesso =====");
    console.log(`Proof size: ${formattedProof.proof.length} bytes`);
    console.log(`Public inputs: ${formattedProof.publicInputs.length}`);
    console.log("=========================================\n");

    return formattedProof;
}

// ================================
// Format deposit info to exact output format
// ================================
export function formatDepositInfo(depositInfo: {
    secret: string;
    nullifier: string;
    commitment: string;
    nullifier_hash: string;
    nullifier_hash_bytes32: string;
    leafIndex: string;
    currentRoot: string | undefined;
    "root (computed)": string;
    "root (bytes32)": string;
    merkle_path: string[];
    merkle_indices: bigint[];
}): string {
    let output = '';

    output += `secret= "${depositInfo.secret}"\n`;
    output += `nullifier= "${depositInfo.nullifier}"\n`;
    output += `commitment= "${depositInfo.commitment}"\n`;
    output += `nullifier_hash= "${depositInfo.nullifier_hash}"\n`;
    output += `nullifier_hash_bytes32= "${depositInfo.nullifier_hash_bytes32}"\n`;
    output += `leafIndex= "${depositInfo.leafIndex}"\n`;
    output += `currentRoot= "${depositInfo.currentRoot || ''}"\n`;
    output += `root= "${depositInfo["root (computed)"]}"\n`;
    output += `rootbytes32= "${depositInfo["root (bytes32)"]}"\n`;

    output += `merkle_path= [\n`;
    depositInfo.merkle_path.forEach(v => {
        output += `  "${v}",\n`;
    });
    output += `]\n`;

    output += `merkle_indices= [\n`;
    depositInfo.merkle_indices.forEach(i => {
        output += `  "${i.toString()}",\n`;
    });
    output += `]`;

    return output;
}