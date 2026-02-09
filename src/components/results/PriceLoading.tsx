/**
 * Loading skeleton for market price data
 */

export default function PriceLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-32"></div>
        <div className="h-5 bg-gray-200 rounded w-24"></div>
      </div>

      <div className="space-y-3">
        {/* AI Estimate skeleton */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>

        {/* eBay skeleton */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-56"></div>
        </div>

        {/* Grailed skeleton */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Aggregated skeleton */}
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="h-5 bg-blue-200 rounded w-40 mb-2"></div>
          <div className="h-10 bg-blue-200 rounded w-40"></div>
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>실시간 시장 가격 조회 중...</span>
        </div>
      </div>
    </div>
  );
}
