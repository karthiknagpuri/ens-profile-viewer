import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { SlideToDelete } from './slide-to-delete'

// Real ENS profiles with metadata service avatars
const initialProfiles = [
  { id: 1, name: 'vitalik.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/vitalik.eth' },
  { id: 2, name: 'nick.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/nick.eth' },
  { id: 3, name: 'brantly.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/brantly.eth' },
  { id: 4, name: 'cory.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/cory.eth' },
  { id: 5, name: 'rainbow.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/rainbow.eth' },
  { id: 6, name: 'punk6529.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/punk6529.eth' },
  { id: 7, name: 'griff.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/griff.eth' },
  { id: 8, name: 'sassal.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/sassal.eth' },
  { id: 9, name: 'poap.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/poap.eth' },
  { id: 10, name: 'ens.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/ens.eth' },
  { id: 11, name: 'uniswap.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/uniswap.eth' },
  { id: 12, name: 'aave.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/aave.eth' },
  { id: 13, name: 'opensea.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/opensea.eth' },
  { id: 14, name: 'coinbase.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/coinbase.eth' },
  { id: 15, name: 'balajis.eth', avatar: 'https://metadata.ens.domains/mainnet/avatar/balajis.eth' },
]

// Ethereum logo component
function EthereumLogo({ className }) {
  return (
    <svg viewBox="0 0 256 417" className={className} fill="currentColor">
      <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" opacity="0.6" />
      <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
      <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" opacity="0.6" />
      <path d="M127.962 416.905V312.187L0 236.587z" />
    </svg>
  )
}

// Avatar component with fallback
function ProfileAvatar({ profile, className }) {
  return (
    <div className={`relative ${className}`}>
      <img
        src={profile.avatar}
        alt={profile.name}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none'
          e.target.nextElementSibling.style.display = 'flex'
        }}
      />
      <div
        className="w-full h-full rounded-full bg-gradient-to-br from-[#627EEA] to-[#8B5CF6] hidden items-center justify-center absolute inset-0"
      >
        <span className="text-white text-xs font-bold">
          {profile.name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  )
}

export default function NetworkFeatureSection() {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showDeletePopup, setShowDeletePopup] = useState(false)

  const orbitCount = 3
  const orbitGap = 8 // rem between orbits
  const profilesPerOrbit = Math.ceil(profiles.length / orbitCount)

  const handleProfileClick = (profile, e) => {
    e.stopPropagation()
    setSelectedProfile(profile)
    setShowDeletePopup(true)
  }

  const handleDelete = () => {
    if (selectedProfile) {
      setProfiles(profiles.filter(p => p.id !== selectedProfile.id))
    }
    setShowDeletePopup(false)
    setSelectedProfile(null)
  }

  const handleCancel = () => {
    setShowDeletePopup(false)
    setSelectedProfile(null)
  }

  return (
    <>
      <section className="relative max-w-6xl mx-4 sm:mx-auto my-10 sm:my-16 md:my-24 sm:pl-6 md:pl-10 flex flex-col md:flex-row items-center justify-between min-h-[20rem] sm:min-h-[24rem] md:h-[30rem] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden rounded-2xl sm:rounded-3xl transition-colors duration-300" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
        {/* Left side: Heading and Text */}
        <div className="w-full md:w-1/2 z-10 p-5 sm:p-8 md:p-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-[var(--color-text-primary)]">
            Network Forecast
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-4 sm:mb-6 max-w-lg text-xs sm:text-sm md:text-base">
            Visualize connections between ENS identities. Explore the decentralized social graph and discover how the Ethereum community is interconnected.
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/graph">
              <Button variant="default" className="text-xs sm:text-sm px-3 sm:px-4 py-2">Explore Network</Button>
            </Link>
            <Button variant="outline" className="text-xs sm:text-sm px-3 sm:px-4 py-2">Learn More</Button>
          </div>
        </div>

        {/* Right side: Orbit animation cropped to 1/4 */}
        <div className="relative w-full md:w-1/2 h-48 sm:h-64 md:h-full flex items-center justify-center md:justify-start overflow-hidden">
          <div className="relative w-[28rem] sm:w-[40rem] md:w-[50rem] h-[28rem] sm:h-[40rem] md:h-[50rem] md:translate-x-[50%] flex items-center justify-center">
            {/* Center Circle - Ethereum Logo */}
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[var(--color-surface-secondary)] shadow-lg flex items-center justify-center z-10">
              <EthereumLogo className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#627EEA]" />
            </div>

            {/* Generate Orbits */}
            {[...Array(orbitCount)].map((_, orbitIdx) => {
              const size = `${10 + orbitGap * (orbitIdx + 1)}rem`
              const currentOrbitProfiles = profiles.slice(
                orbitIdx * profilesPerOrbit,
                orbitIdx * profilesPerOrbit + profilesPerOrbit
              )
              const angleStep = currentOrbitProfiles.length > 0
                ? (2 * Math.PI) / currentOrbitProfiles.length
                : 0

              return (
                <div
                  key={orbitIdx}
                  className="absolute rounded-full border-2 border-dotted border-[var(--color-border)]"
                  style={{
                    width: size,
                    height: size,
                    animation: `spin ${20 + orbitIdx * 8}s linear infinite ${orbitIdx % 2 === 0 ? '' : 'reverse'}`,
                  }}
                >
                  {currentOrbitProfiles.map((profile, iconIdx) => {
                    const angle = iconIdx * angleStep
                    const x = 50 + 50 * Math.cos(angle)
                    const y = 50 + 50 * Math.sin(angle)

                    return (
                      <div
                        key={profile.id}
                        onClick={(e) => handleProfileClick(profile, e)}
                        className="absolute bg-[var(--color-surface)] rounded-full p-0.5 shadow-md hover:scale-110 hover:ring-2 hover:ring-[#627EEA] transition-all cursor-pointer"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                          animation: `counter-spin ${20 + orbitIdx * 8}s linear infinite ${orbitIdx % 2 === 0 ? '' : 'reverse'}`,
                        }}
                        title={`Click to remove ${profile.name}`}
                      >
                        <ProfileAvatar
                          profile={profile}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                        />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Animation keyframes */}
        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes counter-spin {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(-360deg);
            }
          }
        `}</style>
      </section>

      {/* Slide to Delete Popup */}
      <AnimatePresence>
        {showDeletePopup && selectedProfile && (
          <SlideToDelete
            profile={selectedProfile}
            onDelete={handleDelete}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </>
  )
}
