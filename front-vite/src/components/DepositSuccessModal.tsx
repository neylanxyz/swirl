import { useCommitmentStore } from '../stores/commitmentStore';

interface DepositSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    encodedData: string;
}

export function DepositSuccessModal({ isOpen, onClose, encodedData }: DepositSuccessModalProps) {
    const { copyToClipboard, copySuccess } = useCommitmentStore();

    if (!isOpen) return null;

    const handleCopy = async () => {
        await copyToClipboard();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                >
                    <div
                        style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: 'white'
                        }}
                    >
                        ✓
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                            Deposit Realizado com Sucesso!
                        </h2>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                            Seu depósito foi confirmado na blockchain
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                    {/* Warning Box */}
                    <div
                        style={{
                            backgroundColor: '#fef2f2',
                            border: '2px solid #ef4444',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1.5rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</span>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 'bold', color: '#991b1b' }}>
                                    IMPORTANTE: Guarde este código!
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f1d1d', lineHeight: '1.5' }}>
                                    Sem este código você <strong>NÃO PODERÁ</strong> fazer withdraw dos seus fundos.
                                    Este código contém suas chaves privadas e não pode ser recuperado.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Encoded Data */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#374151'
                            }}
                        >
                            Seu Código de Withdraw:
                        </label>
                        <textarea
                            readOnly
                            value={encodedData}
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '0.75rem',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                resize: 'vertical',
                                lineHeight: '1.5',
                                color: '#111827',
                                wordBreak: 'break-all'
                            }}
                            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        />
                    </div>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: copySuccess ? '#10b981' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginBottom: '1.5rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!copySuccess) {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!copySuccess) {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                            }
                        }}
                    >
                        {copySuccess ? (
                            <>
                                <span style={{ fontSize: '1.25rem' }}>✓</span>
                                Copiado!
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '1.25rem' }}>📋</span>
                                Copiar Código
                            </>
                        )}
                    </button>

                    {/* Instructions */}
                    <div
                        style={{
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1.5rem'
                        }}
                    >
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>
                            Onde guardar este código:
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#1e3a8a', lineHeight: '1.75' }}>
                            <li>Anote em um papel e guarde em local seguro</li>
                            <li>Use um gerenciador de senhas (1Password, LastPass, etc)</li>
                            <li>Salve em um arquivo criptografado</li>
                        </ul>
                        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: '#1e3a8a', fontWeight: '600' }}>
                            ⚠️ Nunca compartilhe este código com ninguém!
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem 1.5rem',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#4b5563';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#6b7280';
                        }}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
