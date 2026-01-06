import { buildPoseidon } from "circomlibjs";

const TREE_DEPTH = 20;

// ================================
// Field helpers
// ================================
function fieldToString(poseidon, x) {
  return poseidon.F.toString(x);
}

function fieldToBytes32(poseidon, x) {
  const v = BigInt(poseidon.F.toObject(x));
  return "0x" + v.toString(16).padStart(64, "0");
}

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
      // left node → sibling is zero node
      sibling = zeros[i];
      filledSubtrees[i] = currentHash; // update filled subtree
      currentHash = poseidon([currentHash, sibling]);
    } else {
      // right node → sibling from last left
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
async function main() {
  const poseidon = await buildPoseidon();

  // ===== Private inputs for multiple deposits =====
  const deposits = [
    {
      secret: 150015563425453000524434495039824308762691255030671885575353022904829657144n,
      nullifier: 351025985351919752355631341381309546739223537443396316348503718025399401663n
    },
    {
      secret: 14717651873891545948228336795033014873269671791226615914351188746877260605n,
      nullifier: 26361627504641361997299668954555824980619644663723055082479410910138828356n
    },
    {
      secret: 32514725316361865739101909693750314313579931353347202496981105411645577668n,
      nullifier: 315072238410687239507220556253075414656851049287165777217229810181187207224n,
    }
  ];

  const zeroes = buildZeroes(poseidon, TREE_DEPTH);
  const filledSubtrees = [...zeroes]; // stateful filledSubtrees

  for (let depositIndex = 0; depositIndex < deposits.length; depositIndex++) {
    const { secret, nullifier } = deposits[depositIndex];

    // Commitment
    const commitment = poseidon([secret, nullifier]);

    // Nullifier hash
    const nullifierHash = poseidon([nullifier, 0n]);

    // Insert leaf into Merkle tree
    const { root, merklePath, merkleIndices } = insertLeaf(
      poseidon,
      commitment,
      depositIndex,
      zeroes,
      filledSubtrees
    );

    console.log(`===== Deposit #${depositIndex} =====`);
    console.log(`secret = "${secret}"`);
    console.log(`nullifier = "${nullifier}"\n`);

    console.log("merkle_path = [");
    merklePath.forEach(v => console.log(`  "${fieldToString(poseidon, v)}",`));
    console.log("]\n");

    console.log("merkle_indices = [");
    merkleIndices.forEach(v => console.log(`  ${v},`));
    console.log("]\n");

    console.log(`root = "${fieldToString(poseidon, root)}"`);
    console.log(`nullifier_hash = "${fieldToString(poseidon, nullifierHash)}"\n`);

    console.log(`root_bytes32 = "${fieldToBytes32(poseidon, root)}"`);
    console.log(`nullifier_hash_bytes32 = "${fieldToBytes32(poseidon, nullifierHash)}"`);
    console.log("\n");
  }
}

main();
