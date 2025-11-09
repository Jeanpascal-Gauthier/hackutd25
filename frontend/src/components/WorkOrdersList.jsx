import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import WorkOrderRow from './WorkOrderRow'
import { useReducedMotion } from '../hooks/useReducedMotion'

function WorkOrdersList({ selectedId, onSelect, searchQuery = '' }) {
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  const fetchWorkOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/work_orders')
      if (!response.ok) throw new Error('Failed to fetch work orders')
      const data = await response.json()
      setWorkOrders(data)
    } catch (err) {
      setError(err.message)
      // Fallback to mock data
      setWorkOrders([
        { id: 1, title: 'Replace GPU Node A12', status: 'pending', severity: 'high', rack: 'Rack-A12', updated_at: new Date().toISOString() },
        { id: 2, title: 'Check Rack Temperature R18', status: 'in_progress', severity: 'medium', rack: 'Rack-R18', updated_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, title: 'Replace PSU in Rack B7', status: 'pending', severity: 'high', rack: 'Rack-B7', updated_at: new Date(Date.now() - 7200000).toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesFilter = filter === 'all' || wo.status === filter
    const matchesSearch = !searchQuery || 
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wo.rack && wo.rack.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-bg-tertiary rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error && workOrders.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-danger-50 dark:bg-danger-50 border border-danger-200 dark:border-danger-200 rounded-lg p-4">
          <p className="text-sm text-danger-600 dark:text-danger-500">
            Error loading work orders: {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filter Row */}
      <div className="p-4 border-b border-border bg-bg-elevated">
        <div className="flex space-x-2">
          {['all', 'pending', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded transition-all duration-150
                ${filter === status
                  ? 'bg-accent-500 text-white shadow-sm'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                }
              `}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders List */}
      <div className="flex-1 overflow-y-auto">
        {filteredWorkOrders.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-text-tertiary">
              No work orders found
            </p>
          </div>
        ) : (
          filteredWorkOrders.map((workOrder, index) => (
            <WorkOrderRow
              key={workOrder.id}
              workOrder={workOrder}
              isSelected={selectedId === workOrder.id}
              onClick={() => onSelect(workOrder.id)}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default WorkOrdersList
