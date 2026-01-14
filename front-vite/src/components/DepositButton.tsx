import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useDepositTransaction, DepositStep } from '@/hooks/useDepositTransaction'
import { getPoseidon, randField, toBytes32 } from '@/helpers/zk'
import { useCommitmentStore } from '@/stores/commitmentStore'
import { DepositSuccessModal, Label } from '@/components'
import { Button, Icon } from '@/components/ui'
import { useSwirlPool } from '@/hooks'
import { useAccount } from 'wagmi'
import { parseViemError } from '@/helpers/parseViemError'

function textDepositLabels({ step }: { step: DepositStep }) {
  switch (step) {
    case DepositStep.GENERATING_COMMITMENT:
      return "Generating Commitment Data ..."
    case DepositStep.SIMULATING:
      return "Simulating Transaction..."
    case DepositStep.AWAITING_SIGNATURE:
      return "Awaiting Signature..."
    case DepositStep.SENDING_TRANSACTION:
      return "Sending Transaction onchain..."
    case DepositStep.CONFIRMING_TRANSACTION:
      return "Confirming Transaction..."
    case DepositStep.SUCCESS:
      return "Deposit successful!"
    case DepositStep.ERROR:
      return "Deposit error!"
    default:
      return "Deposit 1 MNT"
  }
}

export function DepositButton() {
  const {
    step,
    txHash,
    executeDeposit,
    isLoading,
    isSuccess,
    isError,
    reset,
  } = useDepositTransaction();

  const { nextIndex, refetchNextIndex } = useSwirlPool();
  const { isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const { encodeData, encodedData } = useCommitmentStore();

  // Show toast when deposit is confirmed and refetch nextIndex
  useEffect(() => {
    if (step === "SUCCESS" || isSuccess) {
      toast.success('Deposit successful!')
      // Refetch nextIndex to get updated value for next deposit
      refetchNextIndex()
    }
  }, [isSuccess, refetchNextIndex])

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      await executeDeposit(async () => {
        const leafIndex = Number(nextIndex || 0)
        if (!nextIndex) {
          console.warn('nextIndex not available, using 0 as fallback')
        }

        const poseidon = await getPoseidon()
        const secret = randField()
        const nullifier = randField()
        const commitment = poseidon([secret, nullifier])
        const commitmentBytes32 = toBytes32(poseidon.F.toObject(commitment)) as `0x${string}`

        encodeData({
          secret,
          nullifier,
          leafIndex,
        })

        return commitmentBytes32;
      });
    } catch (err) {
      // Agora o erro chega aqui corretamente porque o hook fez "throw err"
      const parsed = parseViemError(err);

      if (parsed.type === 'user_rejected') {
        toast.error('User rejected the transaction.');
      } else if (parsed.type === 'revert') {
        if (parsed.reason === 'this address is blacklisted and cannot deposit') {
          toast.error('Blacklisted address.');
        } else {
          toast.error(`Transaction reverted: ${parsed.reason}`);
        }
      } else {
        toast.error('Unknown error occurred');
      }

      // IMPORTANTE: Resetar o estado após um tempo curto ou imediatamente
      // para que o usuário veja a mensagem de erro e o botão volte ao normal
      setTimeout(() => {
        reset();
      }, 3000); // Volta para "Deposit 1 MNT" após 3 segundos
    }
  }

  if (isSuccess && !showModal && encodedData) {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  }

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

      <Button
        onClick={handleDeposit}
        disabled={isLoading || isSuccess || isError}
        variant="primary"
        isLoading={isLoading}
      >
        <Label text={textDepositLabels({ step: step })} />
      </Button>

      <DepositSuccessModal
        isOpen={showModal}
        onClose={handleCloseModal}
        encodedData={encodedData}
      />
    </div>
  )
}