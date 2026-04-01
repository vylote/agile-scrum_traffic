import { AdminMenu } from "../../components/AdminMenu";
import { ExportButton } from "../../components/ExportButton";
import ellipse1 from "../../assets/images/avatar.jpg";
import {
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Plus,
} from "lucide-react";

// MOCK DATA: Lịch sử các báo cáo đã trích xuất
const mockReports = [
  {
    id: "REP-082",
    name: "Báo cáo tổng hợp sự cố Tháng 3/2026",
    type: "Sự cố",
    date: "31/03/2026 08:30",
    size: "2.4 MB",
    status: "Hoàn thành",
  },
  {
    id: "REP-081",
    name: "Danh sách người dùng & ĐPV Active",
    type: "Tài khoản",
    date: "28/03/2026 15:45",
    size: "1.1 MB",
    status: "Hoàn thành",
  },
  {
    id: "REP-080",
    name: "Đánh giá đối tác cứu hộ Quý 1",
    type: "Đối tác",
    date: "25/03/2026 09:15",
    size: "850 KB",
    status: "Hoàn thành",
  },
  {
    id: "REP-079",
    name: "Dữ liệu Heatmap điểm nóng tuần 3",
    type: "Bản đồ",
    date: "20/03/2026 10:00",
    size: "5.2 MB",
    status: "Hoàn thành",
  },
  {
    id: "REP-078",
    name: "Báo cáo doanh thu và chi phí dự kiến",
    type: "Tài chính",
    date: "15/03/2026 11:20",
    size: "1.5 MB",
    status: "Đã lưu trữ",
  },
];

export const Reports = () => {
  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      {/* 1. SIDEBAR */}
      <AdminMenu />

      {/* 2. NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER CHUẨN ADMIN */}
        <header className="h-[90px] flex items-center justify-between px-8 bg-transparent shrink-0 mt-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-[26px] font-bold text-gray-900 leading-tight">
              Trích xuất dữ liệu hệ thống
            </h2>
            <p className="text-base text-gray-500 font-medium">
              Báo cáo hệ thống
            </p>
          </div>

          <div className="flex items-center gap-5">
            <ExportButton
              onClick={() => alert("Mở popup tạo báo cáo nhanh...")}
            />
            <img
              src={ellipse1}
              alt="Admin Profile"
              className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
            />
          </div>
        </header>

        {/* KHU VỰC BẢNG DỮ LIỆU */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col mt-2 min-h-[500px]">
            {/* Toolbar */}
            <div className="p-5 flex justify-between items-center border-b border-gray-200 bg-white rounded-t-2xl">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Lịch sử xuất báo cáo
                </h3>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">
                  Tháng 3/2026
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium text-sm transition-colors border border-gray-200">
                  <Calendar className="w-4 h-4" />
                  Chọn ngày
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium text-sm transition-colors border border-gray-200">
                  <Filter className="w-4 h-4" />
                  Lọc loại báo cáo
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0088FF] hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-colors shadow-sm active:scale-95">
                  <Plus className="w-4 h-4" />
                  Tạo báo cáo tùy chỉnh
                </button>
              </div>
            </div>

            {/* Bảng Dữ Liệu Báo Cáo */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                      Mã BC
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Tên báo cáo
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Phân loại
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Dung lượng
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {mockReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-500 text-xs">
                          {report.id}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-gray-900 text-[15px]">
                            {report.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">
                          {report.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 font-medium text-sm">
                          {report.date}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-500 text-sm">
                          {report.size}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="flex items-center gap-2 ml-auto px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-bold text-sm rounded-lg transition-colors border border-transparent hover:border-blue-100">
                          <Download className="w-4 h-4" />
                          Tải xuống
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
