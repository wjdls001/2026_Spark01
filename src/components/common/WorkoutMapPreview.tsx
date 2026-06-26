interface WorkoutMapPreviewProps {
  compact?: boolean
  route?: boolean
}

export function WorkoutMapPreview({ compact, route = true }: WorkoutMapPreviewProps) {
  return (
    <div className={`relative overflow-hidden bg-spark-muted ${compact ? 'h-24' : 'h-52'} rounded-spark-lg`}>
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(32deg, transparent 46%, #ffffff 47%, #ffffff 52%, transparent 53%), linear-gradient(148deg, transparent 42%, #eee8ff 43%, #eee8ff 50%, transparent 51%), linear-gradient(90deg, transparent 65%, #ffffff 66%, #ffffff 72%, transparent 73%)' }} />
      <div className="absolute left-[12%] top-[18%] h-16 w-24 rounded-full bg-spark-soft-lime/80" />
      <div className="absolute bottom-[10%] right-[6%] h-14 w-28 rounded-full bg-spark-soft-purple/90" />
      {route && <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 180" preserveAspectRatio="none"><path d="M25 135 C65 105, 75 45, 130 70 S205 150, 275 45" fill="none" stroke="#8C6CFF" strokeWidth="6" strokeLinecap="round" strokeDasharray="3 5" /><circle cx="25" cy="135" r="8" fill="#D1FF4C" stroke="#121212" strokeWidth="3" /><circle cx="275" cy="45" r="8" fill="#8C6CFF" stroke="white" strokeWidth="3" /></svg>}
      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-spark-purple shadow-sm">운동 경로</span>
    </div>
  )
}
