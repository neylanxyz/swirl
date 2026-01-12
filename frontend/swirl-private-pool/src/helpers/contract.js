import { ethers } from "ethers";

export const SWIRL_PRIVATE_POOL_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_verifier",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_poseidon",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "InvalidDenomination",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidProof",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NullifierAlreadyUsed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TreeIsFull",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "UnknownRoot",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "commitment",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint32",
				"name": "leafIndex",
				"type": "uint32"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "nullifierHash",
				"type": "bytes32"
			}
		],
		"name": "Withdrawal",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DENOMINATION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_LEAVES",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "TREE_DEPTH",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentRoot",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "commitment",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "encryptedNote",
				"type": "bytes"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "filledSubtrees",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "nullifierHash",
				"type": "bytes32"
			}
		],
		"name": "isSpent",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "knownRoots",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextIndex",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "notes",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "ciphertext",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "nullifierHashes",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "poseidon",
		"outputs": [
			{
				"internalType": "contract IPoseidonT2",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "verifier",
		"outputs": [
			{
				"internalType": "contract IVerifier",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "proof",
				"type": "bytes"
			},
			{
				"internalType": "bytes32",
				"name": "root",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "nullifierHash",
				"type": "bytes32"
			},
			{
				"internalType": "address payable",
				"name": "recipient",
				"type": "address"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "zeros",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export const SWIRL_PRIVATE_POOL_ADDRESS = "0x4013aaF875538B2c1258E8929EBC8da2a746c681";//"0xB7B8A5A380Da600FC23258E2814aED632D834f96";

export async function depositToPool(signer, commitment, encryptedNote) {
  const pool = new ethers.Contract(SWIRL_PRIVATE_POOL_ADDRESS, SWIRL_PRIVATE_POOL_ABI, signer);

  // Read denomination from contract
  const denom = await pool.DENOMINATION();

  // Send tx
  const tx = await pool.deposit(commitment, encryptedNote, {
    value: denom
  });

  await tx.wait();
  return tx.hash;
}


