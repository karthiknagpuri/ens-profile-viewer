import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect, useEnsName, useEnsAvatar } from 'wagmi'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { normalizeName, isValidEnsName } from '../services/ensService'

// Theme Toggle Button
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-[var(--color-surface-secondary)] hover:bg-[var(--color-border)] transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  )
}

// ENS Logo Component
function ENSLogo({ className }) {
  return (
    <svg viewBox="0 0 256 417" className={className} fill="currentColor">
      <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" opacity="0.6" />
      <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
      <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" opacity="0.6" />
      <path d="M127.962 416.905V312.187L0 236.587z" />
    </svg>
  )
}

function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName })
  const [showMenu, setShowMenu] = useState(false)
  const [showConnectors, setShowConnectors] = useState(false)

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-secondary)] hover:bg-[var(--color-border)] rounded-full transition-colors"
        >
          {ensAvatar ? (
            <img src={ensAvatar} alt="" className="w-6 h-6 rounded-full" />
          ) : (
            <div
              className="w-6 h-6 rounded-full"
              style={{
                background: `linear-gradient(135deg, #${address?.slice(2, 8)} 0%, #${address?.slice(-6)} 100%)`,
              }}
            />
          )}
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </span>
          <svg className="w-4 h-4 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Connected as</p>
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {ensName || address}
                </p>
              </div>
              {ensName && (
                <Link
                  to={`/profile/${ensName}`}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                >
                  <svg className="w-4 h-4 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View My Profile
                </Link>
              )}
              <button
                onClick={() => {
                  disconnect()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[var(--color-error)] hover:bg-[var(--color-surface-secondary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isPending}
        className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-surface)] rounded-full text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect Wallet
          </>
        )}
      </button>

      {showConnectors && !isPending && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowConnectors(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-[var(--color-border)]">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Connect Wallet</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Sign in with your Ethereum wallet</p>
            </div>
            <div className="p-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector })
                    setShowConnectors(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-secondary)] flex items-center justify-center">
                    {connector.name === 'MetaMask' && (
                      <svg className="w-5 h-5" viewBox="0 0 35 33" fill="none">
                        <path d="M32.96 1L19.47 11.13l2.5-5.93L32.96 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.04 1l13.36 10.22-2.37-6.02L2.04 1zM28.15 23.76l-3.59 5.5 7.68 2.11 2.2-7.49-6.29-.12zM.56 23.88l2.19 7.49 7.68-2.11-3.59-5.5-6.28.12z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.05 14.53l-2.14 3.24 7.63.35-.27-8.2-5.22 4.61zM24.95 14.53l-5.3-4.7-.18 8.29 7.63-.35-2.15-3.24zM10.43 29.26l4.59-2.24-3.96-3.1-.63 5.34zM20.98 27.02l4.59 2.24-.63-5.34-3.96 3.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M25.57 29.26l-4.59-2.24.37 2.98-.04 1.26 4.26-2zM10.43 29.26l4.26 2-.03-1.26.37-2.98-4.6 2.24z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14.78 22.26l-3.82-1.12 2.7-1.24 1.12 2.36zM20.22 22.26l1.12-2.36 2.7 1.24-3.82 1.12z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.43 29.26l.66-5.5-4.25.12 3.59 5.38zM23.91 23.76l.66 5.5 3.58-5.38-4.24-.12zM27.1 17.77l-7.63.35.71 3.94 1.12-2.36 2.7 1.24 3.1-3.17zM10.96 21.14l2.7-1.24 1.12 2.36.71-3.94-7.63-.35 3.1 3.17z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7.91 17.77l3.21 6.26-.1-3.1-3.11-3.16zM24 21.03l-.1 3.1 3.2-6.26-3.1 3.16zM15.49 18.12l-.71 3.94.89 4.6.2-6.06-.38-2.48zM19.47 18.12l-.37 2.47.2 6.07.89-4.6-.72-3.94z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.18 22.06l-.89 4.6.64.44 3.96-3.1.1-3.09-3.81 1.15zM10.96 20.91l.1 3.1 3.96 3.09.64-.44-.89-4.6-3.81-1.15z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.27 31.26l.04-1.26-.34-.3h-5.04l-.34.3.04 1.26-4.26-2 1.49 1.22 3.02 2.09h5.14l3.02-2.1 1.49-1.21-4.26 2z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19.98 27.02l-.64-.44h-3.68l-.64.44-.37 2.98.34-.3h5.04l.34.3-.39-2.98z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M33.52 11.77l1.14-5.5-1.7-5.27-12.98 9.63 5 4.22 7.06 2.06 1.56-1.82-.68-.49 1.08-.98-.83-.64 1.08-.83-.71-.55zM.34 6.27l1.14 5.5-.72.54 1.08.83-.83.64 1.08.98-.68.49 1.56 1.82 7.06-2.06 5-4.22L2.04 1 .34 6.27z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M32.04 16.91l-7.06-2.06 2.14 3.24-3.2 6.26 4.22-.05h6.28l-2.38-7.39zM10.05 14.85l-7.06 2.06-2.36 7.39h6.28l4.22.05-3.21-6.26 2.13-3.24zM19.47 18.12l.45-7.78 2.05-5.53H13.03l2.04 5.53.46 7.78.17 2.5.02 6.04h3.68l.02-6.04.05-2.5z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {connector.name === 'Coinbase Wallet' && (
                      <svg className="w-5 h-5" viewBox="0 0 28 28" fill="none">
                        <rect width="28" height="28" rx="5.6" fill="#0052FF"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M14 23.8c5.412 0 9.8-4.388 9.8-9.8 0-5.412-4.388-9.8-9.8-9.8-5.412 0-9.8 4.388-9.8 9.8 0 5.412 4.388 9.8 9.8 9.8zm-3.733-11.55a.817.817 0 00-.817.817v2.866c0 .451.366.817.817.817h7.466a.817.817 0 00.817-.817v-2.866a.817.817 0 00-.817-.817h-7.466z" fill="#fff"/>
                      </svg>
                    )}
                    {connector.name !== 'MetaMask' && connector.name !== 'Coinbase Wallet' && (
                      <svg className="w-5 h-5 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">{connector.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Compact Search Bar for Header
function HeaderSearchBar() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const normalized = normalizeName(trimmed)
    if (isValidEnsName(normalized)) {
      navigate(`/profile/${encodeURIComponent(normalized)}`)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search ENS..."
        className="w-32 sm:w-48 bg-[var(--color-surface-secondary)] border-0 rounded-full pl-9 pr-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
      />
      <svg
        className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </form>
  )
}

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isProfilePage = location.pathname.startsWith('/profile')

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <ENSLogo className="w-3.5 h-5 sm:w-4 sm:h-6 text-[var(--color-surface)]" />
          </div>
          <span className="hidden sm:inline text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">ENS Profile</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-3">
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname === '/'
                  ? 'bg-[var(--color-accent)] text-[var(--color-surface)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/graph"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname === '/graph'
                  ? 'bg-[var(--color-accent)] text-[var(--color-surface)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
              }`}
            >
              Network
            </Link>
          </nav>
          {isProfilePage && (
            <>
              <div className="w-px h-6 bg-[var(--color-border)]" />
              <HeaderSearchBar />
            </>
          )}
          <div className="w-px h-6 bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ConnectWalletButton />
          </div>
        </div>

        {/* Mobile: Search bar (on profile page), Theme toggle and Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          {isProfilePage && <HeaderSearchBar />}
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-secondary)] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-lg z-50 sm:hidden">
            <nav className="flex flex-col p-4 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-[var(--color-accent)] text-[var(--color-surface)]'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </div>
              </Link>
              <Link
                to="/graph"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/graph'
                    ? 'bg-[var(--color-accent)] text-[var(--color-surface)]'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Network
                </div>
              </Link>
              <div className="border-t border-[var(--color-border)] my-2" />
              <div className="px-4 py-2">
                <ConnectWalletButton />
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
