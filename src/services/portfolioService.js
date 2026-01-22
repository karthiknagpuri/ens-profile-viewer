// Portfolio Service - Fetches NFTs, Tokens, and POAPs for an Ethereum address

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || 'demo'
const ALCHEMY_BASE_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`

// Cache for portfolio data
const portfolioCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(address, type) {
  return `${type}:${address.toLowerCase()}`
}

function getFromCache(address, type) {
  const key = getCacheKey(address, type)
  const cached = portfolioCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  portfolioCache.delete(key)
  return null
}

function setCache(address, type, data) {
  const key = getCacheKey(address, type)
  portfolioCache.set(key, { data, timestamp: Date.now() })
}

// Fetch NFTs using Alchemy API
export async function fetchNFTs(address) {
  const cached = getFromCache(address, 'nfts')
  if (cached) return cached

  try {
    const response = await fetch(
      `${ALCHEMY_BASE_URL}/getNFTsForOwner?owner=${address}&pageSize=20&withMetadata=true`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch NFTs')
    }

    const data = await response.json()

    const nfts = (data.ownedNfts || []).map(nft => ({
      id: `${nft.contract.address}-${nft.tokenId}`,
      name: nft.name || nft.title || `#${nft.tokenId}`,
      description: nft.description || '',
      image: nft.image?.cachedUrl || nft.image?.originalUrl || nft.media?.[0]?.gateway || null,
      collection: nft.contract.name || 'Unknown Collection',
      contractAddress: nft.contract.address,
      tokenId: nft.tokenId,
      tokenType: nft.tokenType,
    })).filter(nft => nft.image) // Only show NFTs with images

    setCache(address, 'nfts', nfts)
    return nfts
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return []
  }
}

// Fetch ERC-20 token balances using Alchemy API
export async function fetchTokenBalances(address) {
  const cached = getFromCache(address, 'tokens')
  if (cached) return cached

  try {
    const response = await fetch(`${ALCHEMY_BASE_URL}/getTokenBalances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenBalances',
        params: [address, 'erc20']
      })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch token balances')
    }

    const data = await response.json()
    const tokenBalances = data.result?.tokenBalances || []

    // Filter tokens with non-zero balance
    const nonZeroTokens = tokenBalances.filter(
      token => token.tokenBalance && token.tokenBalance !== '0x0' && parseInt(token.tokenBalance, 16) > 0
    )

    // Get metadata for tokens with balances
    const tokensWithMetadata = await Promise.all(
      nonZeroTokens.slice(0, 20).map(async token => {
        try {
          const metaResponse = await fetch(`${ALCHEMY_BASE_URL}/getTokenMetadata`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'alchemy_getTokenMetadata',
              params: [token.contractAddress]
            })
          })

          const metaData = await metaResponse.json()
          const metadata = metaData.result || {}

          const rawBalance = BigInt(token.tokenBalance)
          const decimals = metadata.decimals || 18
          const balance = Number(rawBalance) / Math.pow(10, decimals)

          return {
            contractAddress: token.contractAddress,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || '???',
            decimals: decimals,
            balance: balance,
            logo: metadata.logo || null,
            formattedBalance: balance.toLocaleString(undefined, {
              maximumFractionDigits: 4
            })
          }
        } catch {
          return null
        }
      })
    )

    const tokens = tokensWithMetadata.filter(t => t && t.balance > 0)
    setCache(address, 'tokens', tokens)
    return tokens
  } catch (error) {
    console.error('Error fetching token balances:', error)
    return []
  }
}

// Fetch POAPs using POAP API
export async function fetchPOAPs(address) {
  const cached = getFromCache(address, 'poaps')
  if (cached) return cached

  try {
    // POAP API endpoint
    const response = await fetch(
      `https://api.poap.tech/actions/scan/${address}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      // POAP API might require API key, return empty array
      return []
    }

    const data = await response.json()

    const poaps = (Array.isArray(data) ? data : []).map(poap => ({
      id: poap.tokenId,
      name: poap.event?.name || 'Unknown Event',
      description: poap.event?.description || '',
      image: poap.event?.image_url || null,
      eventId: poap.event?.id,
      eventDate: poap.event?.start_date,
      city: poap.event?.city || '',
      country: poap.event?.country || '',
    }))

    setCache(address, 'poaps', poaps)
    return poaps
  } catch (error) {
    console.error('Error fetching POAPs:', error)
    return []
  }
}

// Fetch ETH balance
export async function fetchEthBalance(address) {
  try {
    const response = await fetch(`${ALCHEMY_BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
    })

    const data = await response.json()
    const balanceWei = BigInt(data.result || '0')
    const balanceEth = Number(balanceWei) / 1e18

    return {
      wei: balanceWei.toString(),
      eth: balanceEth,
      formatted: balanceEth.toLocaleString(undefined, { maximumFractionDigits: 4 })
    }
  } catch (error) {
    console.error('Error fetching ETH balance:', error)
    return { wei: '0', eth: 0, formatted: '0' }
  }
}

// Calculate days until expiry
export function getDaysUntilExpiry(expiryTimestamp) {
  if (!expiryTimestamp) return null
  const expiryMs = parseInt(expiryTimestamp) * 1000
  const now = Date.now()
  const diffMs = expiryMs - now
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// Get expiry status and color
export function getExpiryStatus(expiryTimestamp) {
  const days = getDaysUntilExpiry(expiryTimestamp)
  if (days === null) return { status: 'unknown', color: '#86868b', urgent: false }
  if (days < 0) return { status: 'expired', color: '#ff453a', urgent: true }
  if (days <= 7) return { status: 'critical', color: '#ff453a', urgent: true }
  if (days <= 30) return { status: 'warning', color: '#ff9f0a', urgent: true }
  if (days <= 90) return { status: 'soon', color: '#ffd60a', urgent: false }
  return { status: 'safe', color: '#30d158', urgent: false }
}
