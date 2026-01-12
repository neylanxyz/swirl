import { buildPoseidon, type Poseidon } from "circomlibjs";

// ================================
// CONFIG
// ================================
const TREE_DEPTH = 20;

function fieldToBytes32(poseidon: Poseidon, x: Uint8Array<ArrayBufferLike>) {
    const v = BigInt(poseidon.F.toObject(x));
    return "0x" + v.toString(16).padStart(64, "0");
}

//TODO: Fix type n
function fieldToDecimal(poseidon: Poseidon, x: any) {
    // x can be:
    // - a BigInt already => just return string
    // - a Poseidon Fp element => convert using F.toObject
    if (typeof x === "bigint") return x.toString();
    if (poseidon && poseidon.F && typeof poseidon.F.toObject === "function") {
        return poseidon.F.toObject(x).toString();
    }
    throw new Error("Cannot convert to decimal: " + x);
}

function bytes32ToBigInt(b: string | number | bigint | boolean) {
    if (typeof b === "string" && b.startsWith("0x")) {
        return BigInt(b);
    } else if (typeof b === "bigint") {
        return b;
    } else {
        throw new Error("Invalid type for bytes32ToBigInt: " + b);
    }
}

// ================================
// Build zero nodes (Poseidon hash of 0)
// ================================

function buildZeroes(poseidon: Poseidon, depth: number) {
    const zeroes = [];
    zeroes[0] = poseidon([0n, 0n]);
    for (let i = 1; i < depth; i++) {
        zeroes[i] = poseidon([zeroes[i - 1], zeroes[i - 1]]);
    }
    return zeroes;
}

// ================================
// Build Merkle path for a single leaf
// ================================

function buildMerklePath(poseidon: Poseidon, leaf: Uint8Array<ArrayBufferLike>, leafIndex: bigint, zeros: any[], filledSubtrees: bigint[]) {
    let currentHash = leaf;
    let index = leafIndex;

    const merklePath = [];
    const merkleIndices = [];

    for (let i = 0; i < TREE_DEPTH; i++) {
        const sibling = index % 2n === 0n ? zeros[i] : filledSubtrees[i];
        merklePath.push(sibling);
        merkleIndices.push(index % 2n);

        // compute currentHash for next level
        currentHash = index % 2n === 0n
            ? poseidon([currentHash, sibling])
            : poseidon([sibling, currentHash]);

        index = index / 2n;
    }

    return { root: currentHash, merklePath, merkleIndices };
}

// ================================
// Format deposit info to exact output format
// ================================
function formatDepositInfo(depositInfo: {
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

export async function compute(secret: bigint, nullifier: bigint, leafIndex: bigint, currentRoot: `0x${string}` | undefined, rawSubtree: readonly `0x${string}`[] | undefined) {
    const poseidon = await buildPoseidon();
    // const { currentRoot, getAllFilledSubtrees: rawSubtree } = useSwirlPool();
    if (!rawSubtree) return;
    const filledSubtrees = rawSubtree.map(bytes32ToBigInt);

    // === Step 3: compute commitment ===
    const commitment = poseidon([secret, nullifier]);

    // === Step 4: compute nullifier hash ===
    const nullifierHash = poseidon([nullifier, 0n]);

    // === Step 5: build zeros ===
    const zeros = buildZeroes(poseidon, TREE_DEPTH);

    // === Step 6: build Merkle path ===
    const { root, merklePath, merkleIndices } = buildMerklePath(
        poseidon,
        commitment,
        leafIndex,
        zeros,
        filledSubtrees
    );

    // === Step 7: output info for ZK proof ===
    const depositInfo = {
        secret: secret.toString(),
        nullifier: nullifier.toString(),
        commitment: fieldToDecimal(poseidon, commitment),
        nullifier_hash: fieldToDecimal(poseidon, nullifierHash),
        nullifier_hash_bytes32: fieldToBytes32(poseidon, nullifierHash),
        leafIndex: leafIndex.toString(),
        currentRoot: currentRoot,
        "root (computed)": fieldToDecimal(poseidon, root),
        "root (bytes32)": fieldToBytes32(poseidon, root),
        merkle_path: merklePath.map(v => fieldToDecimal(poseidon, v)),
        merkle_indices: merkleIndices,
    };

    console.log(formatDepositInfo(depositInfo));
}
