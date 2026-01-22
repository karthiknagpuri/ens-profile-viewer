import { useState } from 'react'
import { generateIdenticon } from '../utils/format'

export default function Avatar({ src, address, name, size = 'lg' }) {
  const [error, setError] = useState(false)

  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  }

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  }

  const sizeClass = sizes[size] || sizes.lg
  const textSize = textSizes[size] || textSizes.lg

  const initial = name ? name.charAt(0).toUpperCase() : address ? address.charAt(2).toUpperCase() : '?'
  const bgColor = generateIdenticon(address)

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setError(true)}
        className={`${sizeClass} rounded-full object-cover bg-[#f5f5f5]`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white`}
      style={{ backgroundColor: bgColor }}
    >
      <span className={textSize}>{initial}</span>
    </div>
  )
}
