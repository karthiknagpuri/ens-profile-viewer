import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'

const client = createPublicClient({
  chain: mainnet,
  transport: http(import.meta.env.VITE_RPC_URL || 'https://eth.llamarpc.com'),
})

const ENS_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'

const TEXT_RECORDS = [
  'name', 'description', 'avatar', 'url', 'email',
  'notice', 'keywords', 'location', 'header',
  'com.twitter', 'com.x', 'com.github', 'com.discord',
  'org.telegram', 'social.bsky', 'com.reddit',
  'com.linkedin', 'com.youtube', 'com.instagram',
  'eth.ens.delegate', 'snapshot',
]

const COIN_TYPES = {
  ETH: 60,
  BTC: 0,
  LTC: 2,
  DOGE: 3,
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const cache = new Map()

function getCacheKey(name) {
  return `ens:${name.toLowerCase()}`
}

function getFromCache(name) {
  const key = getCacheKey(name)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCache(name, data) {
  const key = getCacheKey(name)
  cache.set(key, { data, timestamp: Date.now() })
}

export function normalizeName(input) {
  let name = input.trim().toLowerCase()
  if (!name.includes('.')) {
    name = `${name}.eth`
  }
  return name
}

export function isValidEnsName(name) {
  const normalized = normalizeName(name)
  const pattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.eth$/
  return pattern.test(normalized) || /^[a-z0-9-]+\.eth$/.test(normalized)
}

export async function resolveEnsProfile(ensName) {
  const name = normalizeName(ensName)

  const cached = getFromCache(name)
  if (cached) return cached

  try {
    const normalizedName = normalize(name)

    const address = await client.getEnsAddress({ name: normalizedName })

    if (!address) {
      throw new Error('ENS name not registered')
    }

    const [avatar, resolverAddress] = await Promise.all([
      client.getEnsAvatar({ name: normalizedName }).catch(() => null),
      client.getEnsResolver({ name: normalizedName }).catch(() => null),
    ])

    const textRecords = {}
    const textPromises = TEXT_RECORDS.map(async (key) => {
      try {
        const value = await client.getEnsText({ name: normalizedName, key })
        if (value) textRecords[key] = value
      } catch {
        // Ignore errors for individual records
      }
    })
    await Promise.all(textPromises)

    const addresses = { ETH: address }

    const profile = {
      name,
      address,
      avatar,
      resolver: resolverAddress || null,
      displayName: textRecords.name || null,
      description: textRecords.description || null,
      url: textRecords.url || null,
      email: textRecords.email || null,
      notice: textRecords.notice || null,
      keywords: textRecords.keywords || null,
      location: textRecords.location || null,
      header: textRecords.header || null,
      social: {
        twitter: textRecords['com.twitter'] || textRecords['com.x'] || null,
        github: textRecords['com.github'] || null,
        discord: textRecords['com.discord'] || null,
        telegram: textRecords['org.telegram'] || null,
        bluesky: textRecords['social.bsky'] || null,
        reddit: textRecords['com.reddit'] || null,
        linkedin: textRecords['com.linkedin'] || null,
        youtube: textRecords['com.youtube'] || null,
        instagram: textRecords['com.instagram'] || null,
      },
      addresses,
      delegate: textRecords['eth.ens.delegate'] || null,
      snapshot: textRecords.snapshot || null,
      rawRecords: textRecords,
    }

    setCache(name, profile)
    return profile
  } catch (error) {
    if (error.message?.includes('not registered')) {
      throw new Error('This ENS name is not registered')
    }
    if (error.message?.includes('resolver')) {
      throw new Error('This name has no resolver configured')
    }
    throw new Error('Failed to resolve ENS name. Please try again.')
  }
}

export function getSocialUrl(platform, handle) {
  if (!handle) return null

  const urls = {
    twitter: `https://x.com/${handle.replace('@', '')}`,
    github: `https://github.com/${handle}`,
    telegram: `https://t.me/${handle.replace('@', '')}`,
    bluesky: handle.includes('.') ? `https://bsky.app/profile/${handle}` : `https://bsky.app/profile/${handle}.bsky.social`,
    reddit: `https://reddit.com/u/${handle.replace('u/', '')}`,
    linkedin: `https://linkedin.com/in/${handle}`,
    youtube: `https://youtube.com/@${handle.replace('@', '')}`,
    instagram: `https://instagram.com/${handle.replace('@', '')}`,
  }

  return urls[platform] || null
}

export function getExplorerUrl(chain, address) {
  const explorers = {
    ETH: `https://etherscan.io/address/${address}`,
    BTC: `https://mempool.space/address/${address}`,
    LTC: `https://blockchair.com/litecoin/address/${address}`,
    DOGE: `https://dogechain.info/address/${address}`,
  }
  return explorers[chain] || null
}

// Fetch additional ENS data from subgraph
export async function fetchEnsSubgraphData(address) {
  const query = `
    query GetAccountData($address: String!) {
      account(id: $address) {
        domains(first: 50, orderBy: createdAt, orderDirection: desc) {
          id
          name
          labelName
          expiryDate
          registration {
            expiryDate
            registrationDate
          }
          owner {
            id
          }
          resolvedAddress {
            id
          }
        }
        wrappedDomains(first: 50) {
          domain {
            name
            expiryDate
          }
          expiryDate
        }
      }
    }
  `

  try {
    const response = await fetch(ENS_SUBGRAPH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { address: address.toLowerCase() }
      })
    })

    const data = await response.json()
    return data.data?.account || null
  } catch (error) {
    console.error('Subgraph fetch error:', error)
    return null
  }
}

