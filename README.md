# Swirl Private Pool (Poseidon)

A **privacy-preserving fixed-denomination pool** for **MNT**, inspired by Tornado-style commit/withdraw systems and implemented with **Poseidon hashing** and **Noir zero-knowledge proofs**.

You can find the **Private Pool contract** in `./contracts/SwirlPrivatePoolV2.sol`, and the complete **Noir circuit** in `./circuits/swirlpool/src/main.nr`.

This contract allows users to deposit funds anonymously and later withdraw them without linking their deposit and withdrawal addresses.

---

## Features

- **Privacy-Preserving Deposits & Withdrawals**
- **Poseidon Hash (BN254) Merkle Tree**
- **Noir-Compatible ZK Proofs**
- **Nullifier System** (prevents double-spending)
- **Incremental Merkle Tree (Depth = 20)**
- **Fixed Denomination Pool**
- **Protocol Fee Collection**
- **Emergency Pause**
- **Sanctions / Blacklist Support**
- **Reentrancy Protection**

---

## Pool Parameters

| Parameter     | Value         |
| ------------- | ------------- |
| Denomination  | `1 MNT`       |
| Protocol Fee  | `0.1 MNT`     |
| Tree Depth    | `20`          |
| Max Deposits  | `1,048,576`   |
| Hash Function | Poseidon (T2) |
| ZK System     | Noir          |

---

## SwirlPrivatePool Overview

This is the main contract of Swirl. It handles deposits, withdraws, fees and regulatory controls such as pauses and blacklist.

In the `constructor` we set `IVerifier` and `IPoseidon`, which are necessary to verify ZK Proofs and compute Poseidon hashes in Solidity.
`IVerifier` is generated using the `bb.js` lib and `IPoseidon` can be generated using `circomlib.js`. A full guide on how to generate and deploy those contracts will be provided later in this README.

`SwirlPrivatePool` also uses `OpenZeppelin`'s contracts for security such as `Ownable`, `Pausable` and `ReentrancyGuard`.

You can find more information about these contracts here: https://github.com/OpenZeppelin/openzeppelin-contracts

---

## Technical Overview

The `SwirlPrivatePool` contract implements a **commit–reveal–withdraw privacy pool** using a **Poseidon-based incremental Merkle tree** and **Noir zero-knowledge proofs**. The system separates **deposit identity** from **withdrawal identity**, allowing users to redeem funds without revealing which deposit they originated from.

### Core Components

#### 1. Fixed-Denomination Pool

- Every deposit is exactly `DENOMINATION` (1 MNT).
- An additional `PROTOCOL_FEE` (0.1 MNT) is collected on deposit.
- Only the denomination amount is withdrawable.
- Fees are accumulated and managed separately by the protocol owner.

This fixed-size design is essential for anonymity, ensuring all deposits are indistinguishable.

---

#### 2. Poseidon-Based Merkle Tree

- The contract maintains an **incremental Merkle tree** with:
  - Depth: `20`
  - Maximum leaves: `2^20`
- Poseidon (BN254) is used as the hash function to ensure compatibility with ZK circuits.

**Tree state variables:**

- `zeros[]` — precomputed zero values for each tree level
- `filledSubtrees[]` — cached left nodes for efficient insertion
- `currentRoot` — latest Merkle root
- `knownRoots` — mapping of all historical roots

Each deposit inserts a new leaf (`commitment`) and updates the Merkle root.

---

#### 3. Commitments

A commitment is computed off-chain as:

`commitment = Poseidon(secret, nullifier)`

- `secret` — private randomness

- `nullifier` — unique value preventing double-spends

The commitment is stored as a Merkle tree leaf, but neither the secret nor nullifier are revealed on-chain.

---

#### 4. Nullifier System (Double-Spend Protection)

- On withdrawal, the user reveals `nullifierHash = Poseidon(nullifier)`
- The contract tracks spent nullifiers in `nullifierHashes`

If a nullifier hash has already been used, the withdrawal is rejected.
This guarantees each deposit can only be withdrawn once, without linking it to a specific leaf.

---

#### 5. Zero-Knowledge Withdrawals (Noir)

