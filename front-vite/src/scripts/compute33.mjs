import { buildPoseidon } from "circomlibjs";

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
// Main
// ================================
export async function compute33() {
    const poseidon = await buildPoseidon();

    // ===== Public commitments from Solidity (bytes32)
    // MUST be sorted by leafIndex =====
    const commitments = [
        "0x26beea66d782d7fd7fe816c234389182dee1ac1da72f8b721cce74c8dc25f529",
        "0x293f667a8a96fb07040e7868ce173bf81d55f6dada7d5d6942aa148073a8ec6e",
        "0x287fdf7fb7b6c367a30cbf4556915930013fb3d48fbdc05eb298bf0b9dbe771d",
        "0x1a8dba3661d4edd571cd910c7aa5fe4696367f742b0380217353ffc83bcc0f59",
        "0x173740bedb814ef54315521b5e798d70a7fb54eecf7e8e14765f488e5b1810c1",
        "0x0de2694da0cdf491e8d61fecd055f12c10cc902b27fa5f6f312ef29502d00ff6",
        "0x071adfc87a0816fa1d0164c0ceb70f3b089a7bfd184e4a5478a5fac013569aa8"
    ];

    const zeroes = buildZeroes(poseidon, TREE_DEPTH);
    const filledSubtrees = [...zeroes];

    // Replay the tree for each leaf
    for (let leafIndex = 0; leafIndex < commitments.length; leafIndex++) {
        const commitmentBigInt = bytes32ToBigInt(commitments[leafIndex]);

        const { root, merklePath, merkleIndices } = insertLeaf(
            poseidon,
            commitmentBigInt,
            leafIndex,
            zeroes,
            filledSubtrees
        );

        const secret = 203592336586275933693947579126545526502441544242235544292218738159597747660n;
        const nullifierA = 154100584036173210947682915634547501655624028747117593790412097949694442129n;
        const nullifier_hash = poseidon([nullifierA, 0n]);


        console.log(`===== Deposit #${leafIndex} =====`);

        console.log(`leafIndex = "${leafIndex}"`);
        console.log("commitment =", `"${commitmentBigInt}"`);

        console.log("\nsecret = ", `"${secret}"`);
        console.log("\nnullifier = ", `"${nullifierA}"`);
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
}

compute33()