//axios là thư viện gọi HTTP req aka gọi API từ bên ngoài (external)
//ở đây dùng để gọi lên server của OpenStreetMap 
const axios = require('axios');

const getAddressFromCoords = async (lat, lon) => {
  try {
    //gọi API OpenStreetMap
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat: lat, //vi do
        lon: lon, //kinh do
        format: 'json',
        addressdetails: 1 //1 = true -> trả về chi tiết địa chỉ
      },
      headers: { 'User-Agent': 'TrafficIncidentApp/1.0' } // bắt buộc phải có header nếu k muốn bị chặn
    });
    /* URL thực tế sẽ trông như này 
    https://nominatim.openstreetmap.org/reverse?lat=10.7769&lon=106.6602&format=json&addressdetails=1 */
    return response.data.display_name;
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Địa chỉ không xác định';
  }
};

module.exports = { getAddressFromCoords };