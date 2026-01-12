import { buildPoseidon, type Poseidon } from "circomlibjs";

// ================================
// CONFIG
// ================================
const TREE_DEPTH = 20;

// ================================
// Types
// ================================
type HashValue = Uint8Array<ArrayBufferLike>;
type HashInput = bigint | HashValue;
type CommitmentData = {
    leafIndex: number;
    commitment: string;
};

// ================================
// Field helpers
// ================================
function fieldToString(poseidon: Poseidon, x: HashInput): string {
    // Ensure x is a field element
    return poseidon.F.toString(poseidon.F.e(x));
}

function fieldToBytes32(poseidon: Poseidon, x: HashInput): string {
    const v = BigInt(poseidon.F.toObject(poseidon.F.e(x)));
    return "0x" + v.toString(16).padStart(64, "0");
}

function bytes32ToBigInt(x: string | number | bigint | boolean): bigint {
    if (typeof x === "bigint") return x;
    if (typeof x === "string" && x.startsWith("0x")) return BigInt(x);
    throw new Error("invalid bytes32");
}

// ================================
// Build zero nodes
// ================================
function buildZeroes(poseidon: Poseidon, depth: number): HashValue[] {
    const zeroes: HashValue[] = [];
    zeroes[0] = poseidon([0n, 0n]);
    for (let i = 1; i < depth; i++) {
        zeroes[i] = poseidon([zeroes[i - 1], zeroes[i - 1]]);
    }
    return zeroes;
}

// ================================
// Merkle tree insertion (modifies filledSubtrees)
// ================================
function insertLeaf(
    poseidon: Poseidon,
    leaf: HashInput,
    leafIndex: number,
    zeros: HashValue[],
    filledSubtrees: HashValue[]
): { root: HashValue; merklePath: HashValue[]; merkleIndices: number[] } {
    let currentHash: HashValue | HashInput = leaf;
    let index = leafIndex;

    const merklePath: HashValue[] = [];
    const merkleIndices: number[] = [];

    for (let i = 0; i < TREE_DEPTH; i++) {
        const isRightNode = index % 2 === 1;
        let sibling: HashValue;

        if (!isRightNode) {
            sibling = zeros[i];
            filledSubtrees[i] = currentHash as HashValue;
            currentHash = poseidon([currentHash, sibling]);
        } else {
            sibling = filledSubtrees[i];
            currentHash = poseidon([sibling, currentHash]);
        }

        merklePath.push(sibling);
        merkleIndices.push(index % 2);
        index = Math.floor(index / 2);
    }

    const root = currentHash as HashValue;
    return { root, merklePath, merkleIndices };
}

// ================================
// Calculate merkle path (read-only, doesn't modify filledSubtrees)
// ================================
function getMerklePath(
    poseidon: Poseidon,
    leaf: HashInput,
    leafIndex: number,
    zeros: HashValue[],
    filledSubtrees: HashValue[]
): { root: HashValue; merklePath: HashValue[]; merkleIndices: number[] } {
    let currentHash: HashValue | HashInput = leaf;
    let index = leafIndex;

    const merklePath: HashValue[] = [];
    const merkleIndices: number[] = [];

    for (let i = 0; i < TREE_DEPTH; i++) {
        const isRightNode = index % 2 === 1;
        let sibling: HashValue;

        if (!isRightNode) {
            sibling = zeros[i];
            currentHash = poseidon([currentHash, sibling]);
        } else {
            sibling = filledSubtrees[i];
            currentHash = poseidon([sibling, currentHash]);
        }

        merklePath.push(sibling);
        merkleIndices.push(index % 2);
        index = Math.floor(index / 2);
    }

    const root = currentHash as HashValue;
    return { root, merklePath, merkleIndices };
}

