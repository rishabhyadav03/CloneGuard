import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { getProgram, getAppRegistryPDA, hashAPK } from '../utils/anchor'
import { verifySignature } from '../utils/crypto'

export default function Verify() {
  const wallet = useWallet()
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null)
  const [appInfo, setAppInfo] = useState(null)
  const [hashHex, setHashHex] = useState('')
  const [sigValid, setSigValid] = useState(null)

  async function handleVerify() {
    if (!file || !wallet.connected) return
    setStatus('loading')
    setAppInfo(null)
    setSigValid(null)
    try {
      // Step 1 — Hash the APK
      const hashArray = await hashAPK(file)
      const hex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('')
      setHashHex(hex)

      // Step 2 — Fetch from blockchain
      const pda = await getAppRegistryPDA(hashArray)
      const program = getProgram(wallet)
      const account = await program.account.appRegistry.fetch(pda)

      // Step 3 — Verify Ed25519 signature
      const storedSig = account.signature
      const pubkeyBytes = account.developer.toBytes()
      const isValidSig = await verifySignature(hashArray, storedSig, pubkeyBytes)
      setSigValid(isValidSig)
      console.log('Signature valid:', isValidSig)

      if (account && account.isActive && !account.isFlagged && isValidSig) {
        setStatus('genuine')
        setAppInfo(account)
      } else {
        setStatus('clone')
      }
    } catch {
      setStatus('clone')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify APK</h1>
      <p className="text-gray-500 mb-8">SHA256 hash + Ed25519 signature verification</p>

      {!wallet.connected ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-700 mb-4">Connect your wallet to verify</p>
          <WalletMultiButton />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => document.getElementById('apk-input').click()}>
            <input id="apk-input" type="file" accept=".apk" className="hidden"
              onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div>
                <p className="text-green-600 font-medium">📦 {file.name}</p>
                <p className="text-gray-400 text-sm mt-1">{(file.size/1024/1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-4xl mb-2">📁</p>
                <p className="text-gray-500">Click to upload APK file</p>
              </div>
            )}
          </div>

          <button onClick={handleVerify}
            disabled={!file || status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors">
            {status === 'loading' ? 'Verifying...' : 'Verify APK'}
          </button>

          {hashHex && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">SHA256 Hash</p>
              <p className="font-mono text-xs text-gray-600 break-all">{hashHex}</p>
            </div>
          )}

          {sigValid !== null && (
            <div className={`rounded-xl p-3 flex items-center gap-2 ${sigValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <span>{sigValid ? '✅' : '❌'}</span>
              <p className={`text-sm font-medium ${sigValid ? 'text-green-700' : 'text-red-700'}`}>
                Ed25519 Signature {sigValid ? 'Valid' : 'Invalid'}
              </p>
            </div>
          )}

          {status === 'genuine' && appInfo && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✅</span>
                <span className="text-green-700 font-bold text-lg">Genuine App</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">App Name</span>
                  <span className="font-medium">{appInfo.appName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Version</span>
                  <span className="font-medium">{appInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verifications</span>
                  <span className="font-medium">{appInfo.verifyCount?.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Developer</span>
                  <span className="font-mono text-xs">{appInfo.developer?.toString().slice(0,16)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Signature</span>
                  <span className="font-mono text-xs text-green-600">Ed25519 ✅</span>
                </div>
              </div>
            </div>
          )}

          {status === 'clone' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <span className="text-red-700 font-bold text-lg">Clone / Fake App Detected</span>
              </div>
              <p className="text-red-600 text-sm">This APK is not registered or signature is invalid.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}