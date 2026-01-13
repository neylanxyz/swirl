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
      onClick={(e) => {
        // Só fecha se clicar no overlay (fundo) e se já copiou
        if (e.target === e.currentTarget) {
          handleClose()
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
            Save Your Encoded Note
          </h2>

          {/* Botão X para fechar */}
          <button
            onClick={handleClose}
            disabled={!copySuccess}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              copySuccess
                ? 'hover:bg-white/5 text-[#888888] hover:text-white cursor-pointer'
                : 'text-[#444444] cursor-not-allowed opacity-40'
            }`}
            title={copySuccess ? 'Close' : 'Copy the code first to close'}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 flex flex-col gap-5">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/15">
            <span className="text-red-400 text-[14px] flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-[12px] sm:text-[13px] text-[#888888] leading-relaxed">
              Without this code you will <span className="text-red-300 font-medium">never</span> be able to withdraw your funds.
              Save it securely.
            </p>
          </div>

          {/* Encoded Data */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-[#666666]">
              Encrypted Note
            </label>
            <textarea
              readOnly
              value={encodedData}
              className="input min-h-[100px] font-mono text-[11px] sm:text-[12px] resize-y leading-relaxed text-[#00FFB3] break-all"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>

          {/* Copy Button */}
          <Button onClick={handleCopy} variant="primary">
            {copySuccess ? (
              <>
                <Icon name="check" size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Icon name="copy" size={14} />
                <span>Copy Code</span>
              </>
            )}
          </Button>

          {/* Status message */}
          {!copySuccess && (
            <p className="text-[11px] text-[#666666] text-center">
              Copy the code to close this window
            </p>
          )}
          {copySuccess && (
            <p className="text-[11px] text-[#00FFB3] text-center flex items-center justify-center gap-1.5">
              <Icon name="check" size={11} />
              Code saved! You can now close this window
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
