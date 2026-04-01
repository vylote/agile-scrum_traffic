export default function HistoryCard({ type, location, time, status }) {
  const isCompleted = status === "completed";
  const isSOS = type === "SOS";

  return (
    <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSOS ? "bg-red-50" : "bg-green-50"}`}>
        {isSOS ? (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{type}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{location}</p>
        <p className="text-xs text-gray-300 mt-0.5">{time}</p>
      </div>

      {/* Status badge */}
      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
        isCompleted
          ? "bg-green-50 text-green-600"
          : "bg-red-50 text-red-500"
      }`}>
        {isCompleted ? "Hoàn thành" : "Khẩn cấp"}
      </span>
    </div>
  );
}