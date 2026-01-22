import { useState, useEffect } from 'react'
import { fetchNFTs } from '../services/portfolioService'

function NFTCard({ nft }) {
  const [imageError, setImageError] = useState(false)

  return (
    <a
      href={`https://opensea.io/assets/ethereum/${nft.contractAddress}/${nft.tokenId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-[#fafafa] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="aspect-square relative overflow-hidden bg-[#f0f0f0]">
        {!imageError && nft.image ? (
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-[#d1d1d6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-[#1d1d1f] truncate">{nft.name}</p>
        <p className="text-xs text-[#6e6e73] truncate">{nft.collection}</p>
      </div>
    </a>
  )
}

export default function NFTGallery({ address }) {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!address) return

    const loadNFTs = async () => {
      setLoading(true)
      const data = await fetchNFTs(address)
      setNfts(data)
      setLoading(false)
    }

    loadNFTs()
  }, [address])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
          NFT Gallery
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-[#f5f5f5] rounded-xl" />
              <div className="mt-2 h-4 bg-[#f5f5f5] rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
          NFT Gallery
        </h3>
        <p className="text-sm text-[#6e6e73] text-center py-8">
          No NFTs found for this address
        </p>
      </div>
    )
  }

  const displayedNFTs = showAll ? nfts : nfts.slice(0, 8)

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
          NFT Gallery ({nfts.length})
        </h3>
        <a
          href={`https://opensea.io/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#0071e3] hover:underline"
        >
          View on OpenSea
        </a>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {displayedNFTs.map((nft) => (
          <NFTCard key={nft.id} nft={nft} />
        ))}
      </div>

      {nfts.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-[#0071e3] hover:underline"
        >
          {showAll ? 'Show less' : `Show all ${nfts.length} NFTs`}
        </button>
      )}
    </div>
  )
}