// ================================
// Main
// ================================
export async function compute2(secret: bigint, nullifier: bigint) {
    const poseidon = await buildPoseidon();

    // Step 1: Calculate commitment from secret and nullifier
    const commitment = poseidon([secret, nullifier]);
    const commitmentString = fieldToString(poseidon, commitment);
    const commitmentBytes32 = fieldToBytes32(poseidon, commitment);

    console.log("Calculated commitment from secret/nullifier:");
    console.log(`commitment = "${commitmentString}"`);
    console.log(`commitment_bytes32 = "${commitmentBytes32}"`);

    // ===== Public commitments from Solidity (bytes32)
    // MUST be sorted by leafIndex =====
    const commitments: CommitmentData[] = [
        {
            leafIndex: 0,
            commitment: "0x26beea66d782d7fd7fe816c234389182dee1ac1da72f8b721cce74c8dc25f529"
        },
        {
            leafIndex: 1,
            commitment: "0x293f667a8a96fb07040e7868ce173bf81d55f6dada7d5d6942aa148073a8ec6e"
        },
        {
            leafIndex: 2,
            commitment: "0x287fdf7fb7b6c367a30cbf4556915930013fb3d48fbdc05eb298bf0b9dbe771d"
        },
        {
            leafIndex: 3,
            commitment: "0x1a8dba3661d4edd571cd910c7aa5fe4696367f742b0380217353ffc83bcc0f59"
        },
        {
            leafIndex: 4,
            commitment: "0x173740bedb814ef54315521b5e798d70a7fb54eecf7e8e14765f488e5b1810c1"
        }
    ];

    // Step 2: Find which commitment matches (case-insensitive)
    const targetIndex = commitments.findIndex(c =>
        c.commitment.toLowerCase() === commitmentBytes32.toLowerCase()
    );

    if (targetIndex === -1) {
        console.error("ERROR: Commitment not found in tree!");
        console.error(`Looking for: ${commitmentBytes32}`);
        console.error("Available commitments:");
        commitments.forEach(c => console.error(`  [${c.leafIndex}] ${c.commitment}`));
        return;
    }

    console.log(`\nFound commitment at leafIndex: ${targetIndex}\n`);

    const zeroes = buildZeroes(poseidon, TREE_DEPTH);
    const filledSubtrees = [...zeroes];

    // Step 3: Build complete tree by inserting all commitments
    for (let i = 0; i < commitments.length; i++) {
        const commitmentBigInt = bytes32ToBigInt(commitments[i].commitment);
        const leafIndex = commitments[i].leafIndex;
        insertLeaf(poseidon, commitmentBigInt, leafIndex, zeroes, filledSubtrees);
    }

    // Step 4: Calculate merkle path for the target commitment with complete tree (read-only)
    const targetCommitmentBigInt = bytes32ToBigInt(commitments[targetIndex].commitment);
    const { root, merklePath, merkleIndices } = getMerklePath(
        poseidon,
        targetCommitmentBigInt,
        targetIndex,
        zeroes,
        filledSubtrees
    );

    const nullifier_hash = poseidon([nullifier, 0n]);

    console.log(`===== Withdraw Data =====`);
    console.log(`leafIndex = "${targetIndex}"`);
    console.log("commitment =", `"${commitmentString}"`);
    console.log("\nsecret = ", `"${secret}"`);
    console.log("\nnullifier = ", `"${nullifier}"`);
    console.log("\nnullifier_hash = ", `"${(fieldToString(poseidon, nullifier_hash))}"`);
    console.log("nullifier_hash_bytes32 = ", `"${(fieldToBytes32(poseidon, nullifier_hash))}"`);
    console.log("\nmerkle_path = [");
    merklePath.forEach(v => console.log(`  "${fieldToString(poseidon, v)}",`));
    console.log("]");
    console.log("\nmerkle_indices = [");
    merkleIndices.forEach(i => console.log(`  ${i},`));
    console.log("]");
    console.log(`\nroot = "${fieldToString(poseidon, root)}"`);
    console.log(`root_bytes32 = "${fieldToBytes32(poseidon, root)}"`);
    console.log("\n");
}

