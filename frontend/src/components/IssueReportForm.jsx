import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useAuth } from '../contexts/AuthContext'

function IssueReportForm({ isOpen, onClose, stepTitle, stepIndex, onSubmit }) {
  const prefersReducedMotion = useReducedMotion()
  const { isTechnician } = useAuth()
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    additionalNotes: '',
    urgency: 'medium',
    escalateToEngineer: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    // TODO: Replace with actual API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const issueReport = {
        stepIndex,
        stepTitle,
        ...formData,
        timestamp: new Date().toISOString(),
      }
      
      onSubmit?.(issueReport)
      handleClose()
    } catch (err) {
      console.error('Error submitting issue report:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      reason: '',
      description: '',
      additionalNotes: '',
      urgency: 'medium',
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
              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Reason for Issue <span className="text-danger-500">*</span>
                </label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                >
                  <option value="">Select a reason...</option>
                  <option value="missing-parts">Missing Required Parts</option>
                  <option value="missing-tools">Missing Required Tools</option>
                  <option value="safety-concern">Safety Concern</option>
                  <option value="technical-issue">Technical Issue</option>
                  <option value="access-problem">Access/Physical Problem</option>
                  <option value="documentation-unclear">Documentation Unclear</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Urgency Level <span className="text-danger-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'low', label: 'Low', color: 'text-success-600 dark:text-success-400' },
                    { value: 'medium', label: 'Medium', color: 'text-warning-600 dark:text-warning-400' },
                    { value: 'high', label: 'High', color: 'text-danger-600 dark:text-danger-400' },
                  ].map((level) => (
                    <label
                      key={level.value}
                      className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.urgency === level.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-border bg-bg-secondary hover:border-border-hover'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level.value}
                        checked={formData.urgency === level.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className={`text-sm font-medium ${formData.urgency === level.value ? level.color : 'text-text-secondary'}`}>
                        {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

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
                  rows={4}
                  placeholder="Describe the issue in detail. What happened? What prevented you from completing this step?"
                  className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-text-primary mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any additional information, suggestions, or context that might be helpful..."
                  className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              {/* Escalation Option for Technicians */}
              {isTechnician() && (
                <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="escalateToEngineer"
                      checked={formData.escalateToEngineer}
                      onChange={(e) => setFormData(prev => ({ ...prev, escalateToEngineer: e.target.checked }))}
                      className="mt-1 w-4 h-4 text-brand-500 border-border rounded focus:ring-brand-500 focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-medium text-warning-700 dark:text-warning-300 block">
                        Escalate to Engineer
                      </span>
                      <span className="text-xs text-warning-600 dark:text-warning-400 mt-1 block">
                        Check this box to send this issue directly to an engineer for review. Engineers will be notified and can provide guidance or take over the task.
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.reason || !formData.description}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default IssueReportForm

