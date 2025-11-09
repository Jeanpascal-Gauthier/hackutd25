import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useAuth } from '../contexts/AuthContext'

function IssueReportForm({ isOpen, onClose, stepTitle, stepIndex, onSubmit, isSubmitting: externalIsSubmitting = false }) {
  const prefersReducedMotion = useReducedMotion()
  const { isTechnician } = useAuth()
  const [formData, setFormData] = useState({
    description: '',
    escalateToEngineer: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isLoading = isSubmitting || externalIsSubmitting
  
  // Loading spinner component
  const LoadingSpinner = ({ size = 'w-4 h-4' }) => (
    <svg
      className={`${size} animate-spin text-current`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const issueReport = {
      stepIndex,
      stepTitle,
      ...formData,
      timestamp: new Date().toISOString(),
    }
    
    try {
      await onSubmit?.(issueReport)
      // Don't close here - let the parent handle it after API call completes
    } catch (err) {
      console.error('Error submitting issue report:', err)
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      description: '',
      escalateToEngineer: false,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 dark:bg-black/60"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-bg-elevated border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-bg-elevated/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size="w-8 h-8" />
                <p className="text-sm text-text-secondary">Regenerating steps with AI...</p>
                <p className="text-xs text-text-tertiary">This may take a few moments</p>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-h2 text-text-primary mb-1">
                  Report Issue with Step
                </h2>
                <p className="text-sm text-text-secondary">
                  Step: <span className="font-medium">{stepTitle}</span>
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                    Issue Description <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    rows={6}
                    placeholder="Describe the issue in detail. What happened? What prevented you from completing this step? The AI will regenerate steps from this point onwards based on your description."
                    className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-text-tertiary mt-2">
                    The AI will analyze this issue and regenerate the remaining steps to address it.
                  </p>
                </div>

                {/* Escalation Option */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="escalateToEngineer"
                      name="escalateToEngineer"
                      type="checkbox"
                      checked={formData.escalateToEngineer}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-4 h-4 text-brand-500 bg-bg-secondary border-border rounded focus:ring-brand-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="escalateToEngineer" className="font-medium text-text-primary">
                      Escalate to Engineer
                    </label>
                    <p className="text-xs text-text-secondary mt-1">
                      {formData.escalateToEngineer 
                        ? 'This issue will be sent to engineers for review instead of being handled by the AI.'
                        : 'Check this box to send this issue directly to engineers instead of regenerating steps with AI.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - Fixed at bottom */}
            <div className="flex items-center justify-end space-x-3 p-6 pt-4 border-t border-border bg-bg-elevated">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.description}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="w-4 h-4" />
                    <span>{formData.escalateToEngineer ? 'Posting to Engineers...' : 'Regenerating Steps...'}</span>
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default IssueReportForm

