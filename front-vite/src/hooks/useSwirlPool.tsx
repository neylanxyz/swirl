import { useAccount, useReadContract } from 'wagmi';
import { type Address } from 'viem';
import { SWIRL_PRIVATE_POOL_ADDRESS, SWIRL_PRIVATE_POOL_ABI } from '../helpers/contract';
import { simulateContract, writeContract } from 'viem/actions';
import { publicClient } from '@/config';
import { useWalletClient } from 'wagmi';

/**
 * Hook de infraestrutura.
 * Fornece acesso aos dados do contrato e funções que executam a escrita.
 * Não gerencia estados de UI (loading, success), apenas executa.
 */
export function useSwirlPool() {
  const { address, isConnected } = useAccount();
  const walletClient = useWalletClient({ account: address });

  // --- Reads ---
  const { data: denomination } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'DENOMINATION',
  });

  const { data: currentRoot } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'currentRoot',
  });

  const { data: nextIndex, refetch: refetchNextIndex } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'nextIndex',
  });

  const { data: protocolFee } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'PROTOCOL_FEE',
  });

  const { data: maxLeaves } = useReadContract({
    address: SWIRL_PRIVATE_POOL_ADDRESS,
    abi: SWIRL_PRIVATE_POOL_ABI,
    functionName: 'MAX_LEAVES',
  });

  // --- Writes Prontas (Actions) ---
  // Estas funções apenas executam a ação na blockchain. 
  // O estado é gerenciado pelo hook que as chamar (ex: useDepositTransaction).

  const depositAction = async (commitment: Address) => {
    if (!denomination || !protocolFee) throw new Error('Missing contract config');
    if (!walletClient.data) throw new Error('Wallet not connected');
    if (!address) throw new Error('Address not found');

    // 1. Simular
    const { request } = await simulateContract(publicClient, {
      address: SWIRL_PRIVATE_POOL_ADDRESS,
      abi: SWIRL_PRIVATE_POOL_ABI,
      functionName: 'deposit',
      args: [commitment],
      value: denomination + protocolFee,
      account: address,
    });

    // 2. Assinar e Enviar (Retorna o Hash imediatamente)
    const hash = await writeContract(walletClient.data, request);

    return hash;
  };

  const withdrawAction = async (
    proof: `0x${string}`,
    root: Address,
    nullifierHash: Address,
    recipient: Address
  ) => {
    if (!walletClient.data) throw new Error('Wallet not connected');
    if (!address) throw new Error('Address not found');

    const { request } = await simulateContract(publicClient, {
      address: SWIRL_PRIVATE_POOL_ADDRESS,
      abi: SWIRL_PRIVATE_POOL_ABI,
      functionName: 'withdraw',
      args: [proof, root, nullifierHash, recipient],
      account: address,
    });

    const hash = await writeContract(walletClient.data, request);
    return hash;
  };

  return {
    // Dados
    address,
    isConnected,
    denomination,
    currentRoot,
    nextIndex,
    protocolFee,
    maxLeaves,

    // Ações
    depositAction,
    withdrawAction,

    // Helpers
    refetchNextIndex
  };
}