Withdrawals require a valid **Noir-generated zero-knowledge proof**.

The proof attests that a valid `(secret, nullifier)` pair exists for a commitment included in the Merkle tree..

Public inputs to the verifier: `[merkle_root, nullifier_hash]`.

The contract:

- Verifies the root is known
- Ensures the nullifier has not been used
- Calls the Noir verifier contract
- Releases funds if verification succeeds

---

#### 6. Withdrawal Execution

Once the proof is validated:

- The nullifier hash is permanently marked as spent
- DENOMINATION MNT is transferred to the specified recipient
- The withdrawal is protected with nonReentrant

The recipient address is not required to be the depositor, preserving anonymity.

Note: While the cryptographic proof attests to knowledge of `(secret, nullifier)` and Merkle inclusion,
these operations are performed by the Swirl application on behalf of the user.

---

#### 7. Protocol Fees

- Fees are accumulated in totalFees
- Fees can be:
  - Withdrawn to a treasury address
  - Burned by sending to the dead address (only when paused)
  - Fee operations are owner-restricted and protected against reentrancy.

---

#### 8. Sanctions & Compliance Controls

The contract includes optional regulatory controls:

- Blacklisted addresses cannot:
  - Deposit
  - Receive withdrawals
- Blacklist management is owner-controlled

These controls allow compliance layers without compromising cryptographic privacy.

---

#### 9. Emergency Controls

- The contract can be paused by the owner
- When paused:
  - Deposits and withdrawals are disabled
  - Fees may be burned
- Useful for responding to vulnerabilities or protocol upgrades

---

#### Trust Assumptions

- The Poseidon hash contract matches the Noir circuit implementation
- The Noir verifier correctly enforces the circuit constraints
- No trusted party learns user secrets or nullifiers

Notice that it is easy to check whether the Noir circuit and Verifier are correctly implemented by generating them yourself.

Any mismatch between the Solidity Poseidon implementation and the Noir circuit breaks soundness.

---

#### Summary

`SwirlPrivatePool` combines:

- Fixed-size deposits
- Poseidon Merkle trees
- Noir zero-knowledge proofs
- Nullifier-based double-spend protection

to create a non-custodial, privacy-preserving MNT pool with optional compliance and emergency controls.

Privacy depends on the size and timing distribution of deposits.
Deposits and withdrawals are unlinkable at the protocol level, but timing analysis and off-chain metadata are out of scope.

---

## Architecture Overview

flowchart TB

subgraph Deposit["Deposit Flow"]
A1[User initiates deposit]
A2[App generates secret & nullifier locally]
A3["Compute commitment<br/>Poseidon(secret, nullifier)"]
A4["Call deposit(commitment)<br/>on SwirlPrivatePool"]
A5["Generate base64 encoded note<br/>(secret, nullifier, leafIndex)"]
A6[User saves note for withdrawal]

    A1 --> A2 --> A3 --> A4 --> A5 --> A6

end

subgraph Withdraw["Withdraw Flow"]
B1[User pastes encoded note]
B2[User pastes recipient address]
B3["App computes merklePath<br/>& merkleIndices from<br/>previous commitments"]
B4["Generate ZK Proof using:<br/>secret, nullifier, merklePath,<br/>merkleIndices, root, nullifierHash"]
B5["Call withdraw(zk_proof, root,<br/>nullifierHash, recipient)<br/>on SwirlPrivatePool"]
B6[Funds sent to recipient]

    B1 --> B2 --> B3 --> B4 --> B5 --> B6

end

A6 -.->|Note used for withdrawal| B1

style Deposit fill:#e1f5ff,stroke:#0066cc,stroke-width:2px
style Withdraw fill:#fff4e1,stroke:#cc6600,stroke-width:2px
style A4 fill:#90EE90,stroke:#006400,stroke-width:2px
style B5 fill:#90EE90,stroke:#006400,stroke-width:2px

### Deposit Flow

