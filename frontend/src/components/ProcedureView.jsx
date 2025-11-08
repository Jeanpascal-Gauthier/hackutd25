import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

function ProcedureView() {
  const { workorderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [workOrder, setWorkOrder] = useState(location.state?.workOrder || null)
  const [agentResult, setAgentResult] = useState(location.state?.agentResult || null)
  const [loading, setLoading] = useState(!location.state?.workOrder)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!workOrder) {
      fetchWorkOrder()
    }
    if (!agentResult) {
      startAgent()
    }
  }, [])

  const fetchWorkOrder = async () => {
    try {
      const response = await fetch(`/api/workorders/${workorderId}`)
      const data = await response.json()
      setWorkOrder(data)
    } catch (error) {
      console.error('Error fetching work order:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAgent = async () => {
    try {
      const response = await fetch(`/api/start_agent/${workorderId}`, {
        method: 'POST'
      })
      const data = await response.json()
      setAgentResult(data)
    } catch (error) {
      console.error('Error starting agent:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading procedure...</div>
      </div>
    )
  }

  const steps = agentResult?.plan || ['Step 1', 'Step 2', 'Step 3']
  const logs = agentResult?.logs || []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center"
        >
          ← Back to Work Orders
        </button>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
          Guided Repair Procedure
        </h2>
        {workOrder && (
          <p className="text-slate-600">{workOrder.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Procedure Steps */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Procedure Steps</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-colors ${
                      index === currentStep
                        ? 'border-blue-500 bg-blue-50'
                        : index < currentStep
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index === currentStep
                            ? 'bg-blue-500 text-white'
                            : index < currentStep
                            ? 'bg-slate-400 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">{step}</h4>
                        {index === currentStep && (
                          <p className="text-sm text-slate-600 mt-2">
                            Current step - Follow the instructions carefully
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded shadow-sm hover:bg-blue-600 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
                {currentStep === steps.length - 1 && (
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded shadow-sm hover:bg-green-600 hover:shadow-md transition-all"
                  >
                    Complete Procedure
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agent Logs Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Agent Logs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-sm text-slate-500">No logs available</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3"></div>
                        <p className="text-slate-700">{log}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcedureView

