import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useCommitmentStore } from '../stores/commitmentStore'
import { useIndexer } from '../hooks/useIndexer'
import { useSwirlPool } from '../hooks/useSwirlPool'
import { compute33 } from '../scripts/compute33.mjs'
import { generateProof } from '../helpers/generateProof'
import { useAccount } from 'wagmi'
import { Button } from './ui/Button'
import { isAddress, type Address } from 'viem'
import { WithdrawSuccessModal } from './WithdrawSuccessModal'

export const WithdrawButton = () => {
  const { commitmentData, decodeData, error } = useCommitmentStore()
  const { fetchCommitments, loading: indexerLoading } = useIndexer()
  const { withdraw, isWithdrawing, isConfirmingWithdraw, isWithdrawConfirmed, withdrawError, withdrawHash } = useSwirlPool()
  const { address } = useAccount()
  const [encodedInput, setEncodedInput] = useState('')
  const [recipientAddress, setRecipientAddress] = useState<Address | string>('')
  const [isGeneratingProof, setIsGeneratingProof] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Auto-decode when input changes with debounce
  useEffect(() => {
    if (!encodedInput.trim()) return

    const timer = setTimeout(() => {
      try {
        decodeData(encodedInput)
      } catch (err) {
        console.error('Decoding error:', err)
        toast.error('Invalid encoded note format')
      }
    }, 3000) // 3 segundos após parar de digitar

    return () => clearTimeout(timer)
  }, [encodedInput])

  // Validate recipient address with debounce
  useEffect(() => {
    if (!recipientAddress) return

    const timer = setTimeout(() => {
      if (!isAddress(recipientAddress)) {
        toast.error('Not a valid address')
      }
    }, 3000) // 3 segundos após parar de digitar

    return () => clearTimeout(timer)
  }, [recipientAddress])

  const handleWithdraw = async (recipientAddress?: Address | string) => {
    if (!commitmentData || !encodedInput) {
      toast.error('Please paste and decode your code first!')
      return
    }

    if (recipientAddress) {
      if (!isAddress(recipientAddress)) {
        return;
      }
    }

    try {
      setIsGeneratingProof(true)

      // 1. Fetch commitments from indexer (0 to leafIndex)
      console.log(`\n🔍 Fetching commitments from leafIndex 0 to ${commitmentData.leafIndex}...`)

      const deposits = await fetchCommitments(commitmentData.leafIndex)

      if (!deposits || deposits.length === 0) {
        throw new Error('No commitments found in indexer')
      }

      // Validate commitment order
      for (let i = 0; i < deposits.length; i++) {
        if (deposits[i].leafIndex !== i) {
          throw new Error(`Commitments out of order! Expected leafIndex ${i}, got ${deposits[i].leafIndex}`)
        }
      }

      console.log(`✅ Found ${deposits.length} commitments`)

      // 2. Convert to commitment strings array
      const commitments = deposits.map((d) => d.commitment)

      // 3. Generate proof inputs with compute33
      console.log('\n🌳 Generating proof inputs...')

      // @ts-ignore - compute33.mjs exports function with 2 parameters
      const inputs = await compute33(commitments, encodedInput)

      console.log('✅ Proof inputs generated successfully!')

      // 4. Generate ZK proof
      console.log('\n⚡ Generating ZK proof...')

      // @ts-ignore - inputs has required fields
      const proof = await generateProof(inputs)

      console.log('✅ ZK proof generated successfully!')

      // 5. Call withdraw on contract
      console.log('\n📤 Calling withdraw on contract...')

      if (!address) {
        throw new Error('Connect your wallet first!')
      }

      // @ts-ignore - correct types at runtime
      await withdraw(
        proof.proof as `0x${string}`,
        // @ts-ignore
        inputs.root_bytes32 as `0x${string}`,
        // @ts-ignore
        inputs.nullifier_hash_bytes32 as `0x${string}`,
        recipientAddress ? recipientAddress as Address : address
      )

      console.log('✅ Withdrawal transaction submitted!')
      toast.success('Transaction sent! Waiting for confirmation...')
    } catch (err: any) {
      console.error('❌ Error:', err)
      toast.error(err.message || 'Unknown error')
    } finally {
      setIsGeneratingProof(false)
    }
  }

  // Show modal when withdrawal is confirmed
  useEffect(() => {
    if (isWithdrawConfirmed && withdrawHash) {
      toast.success('Withdrawal successful!')
      setShowModal(true)
    }
  }, [isWithdrawConfirmed, withdrawHash])

  // Show error toast
  useEffect(() => {
    if (withdrawError) {
      toast.error(`Withdrawal failed: ${withdrawError.message}`)
    }
  }, [withdrawError])

  // Show error toast for decoding errors
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  return (
    <div className="flex flex-col gap-4 sm:gap-5 flex-1">
      {/* Withdrawal code input */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#888888]">
          Encoded Note
        </label>

        <textarea
          value={encodedInput}
          onChange={(e) => setEncodedInput(e.target.value)}
          placeholder="Paste the code you saved after making your deposit..."
          className="input min-h-[90px] sm:min-h-[100px] font-mono text-[11px] sm:text-xs resize-y"
        />

        <label className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#888888]">
          Recipient Address
        </label>
        <textarea
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="0x..."
          className="input font-mono text-[11px] sm:text-xs resize-y"
        />

      </div>

      {/* Withdraw button */}
      <Button
        onClick={() => handleWithdraw(recipientAddress)}
        disabled={!commitmentData || isGeneratingProof || indexerLoading || isWithdrawing || isConfirmingWithdraw || isWithdrawConfirmed}
        variant="primary"
        isLoading={isGeneratingProof || isWithdrawing || isConfirmingWithdraw}
      >
        {isGeneratingProof
          ? 'Generating Proof...'
          : isWithdrawing
            ? 'Awaiting Wallet Approval...'
            : isConfirmingWithdraw
              ? 'Confirming on Blockchain...'
              : isWithdrawConfirmed
                ? '✓ Withdrawal Complete!'
                : commitmentData
                  ? 'Withdraw 1 ETH'
                  : 'Paste Code First'}
      </Button>

      {/* Modal for withdrawal success */}
      <WithdrawSuccessModal
        recipientAddress={recipientAddress || address || ''}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        transactionHash={withdrawHash || ''}
      />
    </div>
  )
}