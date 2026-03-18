import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { SystemProgram } from '@solana/web3.js'
import { getProgram, getAppRegistryPDA, getDeveloperPDA, hashAPK } from '../utils/anchor'
import { signAPKHash, verifySignature } from '../utils/crypto'

export default function Register() {
  const wallet = useWallet()
  const [file, setFile] = useState(null)
  const [appName, setAppName] = useState('')
  const [version, setVersion] = useState('')
  const [status, setStatus] = useState('')
  const [txSig, setTxSig] = useState('')
  const [loading, setLoading] = useState(false)
  const [sigHex, setSigHex] = useState('')

  async function handleRegister() {
    if (!file || !appName || !version || !wallet.connected) return
    setLoading(true)
    setStatus('')
    setTxSig('')
    setSigHex('')
    try {
      // Step 1 — Hash the APK
      const hashArray = await hashAPK(file)
      console.log('APK Hash:', hashArray)

      // Step 2 — Sign the hash with Phantom wallet (Ed25519)
      const signatureArray = await signAPKHash(hashArray, wallet.signMessage)
      const sigHexStr = signatureArray.map(b => b.toString(16).padStart(2,'0')).join('')
      setSigHex(sigHexStr)
      console.log('Ed25519 Signature:', sigHexStr)

      // Step 3 — Verify signature locally before sending on-chain
      const pubkeyBytes = wallet.publicKey.toBytes()
      const isValid = verifySignature(hashArray, signatureArray, pubkeyBytes)
      if (!isValid) throw new Error('Signature verification failed locally')
      console.log('Signature verified locally ✅')

      // Step 4 — Register on Solana with hash + signature
      const hashBuffer = Buffer.from(hashArray)
      const sigBuffer = Buffer.from(signatureArray)
      const program = getProgram(wallet)
      const appPDA = await getAppRegistryPDA(hashArray)
      const devPDA = await getDeveloperPDA(wallet.publicKey)

      const tx = await program.methods
        .registerApp([...hashBuffer], appName, version, [...sigBuffer])
        .accounts({
          appRegistry: appPDA,
          developerAccount: devPDA,
          developer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      setTxSig(tx)
      setStatus('success')
    } catch (e) {
      console.error('Full error:', e)
      setStatus('error: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Register App</h1>
      <p className="text-gray-500 mb-8">Register your APK hash + Ed25519 signature on Solana</p>

      {!wallet.connected ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-700 mb-4">Connect your wallet to register</p>
          <WalletMultiButton />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App Name</label>
            <input value={appName} onChange={e => setAppName(e.target.value)}
              placeholder="e.g. Calculator"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
            <input value={version} onChange={e => setVersion(e.target.value)}
              placeholder="e.g. 1.0.0"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">APK File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => document.getElementById('reg-apk').click()}>
              <input id="reg-apk" type="file" accept=".apk" className="hidden"
                onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div>
                  <p className="text-green-600 font-medium">📦 {file.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{(file.size/1024/1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-2">📁</p>
                  <p className="text-gray-500">Click to upload APK</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-600 font-medium mb-1">🔐 Cryptographic Process</p>
            <p className="text-xs text-blue-500">1. SHA256 hash of APK computed in browser</p>
            <p className="text-xs text-blue-500">2. Hash signed with your Ed25519 wallet key</p>
            <p className="text-xs text-blue-500">3. Hash + signature stored on Solana blockchain</p>
          </div>

          <button onClick={handleRegister}
            disabled={!file || !appName || !version || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors">
            {loading ? 'Signing & Registering...' : 'Sign & Register on Blockchain'}
          </button>

          {sigHex && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Ed25519 Signature</p>
              <p className="font-mono text-xs text-gray-600 break-all">{sigHex}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 font-semibold">✅ App registered with cryptographic signature!</p>
              <a href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                target="_blank" rel="noreferrer"
                className="text-blue-500 text-xs font-mono underline mt-1 block break-all">{txSig}</a>
            </div>
          )}
          {status.startsWith('error') && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{status}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}