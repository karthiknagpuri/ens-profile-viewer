import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useMotionValue, useMotionTemplate, motion } from 'framer-motion'
import Avatar from './Avatar'
import AddressBadge from './AddressBadge'
import SocialLinks from './SocialLinks'
import EditProfileModal from './EditProfileModal'
import ExpirationTracker from './ExpirationTracker'
import NFTGallery from './NFTGallery'
import POAPBadges from './POAPBadges'
import TokenPortfolio from './TokenPortfolio'
import { parseKeywords, truncateAddress, copyToClipboard } from '../utils/format'
import { getExplorerUrl } from '../services/ensService'
import { cn } from '../lib/utils'

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const generateRandomString = (length) => {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

function MatrixCardEffect({ children, className }) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)
  const [randomString, setRandomString] = useState('')

  useEffect(() => {
    setRandomString(generateRandomString(1500))
  }, [])

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
    setRandomString(generateRandomString(1500))
  }

  let maskImage = useMotionTemplate`radial-gradient(200px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div
      onMouseMove={onMouseMove}
      className={cn('group/card relative overflow-hidden', className)}
    >
      {/* Matrix background effect */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] opacity-0 group-hover/card:opacity-30 transition-opacity duration-500" />
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover/card:opacity-100 backdrop-blur-xl transition duration-500"
          style={style}
        />
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay group-hover/card:opacity-60"
          style={style}
        >
          <p className="absolute inset-x-0 text-[8px] h-full break-words whitespace-pre-wrap text-emerald-500/40 font-mono font-bold transition duration-500 overflow-hidden">
            {randomString}
          </p>
        </motion.div>
      </div>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-md hover:bg-[#f5f5f5] transition-colors ${className}`}
      title="Copy"
    >
      {copied ? (
        <svg className="w-4 h-4 text-[#30d158]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}

function ExternalLink({ href, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-1.5 rounded-md hover:bg-[#f5f5f5] transition-colors ${className}`}
      title="View on explorer"
    >
      <svg className="w-4 h-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}

function NameListItem({ nameData }) {
  const ensAppUrl = `https://app.ens.domains/${nameData.name}`

  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 bg-[#fafafa] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <code className="text-sm font-mono text-[#1d1d1f] truncate">{nameData.name}</code>
        <CopyButton text={nameData.name} className="flex-shrink-0" />
        {nameData.isPrimary && (
          <span className="px-2 py-0.5 bg-[#30d158] text-white text-xs font-medium rounded-full flex-shrink-0">
            Primary
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {nameData.expiryDate && (
          <span className={`text-xs whitespace-nowrap ${nameData.isExpired ? 'text-[#ff453a]' : 'text-[#86868b]'}`}>
            {nameData.isExpired ? 'Expired:' : 'Expires:'} {nameData.expiryDate}
          </span>
        )}
        <ExternalLink href={ensAppUrl} />
      </div>
    </div>
  )
}

export default function ProfileCard({ profile, onProfileUpdate }) {
  const [showAllOwned, setShowAllOwned] = useState(false)
  const [showAllAssociated, setShowAllAssociated] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const { address: connectedAddress, isConnected } = useAccount()

  if (!profile) return null

  const keywords = parseKeywords(profile.keywords)
  const explorerUrl = getExplorerUrl('ETH', profile.address)
  const isOwner = isConnected && connectedAddress?.toLowerCase() === profile.address?.toLowerCase()

  const displayedOwned = showAllOwned ? profile.ownedNames : profile.ownedNames?.slice(0, 5)
  const displayedAssociated = showAllAssociated ? profile.associatedNames : profile.associatedNames?.slice(0, 5)

  const handleEditSuccess = () => {
    // Trigger profile reload
    onProfileUpdate?.()
  }

  return (
    <div className="space-y-6">
      {/* Owner Badge */}
      {isOwner && (
        <div className="bg-[#e8f5e9] border border-[#30d158] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#30d158] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#1d1d1f]">This is your profile</p>
              <p className="text-sm text-[#6e6e73]">Connected with your wallet</p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-[#1d1d1f] text-white rounded-full text-sm font-medium hover:bg-black transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSuccess={handleEditSuccess}
      />

      {/* Main Profile Card */}
      <MatrixCardEffect className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        {/* Header with avatar and basic info */}
        <div className="p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar
              src={profile.avatar}
              address={profile.address}
              name={profile.displayName || profile.name}
              size="xl"
            />

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-semibold mb-2 relative inline-block overflow-hidden">
                <span
                  className="relative bg-clip-text"
                  style={{
                    background: 'linear-gradient(90deg, #1d1d1f 0%, #1d1d1f 40%, #6e6e73 50%, #1d1d1f 60%, #1d1d1f 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    animation: 'shimmer 4s ease-in-out infinite',
                  }}
                >
                  {profile.name}
                </span>
              </h1>

              {profile.displayName && profile.displayName !== profile.name && (
                <p className="text-lg text-[#6e6e73] mb-3">{profile.displayName}</p>
              )}

              {/* Description */}
              {profile.description && (
                <p className="text-[#1d1d1f] leading-relaxed mb-4">
                  {profile.description}
                </p>
              )}

              {/* Social Links inline */}
              <SocialLinks social={profile.social} />

              {/* Website */}
              {profile.url && (
                <a
                  href={profile.url.startsWith('http') ? profile.url : `https://${profile.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-[#0071e3] hover:underline text-sm"
                >
                  {profile.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Notice */}
          {profile.notice && (
            <div className="mt-6 p-4 bg-[#fff8e6] border border-[#ffd60a] rounded-xl">
              <p className="text-sm text-[#1d1d1f]">{profile.notice}</p>
            </div>
          )}

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-[#f5f5f5] rounded-full text-sm text-[#6e6e73]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contact info */}
        {(profile.email || profile.location) && (
          <div className="px-8 py-4 border-t border-[#e5e5e5] bg-[#fafafa] flex flex-wrap gap-6">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 text-sm text-[#1d1d1f] hover:text-[#0071e3]"
              >
                <svg className="w-4 h-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile.email}
              </a>
            )}
            {profile.location && (
              <span className="inline-flex items-center gap-2 text-sm text-[#6e6e73]">
                <svg className="w-4 h-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </span>
            )}
          </div>
        )}
      </MatrixCardEffect>

      {/* Primary ENS Name */}
      {profile.primaryName && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Primary ENS Name
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#30d158]">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <code className="text-lg font-mono text-[#1d1d1f]">{profile.primaryName}</code>
            <CopyButton text={profile.primaryName} />
            <ExternalLink href={`https://app.ens.domains/${profile.primaryName}`} />
          </div>
        </div>
      )}

      {/* Account Address */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
          Account Address
        </h3>
        <div className="flex items-center gap-3">
          <code className="text-sm font-mono text-[#1d1d1f] break-all">{profile.address}</code>
          <CopyButton text={profile.address} />
          {explorerUrl && <ExternalLink href={explorerUrl} />}
        </div>
      </div>

      {/* Associated ENS Names */}
      {profile.associatedNames?.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Associated ENS Names ({profile.associatedCount})
            </h3>
          </div>
          <div className="space-y-2 overflow-hidden">
            {displayedAssociated?.map((nameData) => (
              <NameListItem key={nameData.name} nameData={nameData} />
            ))}
          </div>
          {profile.associatedNames.length > 5 && (
            <button
              onClick={() => setShowAllAssociated(!showAllAssociated)}
              className="mt-4 text-sm text-[#0071e3] hover:underline"
            >
              {showAllAssociated ? 'Show less' : `Show all ${profile.associatedCount} names`}
            </button>
          )}
        </div>
      )}

      {/* Owned ENS Names */}
      {profile.ownedNames?.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Owned ENS Names ({profile.ownedCount})
            </h3>
          </div>
          <div className="space-y-2 overflow-hidden">
            {displayedOwned?.map((nameData) => (
              <NameListItem key={nameData.name} nameData={nameData} />
            ))}
          </div>
          {profile.ownedNames.length > 5 && (
            <button
              onClick={() => setShowAllOwned(!showAllOwned)}
              className="mt-4 text-sm text-[#0071e3] hover:underline"
            >
              {showAllOwned ? 'Show less' : `Show all ${profile.ownedCount} names`}
            </button>
          )}
        </div>
      )}

      {/* Multi-chain Addresses */}
      {profile.addresses && Object.keys(profile.addresses).length > 1 && (
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
          <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
            Multi-chain Addresses
          </h3>
          <div className="space-y-3">
            {Object.entries(profile.addresses)
              .filter(([chain]) => chain !== 'ETH')
              .map(([chain, address]) => (
                <div key={chain} className="flex items-center gap-3 py-2 px-4 bg-[#fafafa] rounded-xl">
                  <span className="text-xs font-semibold text-[#86868b] uppercase w-12">{chain}</span>
                  <code className="text-sm font-mono text-[#1d1d1f] break-all flex-1">{address}</code>
                  <CopyButton text={address} />
                  <ExternalLink href={getExplorerUrl(chain, address)} />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
          Technical Details
        </h3>
        <div className="space-y-4">
          {/* Resolver */}
          <div className="py-3 px-4 bg-[#fafafa] rounded-xl">
            <span className="text-xs text-[#86868b] block mb-1">Resolver Contract</span>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-[#1d1d1f] break-all flex-1">
                {profile.resolver || 'Not set'}
              </code>
              {profile.resolver && (
                <>
                  <CopyButton text={profile.resolver} />
                  <ExternalLink href={getExplorerUrl('ETH', profile.resolver)} />
                </>
              )}
            </div>
          </div>

          {/* Content Hash */}
          {profile.contentHash && (
            <div className="py-3 px-4 bg-[#fafafa] rounded-xl">
              <span className="text-xs text-[#86868b] block mb-1">Content Hash</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-[#1d1d1f] break-all flex-1">
                  {profile.contentHash}
                </code>
                <CopyButton text={profile.contentHash} />
              </div>
            </div>
          )}

          {/* ENS Delegate */}
          {profile.delegate && (
            <div className="py-3 px-4 bg-[#fafafa] rounded-xl">
              <span className="text-xs text-[#86868b] block mb-1">ENS Delegate</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-[#1d1d1f] break-all flex-1">
                  {profile.delegate}
                </code>
                <CopyButton text={profile.delegate} />
              </div>
            </div>
          )}

          {/* Snapshot */}
          {profile.snapshot && (
            <div className="py-3 px-4 bg-[#fafafa] rounded-xl">
              <span className="text-xs text-[#86868b] block mb-1">Snapshot Space</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-[#1d1d1f] break-all flex-1">
                  {profile.snapshot}
                </code>
                <CopyButton text={profile.snapshot} />
                <ExternalLink href={`https://snapshot.org/#/${profile.snapshot}`} />
              </div>
            </div>
          )}

          {/* Raw Records */}
          {profile.rawRecords && Object.keys(profile.rawRecords).length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-[#6e6e73] hover:text-[#1d1d1f]">
                All Text Records ({Object.keys(profile.rawRecords).length})
              </summary>
              <div className="mt-3 space-y-2">
                {Object.entries(profile.rawRecords).map(([key, value]) => (
                  <div key={key} className="py-2 px-4 bg-[#fafafa] rounded-lg">
                    <span className="text-xs text-[#86868b] block">{key}</span>
                    <code className="text-sm font-mono text-[#1d1d1f] break-all">{value}</code>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* ENS Expiration Tracker */}
      {profile.ownedNames?.length > 0 && (
        <ExpirationTracker ownedNames={profile.ownedNames} />
      )}

      {/* Token Portfolio */}
      <TokenPortfolio address={profile.address} />

      {/* NFT Gallery */}
      <NFTGallery address={profile.address} />

      {/* POAP Badges */}
      <POAPBadges address={profile.address} />
    </div>
  )
}
