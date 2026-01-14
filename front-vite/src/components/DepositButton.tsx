import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useSwirlPool } from '@/hooks/useSwirlPool'
import { getPoseidon, randField, toBytes32 } from '@/helpers/zk'
import { useCommitmentStore } from '@/stores/commitmentStore'
import { DepositSuccessModal, DepositButtonLabel } from '@/components'
import { Button, Icon } from '@/components/ui'
import { parseViemError } from '@/helpers/parseViemError'

export function DepositButton() {
  const { deposit, depositTxHash, isDepositing, isDepositSubmitted, isDepositConfirming, isDepositConfirmed, isConnected, nextIndex, refetchNextIndex } = useSwirlPool()
  const [showModal, setShowModal] = useState(false)
  const [isGenerationCommitmentBytes32, setisGenerationCommitmentBytes32] = useState(false)
  const { encodeData, encodedData } = useCommitmentStore()

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setisGenerationCommitmentBytes32(true)
      // Get leafIndex from nextIndex
      const leafIndex = Number(nextIndex || 0)
      if (!nextIndex) {
        console.warn('nextIndex not available, using 0 as fallback')
      }
      // Generate ZK commitment
      const poseidon = await getPoseidon()
      const secret = randField() // BigInt
      const nullifier = randField() // BigInt
      const commitment = poseidon([secret, nullifier]) // BigInt
      const commitmentBytes32 = toBytes32(poseidon.F.toObject(commitment)) as `0x${string}`

      // Call deposit function
      await deposit(commitmentBytes32)
      setisGenerationCommitmentBytes32(false)

      // Encode and store commitment data (includes leafIndex)
      encodeData({
        secret,
        nullifier,
        leafIndex,
      })

      toast.success('Transaction sent! Waiting for confirmation...')
    } catch (err) {
      const parsed = parseViemError(err);

      if (parsed.type === 'user_rejected') {
        toast.error('User rejected the transaction.');
        return;
      }

      if (parsed.type === 'revert') {
        if (parsed.reason === 'this address is blacklisted and cannot deposit') {
          toast.error('Blacklisted address.');
          return;
        }
      }

      toast.error('Unknown error');
      console.log("erorr", err)
    }
  }

  // Show toast when deposit is confirmed and refetch nextIndex
  useEffect(() => {
    if (isDepositConfirmed) {
      toast.success('Deposit successful!')
      // Refetch nextIndex to get updated value for next deposit
      refetchNextIndex()
    }
  }, [isDepositConfirmed, refetchNextIndex])

  // Open modal when deposit is confirmed and data is encoded
  useEffect(() => {
    if (isDepositConfirmed && encodedData) {
      setShowModal(true)
    }
  }, [isDepositConfirmed, encodedData])

  return (
    <div className="flex flex-col gap-4 sm:gap-5 flex-1">

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon name="shield" size={14} color="#00FFB3" className="flex-shrink-0" />
          <h4 className="text-[11px] sm:text-[12px] font-semibold text-[#00FFB3] uppercase tracking-wider">
            How it Works
          </h4>
        </div>
        <div className="flex flex-col gap-2 text-[10px] sm:text-[11px] text-[#888888] leading-relaxed">
          <p>• Deposit 1 MNT to break the on-chain link between addresses</p>
          <p>• Receive an encrypted note to withdraw privately later</p>
        </div>
      </div>

      {/* Deposit Button */}
      <Button
        onClick={handleDeposit}
        disabled={isDepositing || isDepositConfirming || !isConnected}
        variant="primary"
        isLoading={isDepositing || isDepositConfirming}
      >
        <DepositButtonLabel
          isGenerationCommitmentBytes32={isGenerationCommitmentBytes32}
          isDepositing={isDepositing}
          isDepositSubmitted={isDepositSubmitted}
          isConfirming={isDepositConfirming}
          isDepositConfirmed={isDepositConfirmed}
          depositTxHash={depositTxHash}
        />
      </Button>

      {/* Modal for encoded data */}
      <DepositSuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        encodedData={encodedData}
      />
    </div>
  )
}
