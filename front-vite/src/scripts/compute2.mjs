import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";
import crypto from "crypto"; // Node.js crypto

// ================================
// CONFIG
// ================================
const TREE_DEPTH = 20;

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x808b1e06452B8653cA083652031102CC6e1580DB";

// Replace with your provider (Alchemy, Infura, etc.)
const provider = new ethers.JsonRpcProvider(
  "https://mantle-sepolia.g.alchemy.com/v2/zUHKYncmcmrExkll9sLz3",
  { chainId: 5003, name: "mantle-sepolia" }
);

// ABI with only needed getters
const ABI = [
  "function nextIndex() view returns (uint32)",
  "function currentRoot() view returns (bytes32)",
  "function getAllFilledSubtrees() view returns (bytes32[])"
];

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
function fieldToBytes32Safe(x) {
  // Accept BigInt or hex strings already < 32 bytes
  if (typeof x === "bigint") {
    return "0x" + x.toString(16).padStart(64, "0");
  }
  return x; // assume it's already hex string
}
function toBytes32Hex(x) {
  if (typeof x === "bigint") {
    return "0x" + x.toString(16).padStart(64, "0");
  }
  if (x instanceof Uint8Array) {
    return "0x" + Array.from(x).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // assume it's already a hex string
  return x;
}
function fieldToDecimal(poseidon, x) {
  // x can be:
  // - a BigInt already => just return string
  // - a Poseidon Fp element => convert using F.toObject
  if (typeof x === "bigint") return x.toString();
  if (poseidon && poseidon.F && typeof poseidon.F.toObject === "function") {
    return poseidon.F.toObject(x).toString();
  }
  throw new Error("Cannot convert to decimal: " + x);
}
function bytes32ToBigInt(b) {
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
function buildZeroes(poseidon, depth) {
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
function buildMerklePath(poseidon, leaf, leafIndex, zeros, filledSubtrees) {
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
// Generate a random 254-bit BigInt (Node.js version)
// ================================
function randomBigInt() {
  const buf = crypto.randomBytes(32);
  return BigInt("0x" + buf.toString("hex")) & ((1n << 254n) - 1n);
}

// ================================
// Main function
// ================================
async function main() {
  const poseidon = await buildPoseidon();

  // === Connect to contract ===
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  // === Step 1: fetch on-chain state ===
  const nextIndexBN = await contract.nextIndex();
  const nextIndex = BigInt(nextIndexBN); // BigInt
  const leafIndex = 0n;//nextIndex - 1n; // your leaf index after deposit

  const currentRoot = await contract.currentRoot();
  const rawSubtrees = await contract.getAllFilledSubtrees();
  const filledSubtrees = rawSubtrees.map(bytes32ToBigInt);

  // === Step 2: generate secret and nullifier ===
  const secret = 221298477636339949057548167593224959821007762943954710158846228018887916899n;//randomBigInt();
  const nullifier = 449923872617343972930614807539800076469236091160820040557567436683998548601n;//randomBigInt();

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
  console.log("===== Deposit Info =====");
  console.log('secret =', `"${secret.toString()}"`);
  console.log('nullifier =', `"${nullifier.toString()}"`);
  console.log('commitment =', `"${fieldToDecimal(poseidon, commitment)}"`);
  console.log('nullifier_hash =', `"${fieldToDecimal(poseidon, nullifierHash)}"`);
  console.log('nullifier_hash_bytes32 =', `"${fieldToBytes32(poseidon, nullifierHash)}"`);
  console.log('leafIndex =', `"${leafIndex.toString()}"`);
  console.log('currentRoot =', `"${currentRoot}"`);
  console.log('root (computed) =', `"${fieldToDecimal(poseidon, root)}"`);
  console.log('root (bytes32) =', `${fieldToBytes32(poseidon, root)}`);

  // --- Output Merkle path ---
  console.log("\nmerkle_path = [");
  merklePath.forEach(v => console.log(`  "${fieldToDecimal(poseidon, v)}",`));
  console.log("]");

  // --- Output Merkle indices ---
  console.log("\nmerkle_indices = [");
  merkleIndices.forEach(i => console.log(`  ${i},`));
  console.log("]");
}

main();
