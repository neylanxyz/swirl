import { buildPoseidon } from "circomlibjs";
import { decodeCommitmentData } from "../stores/commitmentStore.ts";

// ================================
// CONFIG
// ================================
const TREE_DEPTH = 20;

// ================================
// Field helpers
// ================================
function fieldToString(poseidon, x) {
    // Ensure x is a field element
    return poseidon.F.toString(poseidon.F.e(x));
}

function fieldToBytes32(poseidon, x) {
    const v = BigInt(poseidon.F.toObject(poseidon.F.e(x)));
    return "0x" + v.toString(16).padStart(64, "0");
}

function bytes32ToBigInt(x) {
    if (typeof x === "bigint") return x;
    if (typeof x === "string" && x.startsWith("0x")) return BigInt(x);
    throw new Error("invalid bytes32");
}

const bytesToBigInt = (bytes) => {
    let hex = "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
    return BigInt(hex);
};
// ================================
// Build zero nodes
// ================================
function buildZeroes(poseidon, depth) {
    const zeroes = [];
    zeroes[0] = poseidon([0n, 0n]);
    for (let i = 1; i < depth; i++) {
        zeroes[i] = poseidon([zeroes[i - 1], zeroes[i - 1]]);
    }
    return zeroes;
}

// ================================
// Merkle tree insertion
// ================================
function insertLeaf(poseidon, leaf, leafIndex, zeros, filledSubtrees) {
    let currentHash = leaf;
    let index = leafIndex;

    const merklePath = [];
    const merkleIndices = [];

    for (let i = 0; i < TREE_DEPTH; i++) {
        const isRightNode = index % 2 === 1;
        let sibling;

        if (!isRightNode) {
            sibling = zeros[i];
            filledSubtrees[i] = currentHash;
            currentHash = poseidon([currentHash, sibling]);
        } else {
            sibling = filledSubtrees[i];
            currentHash = poseidon([sibling, currentHash]);
        }

        merklePath.push(sibling);
        merkleIndices.push(index % 2);
        index = Math.floor(index / 2);
    }

    const root = currentHash;
    return { root, merklePath, merkleIndices };
}

// ================================
// Main - Gera proof inputs a partir de commitments e encodedData
// ================================
/**
 * Gera todos os inputs necessários para criar uma proof ZK
 * @param {string[]} commitments - Array de commitments (hex strings) do indexer, ordenados por leafIndex (0 até N)
 * @param {string} encodedData - Código base64 com secret, nullifier e leafIndex do usuário
 * @returns {Object} Objeto com todos os dados formatados para usar no Proof.tsx
 */
export async function compute(commitments, encodedData) {
    const poseidon = await buildPoseidon();

    // ===== 1. Decodificar dados do usuário =====
    console.log("\n===== Decodificando dados do usuário =====");
    const { secret, nullifier, leafIndex } = decodeCommitmentData(encodedData);
    console.log(`✓ leafIndex: ${leafIndex}`);
    console.log(`✓ Secret e Nullifier decodificados`);

    // ===== 2. Validações =====
    if (!commitments || commitments.length === 0) {
        throw new Error("❌ Array de commitments está vazio");
    }

    if (leafIndex >= commitments.length) {
        throw new Error(
            `❌ leafIndex ${leafIndex} inválido. Indexer retornou apenas ${commitments.length} commitments (índices 0-${commitments.length - 1})`
        );
    }

    console.log(`✓ Total de commitments na árvore: ${commitments.length}`);

    // ===== 3. Calcular commitment do usuário e validar =====
    console.log("\n===== Validando commitment do usuário =====");
    const userCommitment = poseidon([secret, nullifier]);
    const userCommitmentHex = fieldToBytes32(poseidon, userCommitment);

    console.log(`Calculado: ${userCommitmentHex}`);
    console.log(`No indexer (leafIndex ${leafIndex}): ${commitments[leafIndex]}`);

    if (userCommitmentHex.toLowerCase() !== commitments[leafIndex].toLowerCase()) {
        throw new Error(
            `❌ Commitment não encontrado no leafIndex ${leafIndex}!\n` +
            `Esperado: ${commitments[leafIndex]}\n` +
            `Calculado: ${userCommitmentHex}\n` +
            `Seu código encodado pode estar incorreto ou os dados do indexer estão desatualizados.`
        );
    }

    console.log("✓ Commitment validado com sucesso!");

    // ===== 4. Construir árvore Merkle =====
    console.log("\n===== Construindo árvore Merkle =====");
    const zeroes = buildZeroes(poseidon, TREE_DEPTH);
    const filledSubtrees = [...zeroes];

    // Inserir todos os commitments até o leafIndex do usuário
    let finalRoot, finalMerklePath, finalMerkleIndices;

    for (let i = 0; i <= leafIndex; i++) {
        const commitmentBigInt = bytes32ToBigInt(commitments[i]);
        const { root, merklePath, merkleIndices } = insertLeaf(
            poseidon,
            commitmentBigInt,
            i,
            zeroes,
            filledSubtrees
        );

        // Guardar os dados do leafIndex do usuário
        if (i === leafIndex) {
            finalRoot = root;
            finalMerklePath = merklePath;
            finalMerkleIndices = merkleIndices;
        }
    }

    console.log(`✓ Árvore construída com ${leafIndex + 1} commitments`);
    console.log(`✓ Merkle path gerado para leafIndex ${leafIndex}`);

    // ===== 5. Calcular nullifier hash =====
    const nullifier_hash = poseidon([nullifier, 0n]);

    // ===== 6. Formatar e retornar dados para proof =====
    const proofInputs = {
        secret: fieldToString(poseidon, secret),
        nullifier: fieldToString(poseidon, nullifier),
        nullifier_hash: fieldToString(poseidon, nullifier_hash),
        nullifier_hash_bytes32: fieldToBytes32(poseidon, nullifier_hash),
        merkle_path: finalMerklePath.map(v => fieldToString(poseidon, v)),
        merkle_indices: finalMerkleIndices,
        root: fieldToString(poseidon, finalRoot),
        root_bytes32: fieldToBytes32(poseidon, finalRoot),
        leafIndex: leafIndex
    };

    console.log("\n===== ✓ Proof Inputs Gerados =====");
    console.log(`leafIndex: ${proofInputs.leafIndex}`);
    console.log(`root: ${proofInputs.root}`);
    console.log(`nullifier_hash: ${proofInputs.nullifier_hash}`);
    console.log(`merkle_path length: ${proofInputs.merkle_path.length}`);
    console.log(`merkle_indices length: ${proofInputs.merkle_indices.length}`);
    console.log("====================================\n");

    return proofInputs;
}