import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useCommitmentStore } from '../stores/commitmentStore'
import { useIndexer } from '../hooks/useIndexer'
import { useSwirlPool } from '../hooks/useSwirlPool'
import { compute33 } from '../scripts/compute33.mjs'
import { generateProof } from '../helpers/generateProof'
import { useAccount } from 'wagmi'
import { Button } from './ui/Button'

export const WithdrawButton = () => {
  const { commitmentData, decodeData, error } = useCommitmentStore()
  const { fetchCommitments, loading: indexerLoading } = useIndexer()
  const { withdraw, isWithdrawing, isConfirmingWithdraw, isWithdrawConfirmed, withdrawError } = useSwirlPool()
  const { address } = useAccount()
  const [encodedInput, setEncodedInput] = useState('')
  const [isGeneratingProof, setIsGeneratingProof] = useState(false)

  // Auto-decode when input changes
  useEffect(() => {
    if (encodedInput.trim()) {
      try {
        decodeData(encodedInput)
      } catch (err) {
        console.error('Decoding error:', err)
      }
    }
  }, [encodedInput, decodeData])

  const handleWithdraw = async () => {
    if (!commitmentData || !encodedInput) {
      toast.error('Please paste and decode your code first!')
      return
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
        address
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

  // Show toast when withdrawal is confirmed
  useEffect(() => {
    if (isWithdrawConfirmed) {
      toast.success('Withdrawal successful!')
    }
  }, [isWithdrawConfirmed])

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
    <div className="flex flex-col gap-5 sm:gap-6 flex-1">
      {/* Withdrawal code input */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#888888]">
          Withdrawal Code
        </label>
        <textarea
          value={encodedInput}
          onChange={(e) => setEncodedInput(e.target.value)}
          placeholder="Paste the code you saved after making your deposit..."
          className="input min-h-[100px] sm:min-h-[120px] font-mono text-[11px] sm:text-xs resize-y"
        />
      </div>

      {/* Withdraw button */}
      <Button
        onClick={handleWithdraw}
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

    </div>
  )
}