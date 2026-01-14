import { useAccount, useReadContract } from 'wagmi';
import { type Address, type Hash, type Hex } from 'viem';
import { SWIRL_PRIVATE_POOL_ADDRESS, SWIRL_PRIVATE_POOL_ABI } from '../helpers/contract';
import { simulateContract, writeContract } from 'viem/actions';
import { publicClient } from '@/config';
import { useWalletClient } from 'wagmi'
import { useState } from 'react';

/**
 * Custom hook for interacting with Swirl Private Pool contract
 * Provides typed access to contract reads and writes
 */
type TxStage =
  | 'idle'
  | 'generating'
  | 'signing'
  | 'submitted'
  | 'confirming'
  | 'confirmed'
  | 'error';


export function useSwirlPool() {
  const [depositTxStage, setDepositTxStage] = useState<TxStage>('idle');
  const [withdrawTxStage, setWithdrawTxStage] = useState<TxStage>('idle');

  const [depositTxHash, setDepositTxHash] = useState<Hash | undefined>();
  const [withdrawTxHash, setWithdrawTxHash] = useState<Hash | undefined>();


  const isGenerationCommitmentBytes32 = depositTxStage === 'generating';
  const isDepositing = depositTxStage === 'signing';
  const isDepositSubmitted = depositTxStage === 'submitted';
  const isDepositConfirming = depositTxStage === 'confirming';
  const isDepositConfirmed = depositTxStage === 'confirmed';
  const isDepositError = depositTxStage === 'error';


  const isWithdrawing = withdrawTxStage === 'signing';
  const isWithdrawSubmitted = withdrawTxStage === 'submitted';
  const isWithdrawConfirming = withdrawTxStage === 'confirming';
  const isWithdrawConfirmed = withdrawTxStage === 'confirmed';
  const isWithdrawError = withdrawTxStage === 'error';

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


    try {
      setDepositTxStage('signing');

      const { request } = await simulateContract(publicClient, {
        address: SWIRL_PRIVATE_POOL_ADDRESS,
        abi: SWIRL_PRIVATE_POOL_ABI,
        functionName: 'deposit',
        args: [commitment],
        value: denomination + protocolFee,
        account: address,
      });

      const hash = await writeContract(walletClient.data, request);
      setDepositTxHash(hash);
      setDepositTxStage('submitted');

      setDepositTxStage('confirming');

      await publicClient.waitForTransactionReceipt({ hash });

      setDepositTxStage('confirmed');
      return hash;
    } catch (err) {
      setDepositTxStage('error');
      throw err;
    };

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

    try {
      setWithdrawTxStage('signing');

      const { request } = await simulateContract(publicClient, {
        address: SWIRL_PRIVATE_POOL_ADDRESS,
        abi: SWIRL_PRIVATE_POOL_ABI,
        functionName: 'withdraw',
        args: [proof, root, nullifierHash, recipient],
        account: address,
      });

      const hash = await writeContract(walletClient.data, request);
      setWithdrawTxHash(hash);
      setWithdrawTxStage('submitted');

      setWithdrawTxStage('confirming');

      await publicClient.waitForTransactionReceipt({ hash });

      setWithdrawTxStage('confirmed');
      return hash;
    } catch (err) {
      setWithdrawTxStage('error');
      throw err;
    }

  };

  return {
    // Account
    address,
    isConnected,

    // Contract (read)
    denomination,
    currentRoot,
    nextIndex,
    maxLeaves,
    isLoading:
      isLoadingDenomination ||
      isLoadingRoot ||
      isLoadingIndex ||
      isLoadingMaxLeaves,
    refetchNextIndex,

    // Deposit
    deposit,
    isGenerationCommitmentBytes32,
    isDepositing,
    isDepositSubmitted,
    isDepositConfirming,
    isDepositConfirmed,
    isDepositError,
    depositTxHash,

    // Withdraw
    withdraw,
    isWithdrawing,
    isWithdrawSubmitted,
    isWithdrawConfirming,
    isWithdrawConfirmed,
    isWithdrawError,
    withdrawTxHash
  };

}
