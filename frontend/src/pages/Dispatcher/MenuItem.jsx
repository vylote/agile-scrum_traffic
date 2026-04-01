export function MenuItem({ icon, text, isActive = false, onClick }) {
  
  // Setup màu sắc khi được chọn (isActive)
  const textColor = isActive ? "text-sky-500 font-medium" : "text-gray-500";
  const iconColor = isActive ? "text-sky-500" : "text-gray-400";

  return (
    <button
      className="flex gap-3 items-center p-4 w-full text-left hover:bg-gray-50 transition-colors"
      onClick={onClick}
      type="button"
    >
      {/* Bọc icon vào div để nó tự nhận màu sắc từ iconColor */}
      <div className={`flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      
      <span className={`text-base leading-6 ${textColor}`}>
        {text}
      </span>
    </button>
  );
}