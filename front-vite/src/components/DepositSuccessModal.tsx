import { useCommitmentStore } from '../stores/commitmentStore'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'

interface DepositSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  encodedData: string
}

export function DepositSuccessModal({ isOpen, onClose, encodedData }: DepositSuccessModalProps) {
  const { copyToClipboard, copySuccess } = useCommitmentStore()

  if (!isOpen) return null

  const handleCopy = async () => {
    await copyToClipboard()
  }

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-[10px] flex items-center justify-center z-[9999] p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="card-flat max-w-[550px] w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 211, 149, 0.25)' }}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00FFB3 0%, #00D395 100%)', color: '#0A0A0A' }}
          >
            ✓
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] sm:text-[20px] font-bold" style={{ letterSpacing: '-0.5px' }}>
              Save Your Withdrawal Code
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          {/* Warning */}
          <p className="text-[13px] sm:text-[14px] text-[#888888] leading-relaxed">
            ⚠️ <strong className="text-red-300">Important:</strong> Without this code you will not be able to withdraw
            your funds. Save it securely.
          </p>

          {/* Encoded Data */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#666666]">
              Withdrawal Code
            </label>
            <textarea
              readOnly
              value={encodedData}
              className="input min-h-[90px] font-mono text-[11px] resize-y leading-relaxed text-[#00FFB3] break-all"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>

          {/* Copy Button */}
          <Button onClick={handleCopy} variant="primary">
            {copySuccess ? (
              <>
                <Icon name="check" size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Icon name="copy" size={16} />
                <span>Copy Code</span>
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/5 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
