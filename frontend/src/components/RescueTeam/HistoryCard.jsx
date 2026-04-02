import React from "react";
import { Wrench, MapPin } from "lucide-react"; 

export function HistoryCard({ serviceType, status, code, time, location }) {
  return (
    <article className="flex flex-col justify-center p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
      
      {/* Header của thẻ: Icon + Tiêu đề + Trạng thái */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
             <Wrench className="w-5 h-5 text-sky-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            {serviceType}
          </h3>
        </div>
        {/* Badge trạng thái */}
        <div className="px-2.5 py-1 text-[11px] font-bold text-green-600 bg-green-100 rounded-lg uppercase tracking-wide">
          {status}
        </div>
      </div>

      {/* Nội dung chi tiết: Mã, Thời gian, Địa điểm */}
      <div className="flex flex-col gap-2 pl-[52px]">
        <p className="text-sm font-medium text-gray-500">
          Mã: <span className="text-gray-900">{code}</span> • {time}
        </p>
        <div className="flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <address className="text-xs text-gray-500 not-italic leading-relaxed">
            {location}
          </address>
        </div>
      </div>

    </article>
  );
}

export default HistoryCard;