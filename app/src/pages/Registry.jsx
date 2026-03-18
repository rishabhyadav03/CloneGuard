import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { getProgram } from '../utils/anchor'

export default function Registry() {
  const wallet = useWallet()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchApps() {
    if (!wallet.connected) return
    setLoading(true)
    try {
      const program = getProgram(wallet)
      const accounts = await program.account.appRegistry.all()
      setApps(accounts)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { fetchApps() }, [wallet.connected])

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Public Registry</h1>
          <p className="text-gray-500 mt-1">All genuine apps registered on-chain</p>
        </div>
        {wallet.connected && (
          <button onClick={fetchApps} className="text-sm text-blue-600 hover:underline">Refresh</button>
        )}
      </div>

      {!wallet.connected ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-700 mb-4">Connect wallet to view registry</p>
          <WalletMultiButton />
        </div>
      ) : loading ? (
        <p className="text-gray-400 text-center py-12">Loading registry...</p>
      ) : apps.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No apps registered yet</p>
      ) : (
        <div className="space-y-4">
          {apps.map((a, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{a.account.appName}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">v{a.account.version}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  a.account.isFlagged ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {a.account.isFlagged ? 'Flagged' : 'Genuine'}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <span>Developer: <span className="font-mono">{a.account.developer.toString().slice(0,16)}...</span></span>
                <span>Verifications: {a.account.verifyCount?.toString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
