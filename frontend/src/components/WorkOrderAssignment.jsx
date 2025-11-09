import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import PrimaryButton from './PrimaryButton'

function WorkOrderAssignment({ workOrder, isOpen, onClose, onAssign }) {
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [loading, setLoading] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Mock technicians list - in real app, fetch from API
  const technicians = [
    { id: 'tech-1', name: 'John Smith', team: 'compute', available: true },
    { id: 'tech-2', name: 'Sarah Johnson', team: 'network', available: true },
    { id: 'tech-3', name: 'Mike Chen', team: 'storage', available: false },
    { id: 'tech-4', name: 'Emily Davis', team: 'compute', available: true },
  ]

  const handleAssign = async () => {
    if (!selectedTechnician) return
    
    setLoading(true)
    try {
      await onAssign(workOrder.id, selectedTechnician)
      onClose()
    } catch (err) {
      console.error('Error assigning work order:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-bg-elevated rounded-lg border border-border shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-h1 text-text-primary">Assign Work Order</h2>
              <button
                onClick={onClose}
                className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {workOrder && (
              <p className="text-sm text-text-secondary mt-2">
                {workOrder.title} • {workOrder.rack}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Select Technician
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {technicians.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTechnician(tech.id)}
                    disabled={!tech.available}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedTechnician === tech.id
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-50'
                        : tech.available
                        ? 'border-border bg-bg-secondary hover:bg-bg-tertiary'
                        : 'border-border bg-bg-tertiary opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{tech.name}</p>
                        <p className="text-xs text-text-secondary capitalize">{tech.team} Team</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!tech.available && (
                          <span className="text-xs text-text-tertiary">Unavailable</span>
                        )}
                        {selectedTechnician === tech.id && (
                          <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <PrimaryButton
                type="button"
                onClick={onClose}
                variant="ghost"
                disabled={loading}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                onClick={handleAssign}
                variant="primary"
                disabled={loading || !selectedTechnician}
              >
                {loading ? 'Assigning...' : 'Assign Work Order'}
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default WorkOrderAssignment

