import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address, type Hex } from 'viem';
import { SWIRL_PRIVATE_POOL_ADDRESS, SWIRL_PRIVATE_POOL_ABI } from '../helpers/contract';
import { simulateContract, writeContract } from 'viem/actions';
import { publicClient } from '@/config';
import { useWalletClient } from 'wagmi'

/**
 * Custom hook for interacting with Swirl Private Pool contract
 * Provides typed access to contract reads and writes
 */
export function useSwirlPool() {
  const { address, isConnected } = useAccount();
  const walletClient = useWalletClient({
    account: address
  })

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

  const { data: nextIndex, isLoading: isLoadingIndex, refetch: refetchNextIndex } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'nextIndex',
  });

  const { data: protocolFee } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'PROTOCOL_FEE',
  });

  const { data: maxLeaves, isLoading: isLoadingMaxLeaves } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'MAX_LEAVES',
  });

  // Write contract functions for deposit
  const {
    writeContract: writeDepositContract,
    data: depositHash,
    isPending: isDepositing,
    error: depositError
  } = useWriteContract();

  const { isLoading: isConfirmingDeposit, isSuccess: isDepositConfirmed } =
    useWaitForTransactionReceipt({
      hash: depositHash,
    });

  // Write contract functions for withdraw
  const {
    writeContract: writeWithdrawContract,
    data: withdrawHash,
    isPending: isWithdrawing,
    error: withdrawError
  } = useWriteContract();

  const { isLoading: isConfirmingWithdraw, isSuccess: isWithdrawConfirmed } =
    useWaitForTransactionReceipt({
      hash: withdrawHash,
    });

  /**
   * Deposit to the pool
   * @param commitment - bytes32 commitment hash
   */
  const deposit = async (commitment: Address) => {
    if (!denomination || !protocolFee) {
      throw new Error('Deposit invalid needs to add the Denomination and Protocol Fee');
    }

    if (!walletClient.data) {
      throw new Error('Wallet client not connected');
    }

    const { request } = await simulateContract(publicClient, {
      address: SWIRL_PRIVATE_POOL_ADDRESS,
      abi: SWIRL_PRIVATE_POOL_ABI,
      functionName: 'deposit',
      args: [commitment],
      value: denomination + protocolFee,
      account: address,
    });

    return await writeContract(walletClient.data, request);
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
    if (!walletClient.data) {
      throw new Error('Wallet client not connected');
    }

    const { request } = await simulateContract(publicClient, {
      address: SWIRL_PRIVATE_POOL_ADDRESS,
      abi: SWIRL_PRIVATE_POOL_ABI,
      functionName: 'withdraw',
      args: [proof, root, nullifierHash, recipient],
      account: address,
    });

    return await writeContract(walletClient.data, request);

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
    isLoading: isLoadingDenomination || isLoadingRoot || isLoadingIndex || isLoadingMaxLeaves,
    refetchNextIndex,

    // Deposit state
    deposit,
    depositHash,
    isDepositing,
    isConfirming: isConfirmingDeposit,
    isConfirmed: isDepositConfirmed,
    depositError,

    // Withdraw state
    withdraw,
    withdrawHash,
    isWithdrawing,
    isConfirmingWithdraw,
    isWithdrawConfirmed,
    withdrawError,
  };
}
