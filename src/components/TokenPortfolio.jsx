import { useState, useEffect } from 'react'
import { fetchTokenBalances, fetchEthBalance } from '../services/portfolioService'

function TokenRow({ token }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-[#fafafa] rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e5e5e5] flex-shrink-0">
          {!imageError && token.logo ? (
            <img
              src={token.logo}
              alt={token.symbol}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400">
              <span className="text-white text-xs font-bold">
                {token.symbol?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#1d1d1f] truncate">{token.name}</p>
          <p className="text-xs text-[#6e6e73]">{token.symbol}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-[#1d1d1f]">{token.formattedBalance}</p>
      </div>
    </div>
  )
}

export default function TokenPortfolio({ address }) {
  const [tokens, setTokens] = useState([])
  const [ethBalance, setEthBalance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!address) return

    const loadPortfolio = async () => {
      setLoading(true)
      const [tokenData, ethData] = await Promise.all([
        fetchTokenBalances(address),
        fetchEthBalance(address)
      ])
      setTokens(tokenData)
      setEthBalance(ethData)
      setLoading(false)
    }

    loadPortfolio()
  }, [address])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
          Token Portfolio
        </h3>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-4 bg-[#fafafa] rounded-xl">
              <div className="w-8 h-8 rounded-full bg-[#e5e5e5]" />
              <div className="flex-1">
                <div className="h-4 bg-[#e5e5e5] rounded w-24 mb-1" />
                <div className="h-3 bg-[#e5e5e5] rounded w-12" />
              </div>
              <div className="h-4 bg-[#e5e5e5] rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const allTokens = ethBalance ? [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
      formattedBalance: ethBalance.formatted,
      balance: ethBalance.eth,
      isEth: true
    },
    ...tokens
  ] : tokens

  const displayedTokens = showAll ? allTokens : allTokens.slice(0, 5)

  if (allTokens.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
          Token Portfolio
        </h3>
        <p className="text-sm text-[#6e6e73] text-center py-6">
          No tokens found
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
          Token Portfolio ({allTokens.length})
        </h3>
        <a
          href={`https://etherscan.io/address/${address}#tokentxns`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#0071e3] hover:underline"
        >
          View on Etherscan
        </a>
      </div>

      <div className="space-y-2">
        {displayedTokens.map((token, index) => (
          <TokenRow key={token.contractAddress || `eth-${index}`} token={token} />
        ))}
      </div>

      {allTokens.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-[#0071e3] hover:underline"
        >
          {showAll ? 'Show less' : `Show all ${allTokens.length} tokens`}
        </button>
      )}
    </div>
  )
}
