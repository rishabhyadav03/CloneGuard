import { Link } from 'react-router-dom'

export default function Home() {
  const features = [
    { icon: '🔍', title: 'Verify APK', desc: 'Upload any APK and instantly check if it is genuine or a clone', link: '/verify' },
    { icon: '📝', title: 'Register App', desc: 'Developers register their app hash on Solana blockchain', link: '/register' },
    { icon: '📋', title: 'Public Registry', desc: 'Browse all registered genuine applications on-chain', link: '/registry' },
    { icon: '🚨', title: 'Report Clone', desc: 'Report suspicious fake apps permanently on-chain', link: '/report' },
  ]
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">CloneGuard</h1>
        <p className="text-xl text-gray-500 mb-2">Blockchain-Based Clone & Fake App Mitigation</p>
        <p className="text-gray-400 text-sm">Powered by Solana · Zero-Knowledge Proofs · SHA256</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {features.map(f => (
          <Link key={f.title} to={f.link}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition-all group">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>
      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
        <p className="text-sm text-blue-600 font-medium">Running on Solana Devnet</p>
        <p className="text-xs text-blue-400 mt-1 font-mono">9YqBRvxkBv7N2RPzEnAdUi4VUVxZB1aukK4sTio5QWha</p>
      </div>
    </div>
  )
}
