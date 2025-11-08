import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import StatusBadge from './StatusBadge'
import StatCard from './StatCard'
import Timeline from './Timeline'
import LogItem from './LogItem'
import PrimaryButton from './PrimaryButton'

function WorkOrderDetails({ workOrderId }) {
  const [workOrder, setWorkOrder] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [logs, setLogs] = useState([])
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [runningPlan, setRunningPlan] = useState(false)

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
      const woResponse = await fetch(`/api/workorders/${workOrderId}`)
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

      // Mock logs
      setLogs([
        { message: 'Work order loaded', type: 'info', timestamp: new Date().toISOString() },
        { message: 'Inventory check initiated', type: 'info', timestamp: new Date().toISOString() },
      ])

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
    // Simulate step execution
    const updatedSteps = [...steps]
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      result: {
        success: Math.random() > 0.2, // 80% success rate
        message: Math.random() > 0.2 ? 'Step completed successfully' : 'Step failed - retry required',
        timestamp: new Date().toISOString(),
      },
    }
    setSteps(updatedSteps)
    setCurrentStep(stepIndex + 1)

    // Add log entry
    setLogs(prev => [
      ...prev,
      {
        message: `Step ${stepIndex + 1}: ${updatedSteps[stepIndex].result.message}`,
        type: updatedSteps[stepIndex].result.success ? 'success' : 'error',
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const handleRunPlan = async () => {
    setRunningPlan(true)
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

      // Add agent logs
      if (result.logs) {
        setLogs(prev => [
          ...prev,
          ...result.logs.map(log => ({
            message: log,
            type: 'info',
            timestamp: new Date().toISOString(),
          })),
        ])
      }
    } catch (err) {
      setLogs(prev => [
        ...prev,
        {
          message: `Error running plan: ${err.message}`,
          type: 'error',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setRunningPlan(false)
    }
  }

  const formatSLA = () => {
    if (!workOrder?.created_at) return 'N/A'
    const created = new Date(workOrder.created_at)
    const now = new Date()
    const hours = Math.floor((now - created) / 3600000)
    return `${hours}h`
  }

  if (!workOrderId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-body text-slate-500 dark:text-slate-400">
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
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !workOrder) {
    return (
      <div className="p-8">
        <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
          <p className="text-sm text-danger-700 dark:text-danger-300">
            Error loading work order: {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-h1 text-slate-900 dark:text-slate-100 mb-2">
                {workOrder?.title || 'Work Order Details'}
              </h1>
              <div className="flex items-center space-x-4 text-body text-slate-600 dark:text-slate-400">
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
            {workOrder?.status && (
              <StatusBadge status={workOrder.status} />
            )}
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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
          <h2 className="text-h2 text-slate-900 dark:text-slate-100 mb-6">Procedure Steps</h2>
          <Timeline
            steps={steps}
            onRunStep={handleRunStep}
            currentStep={currentStep}
          />
        </div>

        {/* Activity/Logs Feed */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
          <h2 className="text-h2 text-slate-900 dark:text-slate-100 mb-4">Activity Logs</h2>
          <div className="max-h-64 overflow-y-auto" role="log" aria-live="polite" aria-label="Activity logs">
            {logs.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No logs available</p>
            ) : (
              logs.map((log, index) => (
                <LogItem key={index} log={log} index={index} />
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
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
              setLogs([])
              fetchWorkOrderDetails()
            }}
            variant="ghost"
          >
            Replan
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

export default WorkOrderDetails