// Get primary ENS name for an address
export async function getPrimaryName(address) {
  try {
    const name = await client.getEnsName({ address })
    return name
  } catch {
    return null
  }
}

// Format expiry date
export function formatExpiryDate(timestamp) {
  if (!timestamp) return null
  const date = new Date(parseInt(timestamp) * 1000)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Check if expired
export function isExpired(timestamp) {
  if (!timestamp) return false
  return parseInt(timestamp) * 1000 < Date.now()
}

// Enhanced profile with owned names
export async function resolveEnsProfileEnhanced(ensName) {
  const baseProfile = await resolveEnsProfile(ensName)

  if (!baseProfile?.address) return baseProfile

  try {
    const [subgraphData, primaryName] = await Promise.all([
      fetchEnsSubgraphData(baseProfile.address),
      getPrimaryName(baseProfile.address)
    ])

    const ownedNames = []
    const associatedNames = []

    if (subgraphData?.domains) {
      for (const domain of subgraphData.domains) {
        if (!domain.name) continue

        const expiryDate = domain.registration?.expiryDate || domain.expiryDate
        const nameData = {
          name: domain.name,
          expiryDate: formatExpiryDate(expiryDate),
          expiryTimestamp: expiryDate,
          isExpired: isExpired(expiryDate),
          isPrimary: domain.name === primaryName,
          isOwned: domain.owner?.id?.toLowerCase() === baseProfile.address.toLowerCase(),
          isResolved: domain.resolvedAddress?.id?.toLowerCase() === baseProfile.address.toLowerCase(),
        }

        if (nameData.isOwned) {
          ownedNames.push(nameData)
        }
        if (nameData.isResolved) {
          associatedNames.push(nameData)
        }
      }
    }

    // Sort: primary first, then by expiry
    const sortNames = (a, b) => {
      if (a.isPrimary) return -1
      if (b.isPrimary) return 1
      return (b.expiryTimestamp || 0) - (a.expiryTimestamp || 0)
    }

    ownedNames.sort(sortNames)
    associatedNames.sort(sortNames)

    return {
      ...baseProfile,
      primaryName,
      ownedNames,
      associatedNames,
      ownedCount: ownedNames.length,
      associatedCount: associatedNames.length,
    }
  } catch (error) {
    console.error('Enhanced profile error:', error)
    return baseProfile
  }
}
