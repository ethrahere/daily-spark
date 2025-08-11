'use client'

import { AppTab } from '@/types'

interface BottomNavigationProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  hasAnswered: boolean
}

export default function BottomNavigation({ 
  activeTab, 
  onTabChange, 
  hasAnswered 
}: BottomNavigationProps) {
  const tabs = [
    {
      id: 'home' as AppTab,
      label: 'Today',
      icon: hasAnswered ? '🏠' : '⚡',
      disabled: false
    },
    {
      id: 'suggest' as AppTab,
      label: 'Suggest',
      icon: '💡',
      disabled: false
    },
    {
      id: 'rankings' as AppTab,
      label: 'Rankings',
      icon: '🏆',
      disabled: false
    },
    {
      id: 'profile' as AppTab,
      label: 'Profile',
      icon: '👤',
      disabled: false
    }
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-6 py-2 safe-area-pb z-40">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex flex-col items-center py-2 px-4 min-w-0 transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-[#0052FF]'
                : tab.disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 active:scale-95'
            }`}
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium truncate">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}