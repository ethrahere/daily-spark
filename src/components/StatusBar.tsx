interface StatusBarProps {
  streak: number
  tokens: number
  hasAnswered: boolean
}

export default function StatusBar({ streak, tokens, hasAnswered }: StatusBarProps) {
  return (
    <div className="bg-gradient-to-r from-[#0052FF]/5 to-[#0052FF]/10 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-lg font-semibold text-gray-900">{streak}</div>
              <div className="text-xs text-gray-500">streak</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-lg font-semibold text-gray-900">{tokens}</div>
              <div className="text-xs text-gray-500">tokens</div>
            </div>
          </div>
        </div>
        
        {hasAnswered && (
          <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
            <span className="text-green-600">✅</span>
            <span className="text-sm font-medium text-green-700">Answered</span>
          </div>
        )}
      </div>
    </div>
  )
}