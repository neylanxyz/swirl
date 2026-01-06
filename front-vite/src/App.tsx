import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { DepositButton } from './components/DepositButton'
import { useSwirlPool } from './hooks/useSwirlPool'

function App() {
  const { isConnected, address, currentRoot, nextIndex, denomination, isLoading } = useSwirlPool()

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Swirl Private Pool</h1>

      <div style={{ marginBottom: '2rem' }}>
        <ConnectButton />
      </div>

      {isConnected && address && (
        <div style={{
          marginBottom: '2rem',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #ddd',
        }}
        >
          <h2>Wallet Info</h2>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Chain:</strong> Mantle Sepolia Testnet</p>
        </div>
      )}

      {isConnected && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Pool Status</h2>
          {isLoading ? (
            <p>Loading pool data...</p>
          ) : (
            <div style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #ddd'
            }}>
              <p><strong>Current Root:</strong> {currentRoot || 'N/A'}</p>
              <p><strong>Next Index:</strong> {nextIndex?.toString() || 'N/A'}</p>
              <p><strong>Denomination:</strong> {denomination ? `${denomination.toString()} wei` : 'N/A'}</p>
            </div>
          )}
        </div>
      )}

      {isConnected && (
        <div>
          <h2>Deposit</h2>
          <DepositButton />
        </div>
      )}

      {!isConnected && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #ffc107'
        }}>
          <p>Please connect your wallet to interact with the pool.</p>
        </div>
      )}
    </div>
  )
}

export default App
