import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'ENS Profile Viewer' }),
  ],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_RPC_URL || 'https://eth.drpc.org'),
  },
})
