import { motion } from 'framer-motion'

function LocationGuidance({ workOrder }) {
  if (!workOrder?.location) return null

  const { pod, aisle, aisleType } = workOrder.location
  const isColdAisle = aisleType === 'cold'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border-2 ${
        isColdAisle
          ? 'bg-cold-aisle-50 border-cold-aisle-500'
          : 'bg-hot-aisle-50 border-hot-aisle-500'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isColdAisle ? 'bg-cold-aisle-500' : 'bg-hot-aisle-500'
          }`}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">Location</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-slate-600">Pod:</span>
              <span className="font-mono font-medium text-slate-900">{pod}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-600">Aisle:</span>
              <span className="font-mono font-medium text-slate-900">{aisle}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-600">Type:</span>
              <span
                className={`font-medium ${
                  isColdAisle ? 'text-cold-aisle-600' : 'text-hot-aisle-600'
                }`}
              >
                {aisleType.toUpperCase()} AISLE
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default LocationGuidance

