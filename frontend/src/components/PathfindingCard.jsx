import { motion } from 'framer-motion'

function PathfindingCard({ fromLocation, toLocation, path }) {
  if (!fromLocation || !toLocation) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-pink-50 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
    >
      <h3 className="font-semibold text-text-primary mb-3 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        Navigation Path
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">From:</span>
          <span className="font-mono font-medium text-text-primary">
            {fromLocation.pod} - {fromLocation.aisle}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">To:</span>
          <span className="font-mono font-medium text-text-primary">
            {toLocation.pod} - {toLocation.aisle}
          </span>
        </div>
        {path && (
          <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-2 text-xs text-text-secondary">
              <span>Route:</span>
              <span className="font-mono">{path.join(' → ')}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default PathfindingCard

