import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import StatusChip from './StatusChip'
import StatCard from './StatCard'
import Timeline from './Timeline'
import PrimaryButton from './PrimaryButton'
import InventoryBadge from './InventoryBadge'
import IssueReportForm from './IssueReportForm'
import { useReducedMotion } from '../hooks/useReducedMotion'

function WorkOrderDetails({ workOrderId, onLogsClick, onRunPlan }) {
  const [workOrder, setWorkOrder] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [runningPlan, setRunningPlan] = useState(false)
  const [issueFormOpen, setIssueFormOpen] = useState(false)
  const [selectedStepIndex, setSelectedStepIndex] = useState(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrderDetails()
    }
  }, [workOrderId])

  const fetchWorkOrderDetails = async () => {
    if (!workOrderId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch work order
      const woResponse = await fetch(`/api/work_orders/${workOrderId}`)
      if (!woResponse.ok) throw new Error('Failed to fetch work order')
      const woData = await woResponse.json()
      setWorkOrder(woData)

      // Fetch inventory if part_id exists
      if (woData.part_id) {
        try {
          const invResponse = await fetch(`/api/inventory/${woData.part_id}`)
          if (invResponse.ok) {
            const invData = await invResponse.json()
            setInventory(invData)
          }
        } catch (err) {
          console.error('Error fetching inventory:', err)
        }
      }

      // Mock steps based on work order
      const mockSteps = [
        { title: 'Verify Work Order', description: 'Review work order details and requirements' },
        { title: 'Check Inventory', description: 'Verify required parts are available' },
        { title: 'Prepare Equipment', description: 'Gather necessary tools and safety equipment' },
        { title: 'Execute Repair', description: 'Perform the repair procedure' },
        { title: 'Verify Completion', description: 'Test and verify the repair is successful' },
      ]
      setSteps(mockSteps)

    } catch (err) {
      setError(err.message)
      // Fallback mock data
      setWorkOrder({
        id: workOrderId,
        title: 'Replace GPU Node A12',
        status: 'pending',
        severity: 'high',
        rack: 'Rack-A12',
        model: 'NVIDIA A100',
        part_id: 'gpu-a100',
        created_at: new Date().toISOString(),
      })
      setSteps([
        { title: 'Verify Work Order', description: 'Review work order details' },
        { title: 'Check Inventory', description: 'Verify parts availability' },
        { title: 'Execute Repair', description: 'Perform the repair' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRunStep = async (stepIndex) => {
    const step = steps[stepIndex]
    // Simulate step execution with detailed logs
    const updatedSteps = [...steps]
    const success = Math.random() > 0.2 // 80% success rate
    
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      result: {
        success: success,
        message: success 
          ? `${step.title} completed successfully` 
          : `${step.title} failed - retry required`,
        timestamp: new Date().toISOString(),
      },
    }
    setSteps(updatedSteps)
    
    // Add detailed activity logs
    if (onLogsClick) {
      // This would be passed from parent to add logs
      // For now, we'll trigger the logs drawer to show
    }
    
    if (success) {
      setCurrentStep(stepIndex + 1)
    }
  }

  const handleStepComplete = (stepIndex) => {
    const updatedSteps = [...steps]
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      result: {
        success: true,
        message: 'Step marked as completed',
        timestamp: new Date().toISOString(),
      },
    }
    setSteps(updatedSteps)
    setCurrentStep(stepIndex + 1)
  }

  const handleStepFail = (stepIndex) => {
    const updatedSteps = [...steps]
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      result: {
        success: false,
        message: 'Step marked as failed - replan required',
        timestamp: new Date().toISOString(),
      },
    }
    setSteps(updatedSteps)
  }

  const handleRunPlan = async () => {
    setRunningPlan(true)
    onRunPlan?.(workOrderId)
    try {
      const response = await fetch(`/api/start_agent/${workOrderId}`, {
        method: 'POST',
      })
      const result = await response.json()

      // Update steps with agent results
      if (result.plan) {
        setSteps(result.plan.map((title, index) => ({
          title,
          description: `Step ${index + 1} of the repair procedure`,
        })))
      }
    } catch (err) {
      console.error('Error running plan:', err)
    } finally {
      setRunningPlan(false)
    }
  }

  const handleReportIssue = (stepIndex) => {
    setSelectedStepIndex(stepIndex)
    setIssueFormOpen(true)
  }

  const handleIssueSubmit = (issueReport) => {
    // Update the step with the issue report
    const updatedSteps = [...steps]
    updatedSteps[issueReport.stepIndex] = {
      ...updatedSteps[issueReport.stepIndex],
      issueReport,
    }
    setSteps(updatedSteps)
    
    // TODO: Send to backend API
    console.log('Issue report submitted:', issueReport)
    // Example API call (commented out for now):
    // fetch(`/api/workorders/${workOrderId}/issues`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(issueReport),
    // })
  }

  const handleRunPlan = async () => {
    setRunningPlan(true)
    onRunPlan?.(workOrderId)
    try {
      const response = await fetch(`/api/start_agent/${workOrderId}`, {
        method: 'POST',
      })
      const result = await response.json()

  if (!workOrderId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-body text-text-tertiary">
            Select a work order to view details
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-tertiary rounded w-3/4" />
          <div className="h-4 bg-bg-tertiary rounded w-1/2" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-bg-tertiary rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !workOrder) {
    return (
      <div className="p-8">
        <div className="bg-danger-50 dark:bg-danger-50 border border-danger-200 dark:border-danger-200 rounded-lg p-4">
          <p className="text-sm text-danger-600 dark:text-danger-500">
            Error loading work order: {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-y-auto"
    >
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-h1 text-text-primary mb-2">
                {workOrder?.title || 'Work Order Details'}
              </h1>
              <div className="flex items-center space-x-4 text-body text-text-secondary">
                {workOrder?.rack && (
                  <span className="font-mono text-code">{workOrder.rack}</span>
                )}
                {workOrder?.model && (
                  <span>{workOrder.model}</span>
                )}
                {workOrder?.part_id && (
                  <span className="font-mono text-code">Part: {workOrder.part_id}</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {workOrder?.status && (
                <StatusChip status={workOrder.status} />
              )}
              {inventory && (
                <InventoryBadge
                  available={inventory.available}
                  quantity={inventory.quantity}
                  location={inventory.location}
                />
              )}
            </div>
          </div>
        </div>

        {/* Key Info Strip */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Inventory Status"
            value={inventory?.available ? 'Available' : 'Unavailable'}
            variant={inventory?.available ? 'success' : 'danger'}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatCard
            label="Qty @ Site"
            value={inventory?.quantity ?? 'N/A'}
            variant="default"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label="SLA Clock"
            value={formatSLA()}
            variant="warning"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Steps Timeline */}
        <div className="bg-bg-elevated border border-border rounded-lg shadow-sm p-6">
          <h2 className="text-h2 text-text-primary mb-6">Procedure Steps</h2>
          <Timeline
            steps={steps}
            onRunStep={handleRunStep}
            onStepComplete={handleStepComplete}
            onStepFail={handleStepFail}
            currentStep={currentStep}
          />
        </div>
        {/* Steps Timeline */}
        <div className="bg-bg-elevated border border-border rounded-lg shadow-sm p-6">
          <h2 className="text-h2 text-text-primary mb-6">Procedure Steps</h2>
          <Timeline
            steps={steps}
            onRunStep={handleRunStep}
            currentStep={currentStep}
            onReportIssue={handleReportIssue}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <PrimaryButton
              onClick={handleRunPlan}
              disabled={runningPlan}
              variant="primary"
            >
              {runningPlan ? 'Running...' : 'Run Plan'}
            </PrimaryButton>
            <PrimaryButton
              onClick={() => {
                setSteps([])
                setCurrentStep(0)
                fetchWorkOrderDetails()
              }}
              variant="ghost"
            >
              Replan
            </PrimaryButton>
            {onAssignClick && (
              <PrimaryButton
                onClick={onAssignClick}
                variant="ghost"
              >
                Assign
              </PrimaryButton>
            )}
          </div>
          <button
            onClick={onLogsClick}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            View Logs →
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkOrderDetails
