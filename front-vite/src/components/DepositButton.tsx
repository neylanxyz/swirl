import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useSwirlPool } from '@/hooks/useSwirlPool'
import { getPoseidon, randField, toBytes32 } from '@/helpers/zk'
import { useCommitmentStore } from '@/stores/commitmentStore'
import { DepositSuccessModal } from '@/components'
import { Button, Icon } from '@/components/ui'

export function DepositButton() {
  const { deposit, isDepositing, isConfirming, isConfirmed, depositError, isConnected, nextIndex, refetchNextIndex } = useSwirlPool()
  const [showModal, setShowModal] = useState(false)
  const { encodeData, encodedData } = useCommitmentStore()

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
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

      // Encode and store commitment data (includes leafIndex)
      encodeData({
        secret,
        nullifier,
        leafIndex,
      })

      toast.success('Transaction sent! Waiting for confirmation...')
    } catch (err) {
      console.error('Deposit error:', err)
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Show toast when deposit is confirmed and refetch nextIndex
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Deposit successful!')
      // Refetch nextIndex to get updated value for next deposit
      refetchNextIndex()
    }
  }, [isConfirmed, refetchNextIndex])

  // Show error toast
  useEffect(() => {
    if (depositError) {
      toast.error(`Deposit failed`)
    }
  }, [depositError])

  // Open modal when deposit is confirmed and data is encoded
  useEffect(() => {
    if (isConfirmed && encodedData) {
      setShowModal(true)
    }
  }, [isConfirmed, encodedData])

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
        disabled={isDepositing || isConfirming || !isConnected}
        variant="primary"
        isLoading={isDepositing || isConfirming}
      >
        {isDepositing ? 'Depositing...' : isConfirming ? 'Confirming...' : 'Deposit 1 MNT'}
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