1.  The app generates `secret` and `nullifier` locally.
2.  Computes commitment by `Poseidon(secret, nullifier)`.
3.  Calls `deposit(commitment)` on `SwirlPrivatePool`.
4.  Generates a `base64` encoded note containing `(secret, nullifier, leafIndex)` the user will use to withdraw funds.

### Withdraw Flow

1.  User pastes the encoded note.
2.  User pastes the recipient address.
3.  The app computes `merklePath` and `merkleIndices` using the commitments from previous deposits.
4.  Generates the **ZK Proof** using `(secret, nullifier, merklePath, merkleIndices, root, nullifierHash)`.
5.  Calls `withdraw(zk_proof, root, nullifierHash, recipient)` on `SwirlPrivatePool`.

---

## How to deploy this myself?

### Prerequisites

- Linux or macOS environment
- Node.js >= 18
- Solidity compiler > 0.8.20
- An EVM-compatible network (local, testnet, or mainnet)
- Basic familiarity with Noir and Solidity deployment

---

#### 1. Build the Noir circuit `./circuits/swirlpool/src/main.nr` and `./circuits/swirlpool/contracts/Verifier.sol`

You can find the full documentation on: https://noir-lang.org/docs/

Install Noir and Nargo:

```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
noirup
```

Assuming you are on `./circuits/swirlpool/`

```bash
nargo check
nargo execute
```

`nargo execute` will generate the `witness` that we need to feed to the proving backend.

Now for the proving backend we will use Barretenberg. For the full Barretenberg documentation, check: https://barretenberg.aztec.network/docs/getting_started/

Install `bbup`:

```bash
curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/refs/heads/next/barretenberg/bbup/install | bash
bbup
```

To generate a solidity verifier, first we need to set a Verification Key (vk):

```bash
bb write_vk -b ./target/<noir_artifact_name>.json -o ./target --oracle_hash keccak
```

Replace `<noir_artifact_name>` with the Noir build artifact located in `./target/`, in this case `swirl.json`.

Then

```bash
bb write_solidity_verifier -k ./target/vk -o ./target/Verifier.sol
```

to generate the solidity file.

Now you can simply deploy it using Remix https://remix.ethereum.org/ or any tool you want.

We recommend using Optmization with 100 runs.

---

#### 2. Deploy Poseidon contract

To deploy the Poseidon Contra we will use `circomlibjs` to generate the contract bytecode and ABI and use `./helpers/ByteCodeDeployer.sol` to deploy the contract.

Generate the bytecode and ABI:

```js
const { poseidonContract } = require("circomlibjs");

const code = poseidonContract.createCode(2);
const abi = poseidonContract.generateABI(2);
console.log(code);
console.log(abi);
```

Now deploy `./helpers/ByteCodeDeployer.sol` and use the `deploy(bytecode)` function to deploy the Poseidon contract.

`ByteCodeDeployer` is a helper contract that allows deploying arbitrary bytecode on-chain.

⚠️ **IMPORTANT**

The Poseidon contract deployed here **must exactly match** the Poseidon parameters
used in the Noir circuit (arity = 2, BN254).
Any mismatch will break proof verification and compromise soundness.

---

#### 3. Deploy `SwirlPrivatePoolV2.sol`

Deploy it passing to the constructor both the Verifier Contract address and the Poseidon Contract address.

---

#### 4. Deploy the frontend

1. Install dependencies:

```bash
pnpm install
```

2. Run the development server:

```bash
pnpm run dev
```

3. Copy the environment file:

```bash
cp .env.example .env
```

4. Configure the environment variables in `.env`:

```env
VITE_PUBLIC_ENV="development" # Use "development" or "production"
```

**VITE_API explanation:**

- **Production:**

```env
VITE_API="https://swirl-production-9f99.up.railway.app/"
```

- **Development:**

```env
VITE_API="http://localhost:<PORT>/"
```

> For development, you need to run the local indexer first, so the frontend can fetch data.

---

#### 5. Deploy the indexer

1. Install dependencies:

```bash
pnpm install
```

2. Run the indexer:

```bash
pnpm run dev
```

3. Check the GraphQL indexer (production):

[https://swirl-production-9f99.up.railway.app/](https://swirl-production-9f99.up.railway.app/)
