'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownLink, 
  WalletDropdownDisconnect
} from '@coinbase/onchainkit/wallet'
import { 
  Address, 
  Avatar, 
  Name, 
  Identity, 
  EthBalance,
  useAvatar,
  useName
} from '@coinbase/onchainkit/identity'

interface WalletConnectProps {
  onWalletInfo?: (info: { name?: string; avatar?: string; address?: string }) => void
}

export default function WalletConnect({ onWalletInfo }: WalletConnectProps) {
  const { address, isConnected } = useAccount()
  const { data: ensName, isLoading: nameLoading } = useName({ 
    address: address as `0x${string}`,
    enabled: !!address
  })
  const { data: ensAvatar, isLoading: avatarLoading } = useAvatar({ 
    ensName: ensName as string,
    enabled: !!ensName
  })

  // Debug wallet data
  React.useEffect(() => {
    console.log('🔍 Wallet Debug Info:', { 
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None',
      isConnected, 
      ensName: ensName || 'No ENS name',
      ensAvatar: ensAvatar || 'No ENS avatar',
      nameLoading, 
      avatarLoading 
    })
  }, [address, isConnected, ensName, ensAvatar, nameLoading, avatarLoading])

  // Pass wallet info to parent when available
  React.useEffect(() => {
    console.log('💡 Passing wallet info to parent:', {
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None',
      name: ensName || 'No name',
      avatar: ensAvatar || 'No avatar',
      hasOnWalletInfo: !!onWalletInfo
    })
    
    if (address && onWalletInfo) {
      onWalletInfo({
        name: ensName || undefined,
        avatar: ensAvatar || undefined,
        address: address
      })
    }
  }, [address, ensName, ensAvatar, onWalletInfo])

  return (
    <div className="flex items-center justify-center">
      <Wallet>
        <ConnectWallet 
          className="bg-[#0052FF] hover:bg-[#0052FF]/90 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200"
        >
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown className="bg-white border border-gray-200 rounded-2xl shadow-lg backdrop-blur-sm">
          <Identity 
            className="px-4 pt-3 pb-2 bg-white rounded-t-2xl" 
            hasCopyAddressOnClick
          >
            <Avatar className="border-2 border-gray-100" />
            <Name className="text-gray-900 font-medium" />
            <Address className="text-gray-500 text-sm" />
            <EthBalance className="text-gray-700 font-semibold" />
          </Identity>
          <WalletDropdownLink 
            icon="wallet" 
            href="https://keys.coinbase.com"
            target="_blank"
            className="px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 border-t border-gray-100"
          >
            Wallet
          </WalletDropdownLink>
          <WalletDropdownDisconnect className="px-4 py-3 bg-white hover:bg-red-50 text-red-600 rounded-b-2xl border-t border-gray-100" />
        </WalletDropdown>
      </Wallet>
    </div>
  )
}