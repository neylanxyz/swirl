# useCommitmentStore (Zustand)

Store Zustand para gerenciar encode/decode de dados de commitment em base64.

## Fluxo de Uso

### 1. **DEPOSIT** - Após fazer o deposit
```typescript
import { useCommitmentStore } from './stores/commitmentStore';

function DepositComponent() {
    const { encodeData, encodedData, copyToClipboard } = useCommitmentStore();

    const handleAfterDeposit = (secret: bigint, nullifier: bigint, commitment: string) => {
        // Após o deposit bem-sucedido, encode os dados
        const encoded = encodeData({ secret, nullifier, commitment });

        // Mostra para o usuário e permite copiar
        console.log('Guarde este código:', encoded);
    };

    return (
        <div>
            {/* Seu componente de deposit */}

            {encodedData && (
                <div>
                    <h3>⚠️ IMPORTANTE: Guarde este código para fazer withdraw!</h3>
                    <textarea value={encodedData} readOnly />
                    <button onClick={copyToClipboard}>Copiar</button>
                </div>
            )}
        </div>
    );
}
```

### 2. **WITHDRAW** - Quando o usuário quiser sacar
```typescript
import { useCommitmentStore } from './stores/commitmentStore';

function WithdrawComponent() {
    const { decodeData, commitmentData, error } = useCommitmentStore();
    const [userInput, setUserInput] = useState('');

    const handleWithdraw = () => {
        try {
            // Decode os dados que o usuário salvou
            const data = decodeData(userInput);

            // Agora use data.secret, data.nullifier, data.commitment
            // para gerar a proof e fazer o withdraw
            generateProofAndWithdraw(data);
        } catch (err) {
            console.error('Código inválido:', err);
        }
    };

    return (
        <div>
            <h3>Fazer Withdraw</h3>
            <textarea
                placeholder="Cole aqui o código que você guardou após o deposit"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
            />
            <button onClick={handleWithdraw}>Decodar e Sacar</button>

            {error && <div>Erro: {error}</div>}

            {commitmentData && (
                <div>
                    <p>✓ Dados decodados com sucesso!</p>
                    <p>Secret: {commitmentData.secret.toString()}</p>
                    <p>Nullifier: {commitmentData.nullifier.toString()}</p>
                    <p>Commitment: {commitmentData.commitment}</p>
                </div>
            )}
        </div>
    );
}
```

## Integração com WithdrawButton

```typescript
import { useCommitmentStore } from '../stores/commitmentStore';

export function WithdrawButton() {
    const { decodeData, commitmentData } = useCommitmentStore();
    const [encodedInput, setEncodedInput] = useState('');

    const handleWithdraw = async () => {
        try {
            // 1. Decode os dados
            const data = decodeData(encodedInput);

            // 2. Gerar proof com os dados decodados
            const proof = await generateProof({
                secret: data.secret.toString(),
                nullifier: data.nullifier.toString(),
                commitment: data.commitment,
                // ... outros parâmetros (merkle_path, merkle_indices, root)
            });

            // 3. Fazer withdraw no contrato
            await contract.withdraw(proof, data.commitment);

        } catch (error) {
            console.error('Erro no withdraw:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Cole o código do seu deposit"
                value={encodedInput}
                onChange={e => setEncodedInput(e.target.value)}
            />
            <button onClick={handleWithdraw}>Withdraw</button>
        </div>
    );
}
```

## API da Store

### Estado
- `commitmentData: CommitmentData | null` - Dados decodados do commitment
- `encodedData: string` - String base64 encodada
- `error: string` - Mensagem de erro (se houver)

### Ações
- `encodeData(data: CommitmentData): string` - Encode dados para base64
- `decodeData(encoded: string): CommitmentData` - Decode base64 para dados
- `setCommitmentData(data: CommitmentData): void` - Set dados diretamente
- `copyToClipboard(): Promise<boolean>` - Copia encodedData para clipboard
- `clearCommitmentData(): void` - Limpa apenas commitmentData
- `clearAll(): void` - Limpa tudo (dados, encoded, error)

## Funções Standalone

Você também pode usar as funções diretamente sem a store:

```typescript
import { encodeCommitmentData, decodeCommitmentData } from './stores/commitmentStore';

// Encode
const encoded = encodeCommitmentData({
    secret: 123n,
    nullifier: 456n,
    commitment: "0xabc..."
});

// Decode
const decoded = decodeCommitmentData(encoded);
```

## Vantagens do Zustand

- ✅ Estado global compartilhado entre componentes
- ✅ Não precisa de Context Provider
- ✅ Persistência automática (se configurar com persist middleware)
- ✅ DevTools integrado
- ✅ Performance otimizada

## Segurança

⚠️ **IMPORTANTE**: O código encodado contém os dados secretos (secret e nullifier).
- Nunca compartilhe este código com ninguém
- Nunca armazene em localStorage ou banco de dados público
- O usuário deve guardar em local seguro (papel, password manager, etc)
- Quem tiver este código pode fazer withdraw dos fundos!

## Exemplo Completo

Veja `CommitmentDataExample.tsx` para um exemplo visual completo do fluxo.
