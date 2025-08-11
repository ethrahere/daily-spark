interface QuestionCardProps {
  question: string
  className?: string
}

export default function QuestionCard({ question, className = '' }: QuestionCardProps) {
  return (
    <div className={`bg-white rounded-3xl p-8 shadow-sm border border-gray-100 ${className}`}>
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0052FF]/10 rounded-full mb-4">
            <span className="text-2xl">💭</span>
          </div>
          <h2 className="text-lg font-medium text-gray-600 mb-2">Today's Spark</h2>
        </div>
        
        <p className="text-2xl leading-relaxed text-gray-900 font-light">
          {question}
        </p>
      </div>
    </div>
  )
}