function InventoryBadge({ available, quantity, location, lowStock }) {
  const isWarning = lowStock || (quantity !== undefined && quantity < 5)
  
  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
      isWarning 
        ? 'bg-inventory-warning-50 border-inventory-warning-500' 
        : available 
        ? 'bg-bg-elevated border-border' 
        : 'bg-danger-50 border-danger-500'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        available 
          ? isWarning 
            ? 'bg-inventory-warning-500' 
            : 'bg-success-500' 
          : 'bg-danger-500'
      }`} />
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-text-primary">
          {available ? 'Available' : 'Out of Stock'}
        </span>
        {quantity !== undefined && (
          <span className="text-xs text-text-secondary font-mono">
            Qty: {quantity}
          </span>
        )}
        {location && (
          <span className="text-xs text-text-tertiary font-mono">
            @ {location}
          </span>
        )}
      </div>
    </div>
  )
}

export default InventoryBadge
