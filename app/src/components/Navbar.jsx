import { Link, useLocation } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Navbar() {
  const location = useLocation()
  const links = [
    { to: '/', label: 'Home' },
    { to: '/verify', label: 'Verify APK' },
    { to: '/register', label: 'Register App' },
    { to: '/registry', label: 'Registry' },
    { to: '/report', label: 'Report Clone' },
  ]
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-blue-600">🛡 CloneGuard</span>
        <div className="flex gap-6">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <WalletMultiButton />
    </nav>
  )
}
