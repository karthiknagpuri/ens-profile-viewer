import { useState, useEffect } from 'react'
import { fetchPOAPs } from '../services/portfolioService'

function POAPBadge({ poap }) {
  const [imageError, setImageError] = useState(false)

  return (
    <a
      href={`https://poap.gallery/event/${poap.eventId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center"
      title={poap.name}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-[#e5e5e5] group-hover:ring-[#0071e3] transition-all duration-300 bg-[#fafafa]">
        {!imageError && poap.image ? (
          <img
            src={poap.image}
            alt={poap.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
            <span className="text-white text-xl font-bold">P</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-[#6e6e73] text-center max-w-[80px] truncate">
        {poap.name}
      </p>
      {poap.eventDate && (
        <p className="text-[10px] text-[#86868b]">
          {new Date(poap.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
        </p>
      )}
    </a>
  )
}

export default function POAPBadges({ address }) {
  const [poaps, setPoaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!address) return

    const loadPOAPs = async () => {
      setLoading(true)
      const data = await fetchPOAPs(address)
      setPoaps(data)
      setLoading(false)
    }

    loadPOAPs()
  }, [address])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
          POAP Badges
        </h3>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f5f5f5]" />
              <div className="mt-2 h-3 w-12 bg-[#f5f5f5] rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (poaps.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
          POAP Badges
        </h3>
        <p className="text-sm text-[#6e6e73] text-center py-6">
          No POAPs collected yet
        </p>
      </div>
    )
  }

  const displayedPOAPs = showAll ? poaps : poaps.slice(0, 10)

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
          POAP Badges ({poaps.length})
        </h3>
        <a
          href={`https://poap.xyz/scan/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#0071e3] hover:underline"
        >
          View on POAP
        </a>
      </div>

      <div className="flex flex-wrap gap-4 justify-start">
        {displayedPOAPs.map((poap) => (
          <POAPBadge key={poap.id} poap={poap} />
        ))}
      </div>

      {poaps.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-[#0071e3] hover:underline"
        >
          {showAll ? 'Show less' : `Show all ${poaps.length} POAPs`}
        </button>
      )}
    </div>
  )
}
