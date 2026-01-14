import { Toaster } from 'react-hot-toast'
import { Header, Hero, Footer, FAQList } from '@/components'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <div className="min-h-screen h-screen flex flex-col">
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#141414',
            color: '#888888',
            border: '1px solid rgba(0, 211, 149, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: "Sora, sans-serif",
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
      <main className="flex-1">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/faq" element={<FAQList />} />
          </Routes>
        </BrowserRouter >
      </main>
      <Footer />
    </div>
  )
}

export default App
