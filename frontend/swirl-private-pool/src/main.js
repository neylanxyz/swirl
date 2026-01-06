import { Buffer } from "buffer";
import { ethers } from "ethers";
import { toUtf8Bytes } from "ethers";

const MANTLE_SEPOLIA = {
  chainId: "0x138B", // 5003
  chainName: "Mantle Sepolia Testnet",
  nativeCurrency: {
    name: "Mantle",
    symbol: "MNT",
    decimals: 18
  },
  rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
  blockExplorerUrls: ["https://sepolia.mantlescan.xyz"]
};



window.Buffer = Buffer;

import {
  getPoseidon,
  randField,
  toBytes32,
  buildZeroes,
  insertLeaf
} from "./helpers/zk.js";

async function ensureMantleSepolia() {
  const { ethereum } = window;

  const currentChainId = await ethereum.request({
    method: "eth_chainId"
  });

  if (currentChainId === MANTLE_SEPOLIA.chainId) return;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MANTLE_SEPOLIA.chainId }]
    });
  } catch (err) {
    if (err.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [MANTLE_SEPOLIA]
      });
    } else {
      throw err;
    }
  }
}



async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }

  await ensureMantleSepolia();

  // ethers v6
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  document.getElementById("wallet").innerText =
    `Connected to Mantle Sepolia\n` +
    `Address: ${address}\n` +
    `Chain ID: ${network.chainId}`;
}

document.getElementById("connect").onclick = connectWallet;


import { depositToPool } from "./helpers/contract.js";
//import { toBytes32, randField, getPoseidon } from "./helpers/zk.js";

document.getElementById("deposit").onclick = async () => {
  const status = document.getElementById("depositStatus");
  status.innerText = "Generating commitment...";

  const poseidon = await getPoseidon();
  const secret = randField();    // BigInt
  const nullifier = randField(); // BigInt
  const commitment = poseidon([secret, nullifier]); // BigInt
  const commitmentBytes32 = toBytes32(poseidon.F.toObject(commitment));  // Safe

  const encryptedNote = toUtf8Bytes("dummy note");

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);

    let out = "";
    out += `secret:\n${secret}\n\n`;
    out += `nullifier:\n${nullifier}\n\n`;
    out += `commitment:\n${commitmentBytes32}\n\n`;

    document.getElementById("app").innerText = out;
    
    const signer = await provider.getSigner();

    // Safe BigInt -> string for logging
    

    const txHash = await depositToPool(
      signer,
      commitmentBytes32,  // 32-byte hex string
      encryptedNote       // Uint8Array from string
    );

    status.innerText = `Deposit successful!\nTx hash: ${txHash}`;
  } catch (err) {
    console.error(err);
    status.innerText = `Error: ${err.message}`;
  }
};




async function main() {
  /*const poseidon = await getPoseidon();
  const F = poseidon.F;

  const zeroes = buildZeroes(poseidon);
  const filledSubtrees = [...zeroes];

  let out = "";

  for (let i = 0; i < 2; i++) {
    const secret = randField();
    const nullifier = randField();

    const commitment = poseidon([secret, nullifier]);
    const nullifierHash = poseidon([nullifier, 0n]);

    const { root, merklePath, merkleIndices } = insertLeaf(
      poseidon,
      commitment,
      i,
      zeroes,
      filledSubtrees
    );

    out += `===== Deposit #${i} =====\n\n`;
    out += `commitment:\n${toBytes32(F.toObject(commitment))}\n\n`;
    out += `root:\n${toBytes32(F.toObject(root))}\n\n`;
    out += `nullifier_hash:\n${toBytes32(F.toObject(nullifierHash))}\n\n`;

    out += `merkle_path:\n`;
    merklePath.forEach((v, idx) => {
      out += `  [${idx}] ${toBytes32(F.toObject(v))}\n`;
    });

    out += `\npath length: ${merklePath.length}\n`;
    out += `merkle_indices:\n`;
    merkleIndices.forEach((v, idx) => {
      out += `  [${idx}] ${v}\n`;
    });
    out += `\n\n`;

  }

  document.getElementById("app").innerText = out;
  */
}

document.getElementById("connect").onclick = connectWallet;
main();

if (window.ethereum) {
  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}
