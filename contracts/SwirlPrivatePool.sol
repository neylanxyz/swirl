// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

/**
 * =================================================
 * PRIVATE MNT POOL (POSEIDON)
 * =================================================
 * - Fixed denomination: 10 MNT
 * - Commit / Withdraw model
 * - Poseidon-based Merkle Tree (BN254)
 * - Nullifiers to prevent double spending
 * - Noir-compatible
 */

interface IVerifier {
    function verify(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external view returns (bool);
}

interface IPoseidonT2 {
    function poseidon(uint256[2] calldata input) external pure returns (uint256);
}

contract SwirlPrivatePool {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidDenomination();
    error TreeIsFull();
    error NullifierAlreadyUsed();
    error UnknownRoot();
    error InvalidProof();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event Deposit(bytes32 indexed commitment, uint32 leafIndex);
    event Withdrawal(address indexed recipient, bytes32 nullifierHash);

    /*//////////////////////////////////////////////////////////////
                              CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant DENOMINATION = 10 ether;
    uint32  public constant TREE_DEPTH   = 20;
    uint32  public constant MAX_LEAVES   = uint32(1 << TREE_DEPTH);

    /*//////////////////////////////////////////////////////////////
                          ZK / MERKLE STATE
    //////////////////////////////////////////////////////////////*/

    IVerifier public immutable verifier;
    IPoseidonT2 public immutable poseidon;

    bytes32[TREE_DEPTH] public zeros;
    bytes32[TREE_DEPTH] public filledSubtrees;

    bytes32 public currentRoot;
    uint32  public nextIndex;

    mapping(bytes32 => bool) public nullifierHashes;
    mapping(bytes32 => bool) public knownRoots;

    /*//////////////////////////////////////////////////////////////
                          VIEW-KEY METADATA
    //////////////////////////////////////////////////////////////*/

    struct EncryptedNote {
        bytes ciphertext;
    }

    mapping(bytes32 => EncryptedNote) public notes;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _verifier, address _poseidon) {
        verifier = IVerifier(_verifier);
        poseidon = IPoseidonT2(_poseidon);

        // zero = Poseidon(0, 0)
        uint256 zero = poseidon.poseidon([uint256(0), uint256(0)]);
        zeros[0] = bytes32(zero);

        // Build zero tree
        for (uint32 i = 1; i < TREE_DEPTH; i++) {
            zero = poseidon.poseidon([zero, zero]);
            zeros[i] = bytes32(zero);
        }

        for (uint32 i = 0; i < TREE_DEPTH; i++) {
            filledSubtrees[i] = zeros[i];
        }

        currentRoot = zeros[TREE_DEPTH - 1];
        knownRoots[currentRoot] = true;
    }

    /*//////////////////////////////////////////////////////////////
                                DEPOSIT
    //////////////////////////////////////////////////////////////*/

    /**
     * @param commitment Poseidon(secret, nullifier)
     * @param encryptedNote Encrypted metadata (view-key)
     */
    function deposit(
        bytes32 commitment,
        bytes calldata encryptedNote
    ) external payable {
        if (msg.value != DENOMINATION) revert InvalidDenomination();
        if (nextIndex >= MAX_LEAVES) revert TreeIsFull();

        uint32 index = nextIndex;
        nextIndex++;

        uint256 currentHash = uint256(commitment);

        for (uint32 i = 0; i < TREE_DEPTH; i++) {
            if ((index & 1) == 0) {
                filledSubtrees[i] = bytes32(currentHash);
                currentHash = poseidon.poseidon([
                    currentHash,
                    uint256(zeros[i])
                ]);
            } else {
                currentHash = poseidon.poseidon([
                    uint256(filledSubtrees[i]),
                    currentHash
                ]);
            }
            index >>= 1;
        }

        currentRoot = bytes32(currentHash);
        knownRoots[currentRoot] = true;

        notes[commitment] = EncryptedNote({ciphertext: encryptedNote});

        emit Deposit(commitment, nextIndex - 1);
    }

    /*//////////////////////////////////////////////////////////////
                               WITHDRAW
    //////////////////////////////////////////////////////////////*/

    /**
     * @param proof Noir proof bytes
     * @param root Merkle root
     * @param nullifierHash Poseidon(nullifier)
     * @param recipient MNT receiver
     */
    function withdraw(
        bytes calldata proof,
        bytes32 root,
        bytes32 nullifierHash,
        address payable recipient
    ) external {
        if (nullifierHashes[nullifierHash]) revert NullifierAlreadyUsed();
        if (!knownRoots[root]) revert UnknownRoot();

        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = root;
        publicInputs[1] = nullifierHash;

        if (!verifier.verify(proof, publicInputs)) revert InvalidProof();

        nullifierHashes[nullifierHash] = true;

        (bool ok,) = recipient.call{value: DENOMINATION}("");
        require(ok, "MNT transfer failed");

        emit Withdrawal(recipient, nullifierHash);
    }

    /*//////////////////////////////////////////////////////////////
                              VIEW HELPERS
    //////////////////////////////////////////////////////////////*/

    function isSpent(bytes32 nullifierHash) external view returns (bool) {
        return nullifierHashes[nullifierHash];
    }
}
