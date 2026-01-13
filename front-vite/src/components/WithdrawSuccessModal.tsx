import { Button, Icon } from '@/components/ui'
import { createPortal } from 'react-dom'
import { zeroAddress, type Address } from 'viem'
import { CopyAndPasteButton } from '@/components'

interface WithdrawSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  transactionHash: string
  recipientAddress: string | Address
}

const EXPLORER_URL = 'https://sepolia.mantlescan.xyz'

export function WithdrawSuccessModal({ isOpen, onClose, transactionHash, recipientAddress = zeroAddress }: WithdrawSuccessModalProps) {
  if (!isOpen) return null

  const handleViewOnExplorer = () => {
    window.open(`${EXPLORER_URL}/tx/${transactionHash}`, '_blank', 'noopener,noreferrer')
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[99999] p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="card-flat max-w-[520px] w-full max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 211, 149, 0.25), 0 0 0 1px rgba(0, 255, 179, 0.08)',
        }}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[16px] sm:text-[18px] font-semibold text-white">
            Withdrawal Successful
          </h2>

          {/* Botão X para fechar */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/5 text-[#888888] hover:text-white cursor-pointer"
            title="Close"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 flex flex-col gap-5">
          {/* Success message */}
          <div className="flex flex-col gap-3 p-4 rounded-lg bg-[#00FFB3]/5 border border-[#00FFB3]/15">
            <div className="flex items-start gap-3">
              <span className="text-[#00FFB3] text-[14px] flex-shrink-0 mt-0.5">✓</span>
              <p className="text-[12px] sm:text-[13px] text-[#888888] leading-relaxed">
                Your withdrawal has been successfully processed.
              </p>
            </div>
          </div>
          {recipientAddress && recipientAddress !== '' && (
            <div className="flex flex-col gap-1.5 pl-7">
              <span className="text-[11px] text-[#666666] uppercase tracking-wider font-semibold">
                Recipient Address
              </span>
              <div className='flex gap-2 items-center'>
                <code className="text-[11px] text-[#00FFB3] font-mono break-all">
                  {recipientAddress}
                </code>
                <CopyAndPasteButton textToCopy={recipientAddress} />
              </div>
            </div>
          )}

          {/* View on Explorer Button */}
          <Button onClick={handleViewOnExplorer} variant="primary">
            <span>View on Explorer</span>
            <Icon name="externalLink" size={14} />
          </Button>

          {/* Close message */}
          <p className="text-[11px] text-[#00FFB3] text-center flex items-center justify-center gap-1.5">
            <Icon name="check" size={11} />
            Transaction confirmed on blockchain
          </p>
        </div>
      </div>
    </div >,
    document.body
  )
}
