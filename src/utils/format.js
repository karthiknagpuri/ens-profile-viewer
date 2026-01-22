export function truncateAddress(address, startChars = 6, endChars = 4) {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export function formatAddress(address) {
  if (!address) return ''
  return address
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
}

export function generateIdenticon(address) {
  // Simple deterministic color based on address
  if (!address) return '#e5e5e5'
  const hash = address.slice(2, 8)
  return `#${hash}`
}

export function parseKeywords(keywords) {
  if (!keywords) return []
  return keywords.split(',').map(k => k.trim()).filter(Boolean)
}
