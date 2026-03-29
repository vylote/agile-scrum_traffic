import Map from '../components/Map'; // Import cái bản đồ ông vừa làm ở bước trước

const Dashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard & Bản Đồ</h1>
      {/* Nếu ông chưa tạo file Map.jsx thì comment dòng dưới lại nhé */}
      <Map /> 
    </div>
  );
};

export default Dashboard;