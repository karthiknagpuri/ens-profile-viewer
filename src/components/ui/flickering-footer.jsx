import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { FlickeringGrid } from './flickering-grid'
import { GitHubLogoIcon, TwitterLogoIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { useTheme } from '../../context/ThemeContext'

// Site configuration for footer
const siteConfig = {
  name: 'ENS Profile',
  description: 'Explore ENS profiles, discover connections, and visualize the decentralized identity network on Ethereum.',
  footerLinks: [
    {
      title: 'Product',
      links: [
        { id: 1, title: 'Home', url: '/' },
        { id: 2, title: 'Network Graph', url: '/graph' },
        { id: 3, title: 'Search', url: '/' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { id: 4, title: 'ENS Domains', url: 'https://app.ens.domains', external: true },
        { id: 5, title: 'Etherscan', url: 'https://etherscan.io', external: true },
        { id: 6, title: 'Documentation', url: 'https://docs.ens.domains', external: true },
      ],
    },
    {
      title: 'Ecosystem',
      links: [
        { id: 7, title: 'About ENS', url: 'https://ens.domains', external: true },
        { id: 8, title: 'Blog', url: 'https://blog.ens.domains', external: true },
        { id: 9, title: 'Governance', url: 'https://ensdao.org', external: true },
      ],
    },
  ],
}


// ENS Logo Icon (Ethereum diamond)
function ENSLogo({ className }) {
  return (
    <svg viewBox="0 0 256 417" className={className} fill="currentColor">
      <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" opacity="0.6" />
      <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
      <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" opacity="0.6" />
      <path d="M127.962 416.905V312.187L0 236.587z" />
    </svg>
  )
}

// Ethereum Badge
function EthereumBadge({ className }) {
  return (
    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-secondary)] rounded-full', className)}>
      <svg viewBox="0 0 256 417" className="w-3 h-4" fill="#627EEA">
        <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" opacity="0.6" />
        <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
        <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" opacity="0.6" />
        <path d="M127.962 416.905V312.187L0 236.587z" />
      </svg>
      <span className="text-xs font-medium text-[#627EEA]">Ethereum</span>
    </div>
  )
}

// Decentralized Badge
function DecentralizedBadge({ className }) {
  return (
    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-secondary)] rounded-full', className)}>
      <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
      <span className="text-xs font-medium text-[var(--color-text-primary)]">Decentralized</span>
    </div>
  )
}

// Web3 Badge
function Web3Badge({ className }) {
  return (
    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-secondary)] rounded-full', className)}>
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <span className="text-xs font-medium text-[var(--color-text-primary)]">Web3</span>
    </div>
  )
}

// Media query hook
function useMediaQuery(query) {
  const [value, setValue] = useState(false)

  useEffect(() => {
    function checkQuery() {
      const result = window.matchMedia(query)
      setValue(result.matches)
    }

    checkQuery()
    window.addEventListener('resize', checkQuery)
    const mediaQuery = window.matchMedia(query)
    mediaQuery.addEventListener('change', checkQuery)

    return () => {
      window.removeEventListener('resize', checkQuery)
      mediaQuery.removeEventListener('change', checkQuery)
    }
  }, [query])

  return value
}

export default function FlickeringFooter() {
  const tablet = useMediaQuery('(max-width: 1024px)')
  const { theme } = useTheme()

  return (
    <footer id="footer" className="w-full pb-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] transition-colors duration-300">
      {/* Footer Content */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between p-8 md:p-10">
        {/* Left side - Logo, description, badges */}
        <div className="flex flex-col items-start justify-start gap-y-5 max-w-xs mx-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
              <ENSLogo className="w-5 h-7 text-[var(--color-surface)]" />
            </div>
            <p className="text-xl font-semibold text-[var(--color-text-primary)]">{siteConfig.name}</p>
          </Link>
          <p className="tracking-tight text-[var(--color-text-secondary)] font-medium text-sm leading-relaxed">
            {siteConfig.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <EthereumBadge />
            <DecentralizedBadge />
            <Web3Badge />
          </div>
          {/* Social Links */}
          <div className="flex items-center gap-3 mt-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-border)] transition-colors"
            >
              <GitHubLogoIcon className="w-5 h-5 text-[var(--color-text-primary)]" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-border)] transition-colors"
            >
              <TwitterLogoIcon className="w-5 h-5 text-[var(--color-text-primary)]" />
            </a>
          </div>
        </div>

        {/* Right side - Footer link columns */}
        <div className="pt-8 md:pt-0 md:w-1/2">
          <div className="flex flex-col items-start justify-start md:flex-row md:items-start md:justify-between gap-y-6 lg:pl-10">
            {siteConfig.footerLinks.map((column, columnIndex) => (
              <ul key={columnIndex} className="flex flex-col gap-y-2">
                <li className="mb-2 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  {column.title}
                </li>
                {column.links.map((link) => (
                  <li
                    key={link.id}
                    className="group inline-flex cursor-pointer items-center justify-start gap-1 text-sm text-[var(--color-text-primary)]"
                  >
                    {link.external ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#0071e3] transition-colors"
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link to={link.url} className="hover:text-[#0071e3] transition-colors">
                        {link.title}
                      </Link>
                    )}
                    <div className="flex size-4 items-center justify-center border border-[var(--color-border)] rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
                      <ChevronRightIcon className="h-3 w-3 text-[var(--color-text-secondary)]" />
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {/* FlickeringGrid with Text at Bottom */}
      <div className="w-full h-48 md:h-56 relative mt-4 md:mt-6 z-0">
        {/* Gradient overlay - fades from background to transparent */}
        <div
          className="absolute inset-0 z-10 from-40%"
          style={{
            background: `linear-gradient(to top, transparent, var(--color-surface))`
          }}
        />

        {/* FlickeringGrid with text */}
        <div className="absolute inset-0 mx-6">
          <FlickeringGrid
            text={tablet ? 'Decentralization' : 'The Power of Decentralization'}
            fontSize={tablet ? 48 : 72}
            fontWeight={600}
            className="h-full w-full"
            squareSize={2}
            gridGap={tablet ? 2 : 3}
            color={theme === 'dark' ? '#d1d5db' : '#6B7280'}
            maxOpacity={theme === 'dark' ? 0.6 : 0.3}
            flickerChance={0.1}
          />
        </div>
      </div>
    </footer>
  )
}
