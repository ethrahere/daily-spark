'use client'

import { Avatar, Name } from '@coinbase/onchainkit/identity'
import { base } from 'viem/chains'

interface BaseUserProps {
  address?: string
  username?: string
  avatar?: string
  showName?: boolean
  showAvatar?: boolean
  className?: string
  avatarClassName?: string
  nameClassName?: string
}

export default function BaseUser({ 
  address, 
  username, 
  avatar, 
  showName = true, 
  showAvatar = true,
  className = "",
  avatarClassName = "",
  nameClassName = ""
}: BaseUserProps) {
  // If we have a wallet address, try to resolve Base name and avatar
  if (address) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showAvatar && (
          <Avatar 
            address={address as `0x${string}`} 
            chain={base} 
            className={`w-8 h-8 rounded-full ${avatarClassName}`}
            defaultComponent={
              <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm ${avatarClassName}`}>
                {avatar || '👤'}
              </div>
            }
          />
        )}
        {showName && (
          <Name 
            address={address as `0x${string}`} 
            chain={base}
            className={`font-medium ${nameClassName}`}
            slashIcon={false}
            defaultComponent={
              <span className={`font-medium ${nameClassName}`}>
                {username || `${address.slice(0, 6)}...${address.slice(-4)}`}
              </span>
            }
          />
        )}
      </div>
    )
  }

  // Fallback to provided username and avatar
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showAvatar && (
        <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm ${avatarClassName}`}>
          {avatar || '👤'}
        </div>
      )}
      {showName && (
        <span className={`font-medium ${nameClassName}`}>
          {username || 'Anonymous'}
        </span>
      )}
    </div>
  )
}