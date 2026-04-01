export default function NotificationCard({ title, message, time, type, isRead }) {
  const iconConfig = {
    sos: { bg: "bg-red-50", color: "text-red-500" },
    success: { bg: "bg-green-50", color: "text-green-500" },
    info: { bg: "bg-blue-50", color: "text-blue-500" },
  };

  const config = iconConfig[type] || iconConfig.info;

  return (
    <div className={`bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-start gap-3 ${!isRead ? "border-l-4 border-blue-400" : ""}`}>
      {/* Icon */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${config.bg}`}>
        {type === "sos" && (
          <svg className={`w-4 h-4 ${config.color}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        )}
        {type === "success" && (
          <svg className={`w-4 h-4 ${config.color}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {type === "info" && (
          <svg className={`w-4 h-4 ${config.color}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <span className="text-[10px] text-gray-300 flex-shrink-0 mt-0.5">{time}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}