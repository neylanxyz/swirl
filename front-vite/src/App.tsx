import { Toaster } from 'react-hot-toast'
import { useSwirlPool } from './hooks/useSwirlPool'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ActionCard } from './components/ActionCard'
import { Features } from './components/Features'
import { Footer } from './components/Footer'

function App() {
  const { isConnected } = useSwirlPool()

  return (
    <div className="min-h-screen h-screen flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#141414',
            color: '#fff',
            border: '1px solid rgba(0, 211, 149, 0.2)',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#00FFB3',
              secondary: '#141414',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#141414',
            },
          },
        }}
      />

      <Header />

      <main className="flex-1 overflow-y-auto">
        <Hero />
        <ActionCard isConnected={isConnected} />
        <Features />
        <Footer />
      </main>

    </div>
  )
}

export default App
