// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

/**
 * =================================================
 * PRIVATE MNT POOL (POSEIDON)
 * =================================================
 * - Fixed denomination: 1 MNT (for testing purposes)
 * - Commit / Withdraw model
 * - Poseidon-based Merkle Tree (BN254)
 * - Nullifiers to prevent double spending
 * - Noir-compatible
 * - Sanctions (if necessary)
 * - Emergency Pausing (if necessary)
 */

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IVerifier {
    function verify(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external view returns (bool);
}

interface IPoseidonT2 {
    function poseidon(uint256[2] calldata input) external pure returns (uint256);
}

contract SwirlPrivatePool is Pausable, Ownable, ReentrancyGuard {
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

    /// @notice Emitted when a deposit is made
    /// @param commitment Commitment hash of secret and nullifier
    /// @param leafIndex Index of the commitment in the Merkle tree
    event Deposit(bytes32 indexed commitment, uint32 leafIndex);

    /// @notice Emitted when a withdrawal occurs
    /// @param recipient Address receiving the MNT
    /// @param nullifierHash Nullifier hash of the withdrawn commitment
    event Withdrawal(address indexed recipient, bytes32 nullifierHash);

    /// @notice Emitted when an address is blacklisted
    /// @param blacklistedAddress Address that was blacklisted
    event Blacklisted(address blacklistedAddress);

    /// @notice Emitted when an address is pardoned
    /// @param pardonedAddress Address that was removed from blacklist
    event Pardoned(address pardonedAddress);

    /// @notice Emitted when protocol fees are withdrawn
    /// @param treasury Address receiving the fees
    /// @param amount Amount withdrawn
    event FeeWithdrawal(address treasury, uint256 amount);

    /// @notice Emitted when protocol fees are burned
    /// @param burnAddress Address receiving the burned fees
    /// @param amount Amount burned
    event FeesBurned(address burnAddress, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                              CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant DENOMINATION = 1 ether;
    uint256 public constant PROTOCOL_FEE = 0.1 ether;
    uint32  public constant TREE_DEPTH   = 20;
    uint32  public constant MAX_LEAVES   = uint32(1 << TREE_DEPTH);

    /*//////////////////////////////////////////////////////////////
                              VARIABLES
    //////////////////////////////////////////////////////////////*/
 
    uint256 public totalFees = 0;

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
    mapping(address => bool) public isBlacklisted;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
    * @notice Initializes the private pool with verifier and Poseidon hash contract
    * @param _verifier Address of the ZK proof verifier contract
    * @param _poseidon Address of the Poseidon hash contract
    */

    constructor(address _verifier, address _poseidon) Ownable(msg.sender) {
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
                        REGULATORY STUFF
    //////////////////////////////////////////////////////////////*/

    /**
     * @param _address The address to be sanctioned
     */
    
    function blacklist(address _address) public onlyOwner {
        isBlacklisted[_address] = true;
        emit Blacklisted(_address);
    }

    /**
     * @param _address The address to be un-sanctioned
     */
    
    function pardon(address _address) public onlyOwner {
        isBlacklisted[_address] = false;
        emit Pardoned(_address);
    }

    /*//////////////////////////////////////////////////////////////
                        EMERGENCY STUFF
    //////////////////////////////////////////////////////////////*/

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                                DEPOSIT
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Allows user to deposit.
     * @dev Deposit with commitment
     * Users pay DENOMINATION + PROTOCOL_FEE; only DENOMINATION is withdrawable, PROTOCOL_FEE collected by protocol.
     * @param commitment Poseidon(secret, nullifier)
     */
    function deposit(
        bytes32 commitment
    ) external payable whenNotPaused {
        // Users must send MNT + protocol fee.
        // DENOMINATION is returned on withdrawal; PROTOCOL_FEE is collected by the protocol.   
        require(!isBlacklisted[msg.sender], "this address is blacklisted and cannot deposit");

        uint256 depositTotal = DENOMINATION + PROTOCOL_FEE;

        if (msg.value != depositTotal) revert InvalidDenomination();
        if (nextIndex >= MAX_LEAVES) revert TreeIsFull();

        uint32 index = nextIndex;
        nextIndex++;

        uint256 currentHash = uint256(commitment);

        for (uint32 i = 0; i < TREE_DEPTH; i++) {
            // If index is even, currentHash is left child; else right child.
            // filledSubtrees[i] stores the left node at this level for future deposits.
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
            index >>= 1; // move up one level
        }

        currentRoot = bytes32(currentHash);
        knownRoots[currentRoot] = true;
        totalFees += PROTOCOL_FEE;

        emit Deposit(commitment, nextIndex - 1);
    }

    /*//////////////////////////////////////////////////////////////
                               WITHDRAW
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Allows user to withdraw their funds
     * @dev Verify proof, root, nullifierHash and send funds to recipient
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
    ) external whenNotPaused nonReentrant {
        require(!isBlacklisted[recipient], "recipient sanctioned");
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
                              DEV WITHDRAW
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Withdraws all accumulated protocol fees to the treasury
     * @dev Only callable by owner; resets totalFees to zero
     * @param _treasury Address to receive the fees
     */

    function withdrawFees(address _treasury) external onlyOwner nonReentrant {
        require(totalFees > 0, "no fees to withdraw");
        require(_treasury != address(0), "invalid treasury");

        uint256 amount = totalFees;
        totalFees = 0;

        (bool ok, ) = _treasury.call{value: amount}("");
        require(ok, "withdraw failed");

        emit FeeWithdrawal(_treasury, amount);
    }

    /**
     * @notice Optionally burn fees
     * @dev Fees are sent to dead address
     */ 

    function burnFees() external onlyOwner nonReentrant whenPaused {
        require(totalFees > 0, "no fees to burn");

        uint256 amount = totalFees;
        totalFees = 0;

        (bool ok, ) = payable(0x000000000000000000000000000000000000dEaD).call{value: amount}("");
        require(ok, "burn failed");

        emit FeesBurned(0x000000000000000000000000000000000000dEaD, amount);
    }

    /*//////////////////////////////////////////////////////////////
                              VIEW HELPERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Verify if a nullifier was already used
     * @param nullifierHash Nullifier to be verified
     * @return nullifierHashes[nullifierHash] true for used nullifierHash and false otherwise
     */
    function isSpent(bytes32 nullifierHash) external view returns (bool) {
        return nullifierHashes[nullifierHash];
    }

    /**
     * @notice Checks if an address is blacklisted (sanctioned)
     * @param _address Address to be verified
     * @return isBlacklisted[_address] true for sanctioned address and false otherwise
     */
    function isAddressBlacklisted(address _address) external view returns (bool) {
        return isBlacklisted[_address];
    }

    /**
     * @notice Returns the total fees accumulated by the protocol
     * @return totalFees The amount of MNT collected as fees
     */

    function checkFees() external view returns (uint256) {
        return totalFees;
    }

}
