import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { SystemProgram } from '@solana/web3.js'
import { getProgram, getAppRegistryPDA, hashAPK } from '../utils/anchor'

export default function Report() {
  const wallet = useWallet()
  const [cloneFile, setCloneFile] = useState(null)
  const [genuineFile, setGenuineFile] = useState(null)
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [txSig, setTxSig] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReport() {
    if (!cloneFile || !genuineFile || !description || !wallet.connected) return
    setLoading(true)
    setStatus('')
    try {
      const cloneHash = await hashAPK(cloneFile)
      const genuineHash = await hashAPK(genuineFile)
      const program = getProgram(wallet)
      const genuinePDA = await getAppRegistryPDA(genuineHash)
      const [reportPDA] = await import('@solana/web3.js').then(({ PublicKey }) =>
        PublicKey.findProgramAddressSync(
          [Buffer.from('report'), wallet.publicKey.toBuffer(), Buffer.from(cloneHash)],
          program.programId
        )
      )
      const tx = await program.methods
        .reportClone(Array.from(cloneHash), description)
        .accounts({
          cloneReport: reportPDA,
          genuineApp: genuinePDA,
          reporter: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      setTxSig(tx)
      setStatus('success')
    } catch (e) {
      setStatus('error: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Clone</h1>
      <p className="text-gray-500 mb-8">Report a fake or cloned app permanently on-chain</p>

      {!wallet.connected ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-700 mb-4">Connect wallet to report a clone</p>
          <WalletMultiButton />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suspicious APK (Clone)</label>
            <div className="border-2 border-dashed border-red-200 rounded-xl p-6 text-center cursor-pointer hover:border-red-400 transition-colors"
              onClick={() => document.getElementById('clone-apk').click()}>
              <input id="clone-apk" type="file" accept=".apk" className="hidden" onChange={e => setCloneFile(e.target.files[0])} />
              {cloneFile ? <p className="text-red-600 font-medium">⚠️ {cloneFile.name}</p> : <p className="text-gray-400">Upload suspicious APK</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genuine APK (Original)</label>
            <div className="border-2 border-dashed border-green-200 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 transition-colors"
              onClick={() => document.getElementById('genuine-apk').click()}>
              <input id="genuine-apk" type="file" accept=".apk" className="hidden" onChange={e => setGenuineFile(e.target.files[0])} />
              {genuineFile ? <p className="text-green-600 font-medium">✅ {genuineFile.name}</p> : <p className="text-gray-400">Upload genuine APK</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} placeholder="Describe how this app is fake..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <button onClick={handleReport} disabled={!cloneFile || !genuineFile || !description || loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors">
            {loading ? 'Submitting...' : 'Report Clone On-Chain'}
          </button>

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 font-semibold">✅ Clone reported successfully!</p>
              <a href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank" rel="noreferrer"
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
