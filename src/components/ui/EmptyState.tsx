interface EmptyStateProps {
  message: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-gray-400">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-full bg-spark-lime px-5 py-2 text-sm font-bold text-spark-dark"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
