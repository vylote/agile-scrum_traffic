export const mockIncidents = [
  {
    _id: "INC-20260326-0001",
    title: "Va chạm xe máy tại ngã tư",
    type: "ACCIDENT",
    severity: "MEDIUM",
    status: "PENDING",
    location: {
      address: "Đường Trần Phú, Từ Sơn, Bắc Ninh",
      coordinates: [105.9548, 21.1132] // [Lng, Lat]
    }
  },
  {
    _id: "INC-20260326-0002",
    title: "Cây đổ chắn ngang đường",
    type: "OTHER",
    severity: "HIGH",
    status: "IN_PROGRESS",
    location: {
      address: "Quốc lộ 1A, đoạn qua Đình Bảng",
      coordinates: [105.9400, 21.1000]
    }
  },
  {
    _id: "INC-20260326-0003",
    title: "Ngập sâu do vỡ ống nước",
    type: "FLOOD",
    severity: "CRITICAL",
    status: "PENDING",
    location: {
      address: "Khu vực Hoàn Kiếm, Hà Nội",
      coordinates: [105.8542, 21.0285]
    }
  }
];