import { useState } from 'react'
import { truncateAddress, copyToClipboard } from '../utils/format'
import { getExplorerUrl } from '../services/ensService'

export default function AddressBadge({ address, chain = 'ETH', showFull = false }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const explorerUrl = getExplorerUrl(chain, address)
  const displayAddress = showFull ? address : truncateAddress(address)

  return (
    <div className="inline-flex items-center gap-2 bg-[#f5f5f5] rounded-lg px-3 py-2">
      <span className="text-xs font-medium text-[#86868b] uppercase">{chain}</span>
      <code className="text-sm font-mono text-[#1d1d1f]">{displayAddress}</code>

      <div className="flex items-center gap-1 ml-1">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-[#e5e5e5] transition-colors"
          title="Copy address"
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

        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-[#e5e5e5] transition-colors"
            title="View on explorer"
          >
            <svg className="w-4 h-4 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
