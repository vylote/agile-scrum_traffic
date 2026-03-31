import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const IncidentDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL: /incident/:id
  const navigate = useNavigate();
  const BACKEND_URL = "http://localhost:5000/uploads";

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidentDetail = async () => {
      try {
        setLoading(true);
        // Thay đổi URL /api/incidents cho khớp với route backend của bạn
        const response = await api.get(`/incidents/${id}`);

        setIncident(response.data.result);
      } catch (err) {
        setError(
          err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentDetail();
  }, [id]);

  if (loading)
    return <div className="p-5 text-center">Đang tải chi tiết sự cố...</div>;
  if (error) return <div className="p-5 text-center text-red-500">{error}</div>;
  if (!incident)
    return (
      <div className="p-5 text-center">Không tìm thấy thông tin sự cố.</div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline"
      >
        &larr; Quay lại danh sách
      </button>

      <h1 className="text-2xl font-bold mb-4">Chi tiết báo cáo sự cố</h1>

      <div className="space-y-4">
        <div>
          <span className="font-semibold text-gray-700">CODE sự cố: </span>
          <span>{incident.code}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">ID sự cố: </span>
          <span>{incident._id}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">
            Trạng thái sự cố:{" "}
          </span>
          <span>{incident.status}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Địa chỉ sự cố: </span>
          <span>{incident.location.address}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Hình ảnh sự cố: </span>
          <div className="flex gap-2 flex-wrap mt-1">
            {incident.photos && incident.photos.length > 0 ? (
              incident.photos.map((url, index) => {
                const imageUrl = url.startsWith("http")
                  ? url
                  : `${BACKEND_URL}/${url}`;

                return (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Ảnh sự cố ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                );
              })
            ) : (
              <span className="text-gray-400 text-sm italic">
                Không có hình ảnh đính kèm
              </span>
            )}
          </div>
        </div>

        {incident.reportedBy && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Thông tin người báo cáo:</h3>
            <p>
              <strong>Tên:</strong> {incident.reportedBy.name}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {incident.reportedBy.phone}
            </p>
            <p>
              <strong>Email:</strong> {incident.reportedBy.email}
            </p>
          </div>
        )}

        <div>
          <span className="font-semibold text-gray-700">Mô tả chi tiết: </span>
          <p className="mt-1 text-gray-600">
            {incident.description || "Chưa có mô tả"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
