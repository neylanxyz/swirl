import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { SWIRL_PRIVATE_POOL_ADDRESS, SWIRL_PRIVATE_POOL_ABI } from '../helpers/contract';

/**
 * Custom hook for interacting with Swirl Private Pool contract
 * Provides typed access to contract reads and writes
 */
export function useSwirlPool() {
  const { address, isConnected } = useAccount();

  // Read contract state
  const { data: denomination, isLoading: isLoadingDenomination } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'DENOMINATION',
  });

  const { data: currentRoot, isLoading: isLoadingRoot } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'currentRoot',
  });

  const { data: nextIndex, isLoading: isLoadingIndex } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'nextIndex',
  });

  const { data: getAllFilledSubtrees, isLoading: isLoadingGetAllFilledSubtrees } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'getAllFilledSubtrees',
  });

  const { data: maxLeaves, isLoading: isLoadingMaxLeaves } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'MAX_LEAVES',
  });

  // Write contract functions
  const {
    writeContract,
    data: hash,
    isPending: isDepositing,
    error: depositError
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  /**
   * Deposit to the pool
   * @param commitment - bytes32 commitment hash
   * @param encryptedNote - encrypted note bytes as hex string
   */
  const deposit = async (commitment: Address, encryptedNote: Hex) => {
    if (!denomination) {
      throw new Error('Denomination not loaded');
    }

    await writeContract({
      address: SWIRL_PRIVATE_POOL_ADDRESS,
      abi: SWIRL_PRIVATE_POOL_ABI,
      functionName: 'deposit',
      args: [commitment, encryptedNote],
      value: denomination,
    });
  };

  /**
   * Withdraw from the pool
   * @param proof - zk proof bytes as hex string
   * @param root - merkle root bytes32
   * @param nullifierHash - nullifier hash bytes32
   * @param recipient - recipient address
   */
  const withdraw = async (
    proof: Hex,
    root: Address,
    nullifierHash: Address,
    recipient: Address
  ) => {
    await writeContract({
      address: SWIRL_PRIVATE_POOL_ADDRESS,
      abi: SWIRL_PRIVATE_POOL_ABI,
      functionName: 'withdraw',
      args: [proof, root, nullifierHash, recipient],
    });
  };

  return {
    // Account state
    address,
    isConnected,

    // Contract state (read)
    denomination,
    currentRoot,
    nextIndex,
    maxLeaves,
    getAllFilledSubtrees,
    isLoading: isLoadingDenomination || isLoadingRoot || isLoadingIndex || isLoadingMaxLeaves || isLoadingGetAllFilledSubtrees,

    // Deposit state
    deposit,
    depositHash: hash,
    isDepositing,
    isConfirming,
    isConfirmed,
    depositError,

    // Withdraw function
    withdraw,
  };
}
