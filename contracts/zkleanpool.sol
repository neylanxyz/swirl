//SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

/**
 * =================================================
 * PRIVATE MNT POOL
 * ================================================
 * - Fixed denomination: 1 MNT
 * - Commit / Withdraw model
 * - Merkle Tree for deposits
 * - Nullifiers to prevent double spending
 * - Designed to work with Noir
 * - View-Key for compliance
 */

 interface IVerifier {
    function verify(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external view returns (bool);
 }

 contract zkleanPrivateMNTPool {
    /*//////////////////////////////////
     ERRORS
    //////////////////////////////////*/

    error InvalidDenomination();
    error TreeIsFull();
    error NullifierAlreadyUsed();
    error UnknownRoot();
    error InvalidProof();

    /*/////////////////////////////////
     EVENTS
    /////////////////////////////////*/

    event Deposit(bytes32 indexed commitment, uint32 leafIndex);
    event Withdrawal(address indexed recipient, bytes32 nullifier);

    /*/////////////////////////////////
     CONSTANTS
    /////////////////////////////////*/

    uint256 public constant DENOMINATION = 1 ether;
    uint32  public constant TREE_DEPTH   = 20;
    uint32  public constant MAX_LEAVES   = uint32(1 << TREE_DEPTH);

    /*/////////////////////////////////
     ZK/MERKLE STATE
    /////////////////////////////////*/

    IVerifier public immutable verifier;

    bytes32[TREE_DEPTH] public zeros;
    bytes32[TREE_DEPTH] public filledSubtrees;

    bytes32 public currentRoot;
    uint32 public nextIndex;

    mapping(bytes32 => bool) public nullifierHashes;
    mapping(bytes32 => bool) public knownRoots;

    /*/////////////////////////////////
     VIEW-KEY METADATA
    /////////////////////////////////*/

    struct EncryptedNote {
        bytes ciphertext; //encripted offchain with view-key
    }

    mapping(bytes32 => EncryptedNote) public notes; // commitment => encrypted note

    /*/////////////////////////////////
     CONSTRUCTOR
    /////////////////////////////////*/

    constructor(address _verifier) {
        verifier = IVerifier(_verifier);

        //Initialize zero values for Merkle Tree
        zeros[0] = keccak256(abi.encode(uint256(0)));
        for (uint32 i = 1; i < TREE_DEPTH; i++) {
            zeros[i] = keccak256(abi.encode(zeros[i-1], zeros[i-1]));
        }

        //Initialize filled subtrees
        for (uint32 i = 0; i < TREE_DEPTH; i++) {
            filledSubtrees[i] = zeros[i];
        }

        currentRoot = zeros[TREE_DEPTH - 1];
        knownRoots[currentRoot] = true;
    }

    /*/////////////////////////////////
     DEPOSIT
    /////////////////////////////////*/

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
        nextIndex += 1;

        bytes32 currentHash = commitment;
        for (uint32 i = 0; i < TREE_DEPTH; i++) {
            if ((index & 1) == 0) {
                filledSubtrees[i] = currentHash;
                currentHash = keccak256(abi.encode(currentHash, zeros[i]));
            } else {
                currentHash = keccak256(abi.encode(filledSubtrees[i], currentHash));
            }
            index >>= 1;
        }

        currentRoot = currentHash;
        knownRoots[currentRoot] = true;


        notes[commitment] = EncryptedNote({ciphertext: encryptedNote});


        emit Deposit(commitment, nextIndex - 1);
    }

    /*/////////////////////////////////
     WITHDRAW
    /////////////////////////////////*/

    /**
     * @param proof Noir proof bytes
     * @param root Merkle root
     * @param nullifierHash Prevents double spend
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

        bool valid = verifier.verify(proof, publicInputs);
        if (!valid) revert InvalidProof();

        nullifierHashes[nullifierHash] = true;

        (bool ok,) = recipient.call{value: DENOMINATION}("");
        require(ok, "MNT transfer failed");

        emit Withdrawal(recipient, nullifierHash);
     }

    /*/////////////////////////////////
     VIEW HELPERS
    /////////////////////////////////*/

    function isSpent(bytes32 nullifierHash) external view returns (bool) {
        return nullifierHashes[nullifierHash];
    }
 }