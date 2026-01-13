import { Toaster } from 'react-hot-toast'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Footer } from './components/Footer'

function App() {

  return (
    <div className="min-h-screen h-screen flex flex-col">
      <Toaster
        position="bottom-right"
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
        <Footer />
      </main>

    </div>
  )
}

export default App
