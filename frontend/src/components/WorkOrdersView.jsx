import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function WorkOrdersView() {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const fetchWorkOrders = async () => {
        try {
            const response = await fetch('/api/work_orders');
            const data = await response.json();
            setWorkOrders(data);
        } catch (error) {
            console.error('Error fetching work orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkOrders =
        filter === 'all'
            ? workOrders
            : workOrders.filter((wo) => wo.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'in_progress':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'completed':
                return 'bg-slate-50 text-slate-600 border-slate-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-slate-500';
            default:
                return 'text-slate-500';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStartProcedure = async (workOrderId) => {
        try {
            const response = await fetch(`/api/start_agent/${workOrderId}`, {
                method: 'POST',
            });
            const result = await response.json();
            navigate(`/procedure/${workOrderId}`, {
                state: {
                    workOrder: workOrders.find((wo) => wo.id === workOrderId),
                    agentResult: result,
                },
            });
        } catch (error) {
            console.error('Error starting procedure:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading work orders...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                    Work Orders
                </h2>
                <p className="text-slate-600">
                    View and manage active work orders
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex space-x-2">
                {['all', 'pending', 'in_progress', 'completed'].map(
                    (status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                                filter === status
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {status === 'all'
                                ? 'All'
                                : status
                                      .replace('_', ' ')
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </button>
                    )
                )}
            </div>

            {/* Work Orders List */}
            <div className="space-y-4">
                {filteredWorkOrders.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 text-center">
                        <p className="text-slate-500">No work orders found</p>
                    </div>
                ) : (
                    filteredWorkOrders.map((workOrder) => (
                        <div
                            key={workOrder.id}
                            className="bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-medium text-slate-900">
                                                {workOrder.title}
                                            </h3>
                                            <span
                                                className={`px-2.5 py-0.5 text-xs font-medium rounded border ${getStatusColor(
                                                    workOrder.status
                                                )}`}
                                            >
                                                {workOrder.status
                                                    .replace('_', ' ')
                                                    .toUpperCase()}
                                            </span>
                                            {workOrder.priority && (
                                                <span
                                                    className={`text-xs font-medium ${getPriorityColor(
                                                        workOrder.priority
                                                    )}`}
                                                >
                                                    {workOrder.priority.toUpperCase()}{' '}
                                                    PRIORITY
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-6 text-sm text-slate-600 mt-3">
                                            {workOrder.assigned_to && (
                                                <span>
                                                    Assigned to:{' '}
                                                    <span className="font-medium text-slate-900">
                                                        {workOrder.assigned_to}
                                                    </span>
                                                </span>
                                            )}
                                            {workOrder.created_at && (
                                                <span>
                                                    Created:{' '}
                                                    {formatDate(
                                                        workOrder.created_at
                                                    )}
                                                </span>
                                            )}
                                            <span>ID: #{workOrder.id}</span>
                                        </div>
                                    </div>
                                    {workOrder.status !== 'completed' && (
                                        <button
                                            onClick={() =>
                                                handleStartProcedure(
                                                    workOrder.id
                                                )
                                            }
                                            className="ml-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded shadow-sm hover:bg-blue-600 hover:shadow-md transition-all"
                                        >
                                            Start Procedure
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default WorkOrdersView;
