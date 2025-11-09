import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useAuth } from '../contexts/AuthContext'

function IssueReportForm({ isOpen, onClose, stepTitle, stepIndex, onSubmit, isSubmitting: externalIsSubmitting = false }) {
  const prefersReducedMotion = useReducedMotion()
  const { isTechnician } = useAuth()
  const [formData, setFormData] = useState({
    description: '',
    // reason: '',  // Commented out - not needed for now
    // additionalNotes: '',  // Commented out - not needed for now
    // urgency: 'medium',  // Commented out - not needed for now
    // escalateToEngineer: false,  // Commented out - not needed for now
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
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
      // reason: '',  // Commented out
      // additionalNotes: '',  // Commented out
      // urgency: 'medium',  // Commented out
      // escalateToEngineer: false,  // Commented out
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
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
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

              {/* Commented out fields - not needed for now */}
              {/* Reason Selection - Commented out */}
              {/* Urgency Level - Commented out */}
              {/* Additional Notes - Commented out */}
              {/* Escalation Option - Commented out */}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-border">
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
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="w-4 h-4" />
                    <span>Regenerating Steps...</span>
                  </>
                ) : (
                  'Submit Report'
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

