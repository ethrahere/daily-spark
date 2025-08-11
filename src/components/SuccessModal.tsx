'use client'

import { useEffect } from 'react'

interface SuccessModalProps {
  tokensEarned: number
  onClose: () => void
}

export default function SuccessModal({ 
  tokensEarned, 
  onClose 
}: SuccessModalProps) {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 1500)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-scale-in shadow-2xl">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Great Answer!
        </h2>
        <p className="text-gray-600">
          You earned <span className="font-semibold text-[#0052FF]">{tokensEarned} tokens</span>
        </p>
      </div>
    </div>
  )
}