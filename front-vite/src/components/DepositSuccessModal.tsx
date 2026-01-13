import { useCommitmentStore } from '../stores/commitmentStore'
import { Button, Icon } from '@/components/ui'
import { createPortal } from 'react-dom'

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

  const handleClose = () => {
    if (!copySuccess) {
      return // Não permite fechar sem copiar
    }
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[99999] p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="card-flat max-w-[580px] w-full max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 211, 149, 0.3), 0 0 0 1px rgba(0, 255, 179, 0.1)',
        }}
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
              Save Your Encoded Note
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          {/* Warning */}
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-[13px] sm:text-[14px] text-red-300 leading-relaxed font-medium flex items-start gap-2">
              <span className="text-[16px]">⚠️</span>
              <span>
                <strong>Critical:</strong> Without this code you will <strong>never</strong> be able to withdraw your funds.
                Save it securely before closing this window.
              </span>
            </p>
          </div>

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

      </div>
    </div>,
    document.body
  )
}
