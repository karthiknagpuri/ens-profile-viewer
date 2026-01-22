import { Link, useLocation } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'

export default function BottomNav() {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showConnectors, setShowConnectors] = useState(false)

  return (
    <>
      {/* Bottom Nav - Mobile Only */}
      <nav className="fixed bottom-4 left-4 right-4 sm:hidden z-50">
        <div className="bg-[var(--color-surface)]/90 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-lg px-2 py-2">
          <div className="flex items-center justify-around">
            {/* Home */}
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                location.pathname === '/'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] font-medium">Home</span>
            </Link>

            {/* Network */}
            <Link
              to="/graph"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                location.pathname === '/graph'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-[10px] font-medium">Network</span>
            </Link>

            {/* Connect Wallet */}
            <button
              onClick={() => {
                if (isConnected) {
                  disconnect()
                } else {
                  setShowConnectors(true)
                }
              }}
              disabled={isPending}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isConnected
                  ? 'bg-green-500/10 text-green-500'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
              ) : isConnected ? (
                <div
                  className="w-5 h-5 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, #${address?.slice(2, 8)} 0%, #${address?.slice(-6)} 100%)`,
                  }}
                />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              )}
              <span className="text-[10px] font-medium">
                {isConnected ? `${address?.slice(0, 4)}...` : 'Wallet'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Wallet Connector Modal */}
      {showConnectors && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 sm:hidden"
            onClick={() => setShowConnectors(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] rounded-t-3xl z-50 sm:hidden animate-slide-up">
            <div className="w-12 h-1 bg-[var(--color-border)] rounded-full mx-auto mt-3" />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Connect Wallet
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Choose a wallet to connect
              </p>
              <div className="space-y-3">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector })
                      setShowConnectors(false)
                    }}
                    className="flex items-center gap-4 w-full p-4 rounded-2xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-border)] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center">
                      {connector.name === 'MetaMask' && (
                        <svg className="w-6 h-6" viewBox="0 0 35 33" fill="none">
                          <path d="M32.96 1L19.47 11.13l2.5-5.93L32.96 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2.04 1l13.36 10.22-2.37-6.02L2.04 1zM28.15 23.76l-3.59 5.5 7.68 2.11 2.2-7.49-6.29-.12zM.56 23.88l2.19 7.49 7.68-2.11-3.59-5.5-6.28.12z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {connector.name === 'Coinbase Wallet' && (
                        <svg className="w-6 h-6" viewBox="0 0 28 28" fill="none">
                          <rect width="28" height="28" rx="5.6" fill="#0052FF"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M14 23.8c5.412 0 9.8-4.388 9.8-9.8 0-5.412-4.388-9.8-9.8-9.8-5.412 0-9.8 4.388-9.8 9.8 0 5.412 4.388 9.8 9.8 9.8zm-3.733-11.55a.817.817 0 00-.817.817v2.866c0 .451.366.817.817.817h7.466a.817.817 0 00.817-.817v-2.866a.817.817 0 00-.817-.817h-7.466z" fill="#fff"/>
                        </svg>
                      )}
                      {connector.name !== 'MetaMask' && connector.name !== 'Coinbase Wallet' && (
                        <svg className="w-6 h-6 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {connector.name}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowConnectors(false)}
                className="w-full mt-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add animation styles */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
