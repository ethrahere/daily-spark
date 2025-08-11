'use client'

import { ReactNode, useEffect } from 'react'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { base } from 'viem/chains'
import { http, createConfig } from 'wagmi'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'
import sdk from '@farcaster/miniapp-sdk'

// Wagmi config for Base network with wallet connectors
const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({ appName: 'Daily Spark' }),
    metaMask(),
  ],
  transports: {
    [base.id]: http(),
  },
})

const queryClient = new QueryClient()

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    const initializeFrameSDK = async () => {
      try {
        await sdk.actions.ready()
      } catch (error) {
        console.error('Frame SDK initialization error:', error)
      }
    }
    initializeFrameSDK()
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              mode: 'auto',
              theme: 'default',
              name: 'Daily Spark',
              logo: '/icon.svg'
            }
          }}
        >
          <MiniKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
          >
            {children}
          </MiniKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}