function InventoryBadge({ available, quantity, location }) {
  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-bg-elevated border border-border rounded-lg">
      <div className={`w-2 h-2 rounded-full ${available ? 'bg-success-500' : 'bg-danger-500'}`} />
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

