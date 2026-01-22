import { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'
import SearchBar from '../components/SearchBar'
import Avatar from '../components/Avatar'
import { FlickeringGrid } from '../components/ui/flickering-grid'
import { useTheme } from '../context/ThemeContext'

const client = createPublicClient({
  chain: mainnet,
  transport: http(import.meta.env.VITE_RPC_URL || 'https://eth.llamarpc.com'),
})

const EXAMPLE_NAMES = ['vitalik.eth', 'nick.eth', 'brantly.eth', 'ens.eth']

function NameChip({ name, showAvatar = true }) {
  const [avatar, setAvatar] = useState(null)
  const [address, setAddress] = useState(null)

  useEffect(() => {
    if (!showAvatar) return

    const fetchAvatar = async () => {
      try {
        const normalizedName = normalize(name)
        const [avatarUrl, addr] = await Promise.all([
          client.getEnsAvatar({ name: normalizedName }).catch(() => null),
          client.getEnsAddress({ name: normalizedName }).catch(() => null),
        ])
        setAvatar(avatarUrl)
        setAddress(addr)
      } catch {
        // Ignore errors
      }
    }

    fetchAvatar()
  }, [name, showAvatar])

  return (
    <a
      href={`/profile/${encodeURIComponent(name)}`}
      className="group relative inline-flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all overflow-hidden"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-[var(--color-surface)]/60 to-transparent" />

      {showAvatar && (
        <Avatar
          src={avatar}
          address={address}
          name={name}
          size="xs"
        />
      )}
      <span className="relative font-medium">{name}</span>
    </a>
  )
}

export default function Home() {
  const [recentSearches, setRecentSearches] = useState([])
  const { theme } = useTheme()

  useEffect(() => {
    const saved = localStorage.getItem('ens-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('ens-recent-searches')
    setRecentSearches([])
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16 overflow-hidden">
      {/* Flickering Grid Background */}
      <FlickeringGrid
        className="z-0 absolute inset-0"
        squareSize={4}
        gridGap={6}
        color={theme === 'dark' ? '#ffffff' : '#000000'}
        maxOpacity={theme === 'dark' ? 0.15 : 0.1}
        flickerChance={0.1}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        {/* Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[var(--color-text-primary)] tracking-tight mb-2 sm:mb-3">
            ENS Profile Viewer
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[var(--color-text-secondary)]">
            Explore Web3 identities and social connections
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-10">
          <SearchBar autoFocus />
        </div>

        {/* Examples */}
        <div className="mb-6 sm:mb-10">
          <p className="text-xs sm:text-sm text-[var(--color-text-tertiary)] mb-3 sm:mb-4">Try searching for</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {EXAMPLE_NAMES.map((name, index) => (
              <div key={name} className={index >= 3 ? 'hidden sm:block' : ''}>
                <NameChip name={name} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="text-left max-w-lg mx-auto px-2 sm:px-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Recent Searches
              </h3>
              <button
                onClick={clearHistory}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors active:scale-95"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {recentSearches.slice(0, 6).map((name) => (
                <NameChip key={name} name={name} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
