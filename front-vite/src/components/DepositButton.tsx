import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useSwirlPool } from '../hooks/useSwirlPool'
import { getPoseidon, randField, toBytes32 } from '../helpers/zk'
import { useCommitmentStore } from '../stores/commitmentStore'
import { DepositSuccessModal } from './DepositSuccessModal'
import { Button } from './ui/Button'
import { InfoBox } from './ui/InfoBox'
import { Icon } from './ui/Icon'

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
      toast.error(`Deposit failed: ${depositError.message}`)
    }
  }, [depositError])

  // Open modal when deposit is confirmed and data is encoded
  useEffect(() => {
    if (isConfirmed && encodedData) {
      setShowModal(true)
    }
  }, [isConfirmed, encodedData])

  return (
    <div className="flex flex-col gap-5 sm:gap-6 flex-1">
      {/* Info Box - ASP Screening */}
      <InfoBox
        icon={<Icon name="shield" size={18} color="#00FFB3" className="flex-shrink-0" />}
        variant="default"
      >
        <div className="flex flex-col gap-2">
          <h4 className="text-[12px] sm:text-[13px] font-semibold text-[#00FFB3]">ASP Screening Active</h4>
          <p className="text-[11px] sm:text-[12px] text-[#888888] leading-relaxed">
            Your deposit will be screened by the Association Set Provider. Only clean funds enter the privacy pool.
          </p>
        </div>
      </InfoBox>

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
