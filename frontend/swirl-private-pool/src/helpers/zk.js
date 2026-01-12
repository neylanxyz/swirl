import { buildPoseidon } from "circomlibjs";

// =======================
// Constants
// =======================
export const TREE_DEPTH = 20;

// =======================
// Poseidon singleton
// =======================
let poseidonInstance = null;

export async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

// =======================
// Helpers
// =======================
export function randField() {
  const bytes = new Uint8Array(31);
  window.crypto.getRandomValues(bytes);

  let hex = "";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return BigInt("0x" + hex);
}

export function toBytes32(bn) {
  return "0x" + bn.toString(16).padStart(64, "0");
}

// =======================
// Zero tree
// =======================
export function buildZeroes(poseidon) {
  const zeroes = [];
  zeroes[0] = poseidon([0n, 0n]);

  for (let i = 1; i < TREE_DEPTH; i++) {
    zeroes[i] = poseidon([zeroes[i - 1], zeroes[i - 1]]);
  }
  return zeroes;
}

// =======================
// Merkle insertion
// =======================
export function insertLeaf(poseidon, leaf, leafIndex, zeroes, filledSubtrees) {
  let currentHash = leaf;
  let index = leafIndex;

  const merklePath = [];
  const merkleIndices = [];

  for (let i = 0; i < TREE_DEPTH; i++) {
    const isRightNode = index % 2 === 1;
    let sibling;

    if (!isRightNode) {
      sibling = zeroes[i];
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

  return { root: currentHash, merklePath, merkleIndices };
}
