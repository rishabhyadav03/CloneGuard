import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@solana/wallet-adapter-react-ui/styles.css'
import { NETWORK } from './utils/constants'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Register from './pages/Register'
import Verify from './pages/Verify'
import Registry from './pages/Registry'
import Report from './pages/Report'

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={NETWORK}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/registry" element={<Registry />} />
                <Route path="/report" element={<Report />} />
              </Routes>
            </div>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
