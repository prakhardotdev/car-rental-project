/**
 * SkeletonCard — shimmer placeholder for car cards while loading
 */
export function SkeletonCard() {
  return (
    <div className="card-dark overflow-hidden">
      <div className="skeleton h-48 rounded-t-2xl rounded-b-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="flex gap-4 py-3">
          <div className="skeleton h-3 w-12 rounded-full" />
          <div className="skeleton h-3 w-12 rounded-full" />
          <div className="skeleton h-3 w-16 rounded-full" />
        </div>
        <div className="skeleton h-9 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * SkeletonRow — shimmer placeholder for table rows
 */
export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="skeleton h-4 rounded-full" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  )
}

/**
 * SkeletonStat — shimmer for KPI stat cards
 */
export function SkeletonStat() {
  return (
    <div className="stat-card">
      <div className="skeleton h-10 w-10 rounded-xl mb-2" />
      <div className="skeleton h-7 w-20 rounded-full" />
      <div className="skeleton h-3 w-16 rounded-full mt-1" />
    </div>
  )
}

/**
 * SkeletonText — inline shimmer for text content
 */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded-full"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}
