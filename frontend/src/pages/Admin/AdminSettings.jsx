import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Settings as SettingsIcon, Bell, Cpu, ShieldCheck, Database, LogOut } from 'lucide-react';
import api from '../../services/api';
import { logout } from '../../store/slices/authSlice';
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader"; 
import { BackupPanel } from "../../components/Admin/Settings/BackupPanel";
import { GeneralPanel } from "../../components/Admin/Settings/GeneralPanel";
import { NotificationsPanel } from "../../components/Admin/Settings/NotificationsPanel";
import { AlgorithmPanel } from "../../components/Admin/Settings/AlgorithmPanel";
import { SecurityPanel } from "../../components/Admin/Settings/SecurityPanel";

export const AdminSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('general'); 

  const settingsMenu = [
    { id: 'general', label: 'Hệ thống chung', icon: SettingsIcon },
    { id: 'notifications', label: 'Cấu hình thông báo', icon: Bell },
    { id: 'algorithm', label: 'Thuật toán điều phối', icon: Cpu },
    { id: 'security', label: 'Bảo mật và phân quyền', icon: ShieldCheck },
    { id: 'backup', label: 'Sao lưu dữ liệu', icon: Database },
  ];

  const handleLogout = async () => {
    try {
      await api.get("auth/logout");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'backup': return <BackupPanel />;
      case 'general': return <GeneralPanel />;
      case 'notifications': return <NotificationsPanel />
      case 'algorithm': return <AlgorithmPanel />
      case 'security': return <SecurityPanel />
      default:
        return (
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex items-center justify-center">
            <p className="text-gray-500 font-medium">Tính năng "{activeTab}" đang được phát triển...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        <AdminHeader 
          title="Cài đặt hệ thống"
          subtitle="Quản lý cấu hình toàn diện"
          onExport={() => alert("Đang tải dữ liệu cài đặt...")}
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto flex gap-8 h-full">
            <aside className="w-[300px] flex flex-col shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex-1 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 px-4 mb-4">Danh mục</h2>
                <nav className="flex flex-col gap-1 flex-1">
                  {settingsMenu.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          isActive ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors">
                    <LogOut className="w-5 h-5" /> Đăng xuất
                  </button>
                </div>
              </div>
            </aside>
            <div className="flex-1 flex flex-col h-[calc(100vh-160px)]">
               {renderActivePanel()} 
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;