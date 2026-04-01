import React, { useState } from 'react';

export const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Văn A',
    employeeId: '0001',
    phone: '0110101111',
    email: 'adsfa@gmail.com'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Đang lưu thay đổi:', formData);
    // Sau này bạn gọi API ở đây: await api.put('/users/update', formData)
  };

  return (
    <section className="flex-1 p-8 bg-white rounded-xl border border-gray-200 shadow-sm max-md:p-5">
      <h2 className="mb-8 text-xl font-bold text-gray-900">
        Hồ sơ điều phối viên
      </h2>

      <div className="flex gap-6 items-start mb-8 max-md:flex-col max-md:items-center">
        <img
          src="https://placehold.co/120x120/d1d5db/d1d5db"
          alt="Avatar"
          className="w-[120px] h-[120px] rounded-full object-cover"
        />
        <div className="flex-1 max-md:text-center mt-2">
          <button className="mb-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-200 transition-colors">
            Đổi ảnh đại diện
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Hỗ trợ định dạng JPG, PNG. Tối đa 2MB.
          </p>
        </div>
      </div>

      <form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 block">Họ và tên</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 block">Mã nhân sự</label>
            <input
              type="text"
              value={formData.employeeId}
              disabled
              className="px-4 py-3 w-full text-sm text-gray-500 bg-gray-100 rounded-lg border border-gray-300 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 block">Số điện thoại</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 block">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </section>
  );
};