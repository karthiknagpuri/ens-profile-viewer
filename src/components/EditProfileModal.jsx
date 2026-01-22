import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { namehash, normalize } from 'viem/ens'

// ENS Public Resolver ABI (only setText function)
const resolverAbi = [
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
]

const TEXT_RECORD_FIELDS = [
  { key: 'description', label: 'Bio / Description', placeholder: 'Tell the world about yourself...' },
  { key: 'url', label: 'Website', placeholder: 'https://yourwebsite.com' },
  { key: 'com.twitter', label: 'Twitter', placeholder: 'username (without @)' },
  { key: 'com.github', label: 'GitHub', placeholder: 'username' },
  { key: 'com.discord', label: 'Discord', placeholder: 'username#0000' },
  { key: 'org.telegram', label: 'Telegram', placeholder: 'username' },
  { key: 'email', label: 'Email', placeholder: 'you@example.com' },
  { key: 'location', label: 'Location', placeholder: 'City, Country' },
  { key: 'avatar', label: 'Avatar URL', placeholder: 'https://... or ipfs://...' },
]

export default function EditProfileModal({ isOpen, onClose, profile, onSuccess }) {
  const [formData, setFormData] = useState({})
  const [pendingField, setPendingField] = useState(null)
  const [savedFields, setSavedFields] = useState([])

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        description: profile.description || '',
        url: profile.url || '',
        'com.twitter': profile.social?.twitter || '',
        'com.github': profile.social?.github || '',
        'com.discord': profile.social?.discord || '',
        'org.telegram': profile.social?.telegram || '',
        email: profile.email || '',
        location: profile.location || '',
        avatar: profile.avatar || '',
      })
    }
  }, [profile])

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && pendingField) {
      setSavedFields((prev) => [...prev, pendingField])
      setPendingField(null)
      reset()
    }
  }, [isSuccess, pendingField, reset])

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveField = async (key) => {
    if (!profile?.resolver || !profile?.name) {
      alert('No resolver found for this ENS name')
      return
    }

    try {
      const node = namehash(normalize(profile.name))
      setPendingField(key)

      writeContract({
        address: profile.resolver,
        abi: resolverAbi,
        functionName: 'setText',
        args: [node, key, formData[key] || ''],
      })
    } catch (err) {
      console.error('Error saving field:', err)
      setPendingField(null)
    }
  }

  const handleSaveAll = async () => {
    // Get fields that have changed
    const changedFields = TEXT_RECORD_FIELDS.filter(({ key }) => {
      const original = getOriginalValue(key)
      return formData[key] !== original
    })

    if (changedFields.length === 0) {
      alert('No changes to save')
      return
    }

    // Save first changed field (user needs to confirm each transaction)
    const firstField = changedFields[0]
    await handleSaveField(firstField.key)
  }

  const getOriginalValue = (key) => {
    if (!profile) return ''
    switch (key) {
      case 'description': return profile.description || ''
      case 'url': return profile.url || ''
      case 'com.twitter': return profile.social?.twitter || ''
      case 'com.github': return profile.social?.github || ''
      case 'com.discord': return profile.social?.discord || ''
      case 'org.telegram': return profile.social?.telegram || ''
      case 'email': return profile.email || ''
      case 'location': return profile.location || ''
      case 'avatar': return profile.avatar || ''
      default: return ''
    }
  }

  const hasChanges = (key) => {
    return formData[key] !== getOriginalValue(key)
  }

  const handleClose = () => {
    if (savedFields.length > 0) {
      onSuccess?.()
    }
    onClose()
    setSavedFields([])
    setPendingField(null)
    reset()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Edit Profile</h2>
              <p className="text-sm text-[#6e6e73] mt-1">{profile?.name}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#f5f5f5] rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Info banner */}
          <div className="p-4 bg-[#f0f7ff] border border-[#0071e3]/20 rounded-xl">
            <p className="text-sm text-[#1d1d1f]">
              <strong>On-chain editing:</strong> Each field change requires a blockchain transaction.
              You'll need to confirm each change in your wallet and pay gas fees.
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-4 bg-[#fff0f0] border border-[#ff453a]/20 rounded-xl">
              <p className="text-sm text-[#ff453a]">
                {error.message?.includes('User rejected')
                  ? 'Transaction rejected by user'
                  : error.message || 'Transaction failed'}
              </p>
            </div>
          )}

          {/* Fields */}
          {TEXT_RECORD_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#1d1d1f]">{label}</label>
                {savedFields.includes(key) && (
                  <span className="text-xs text-[#30d158] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Saved
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {key === 'description' ? (
                  <textarea
                    value={formData[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="flex-1 px-4 py-3 bg-[#f5f5f5] rounded-xl border-0 text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                  />
                ) : (
                  <input
                    type={key === 'email' ? 'email' : 'text'}
                    value={formData[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-3 bg-[#f5f5f5] rounded-xl border-0 text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                )}
                <button
                  onClick={() => handleSaveField(key)}
                  disabled={!hasChanges(key) || isPending || isConfirming}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${
                    hasChanges(key) && !isPending && !isConfirming
                      ? 'bg-[#1d1d1f] text-white hover:bg-black'
                      : 'bg-[#e5e5e5] text-[#86868b] cursor-not-allowed'
                  }`}
                >
                  {pendingField === key && (isPending || isConfirming) ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e5e5e5] bg-[#fafafa]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#86868b]">
              {savedFields.length > 0 && `${savedFields.length} field(s) saved on-chain`}
            </p>
            <button
              onClick={handleClose}
              className="px-5 py-2 bg-[#1d1d1f] text-white rounded-full text-sm font-medium hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
