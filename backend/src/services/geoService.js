const axios = require('axios');

const reverseGeocode = async (lat, lon) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat: lat, 
        lon: lon, 
        format: 'json',
        addressdetails: 1 //1 = true -> trả về chi tiết địa chỉ
      },
      headers: { 'User-Agent': 'TrafficIncidentApp/1.0' } // bắt buộc phải có header nếu k muốn bị chặn
    });
    /* URL thực tế sẽ trông như này 
    https://nominatim.openstreetmap.org/reverse?lat=10.7769&lon=106.6602&format=json&addressdetails=1 */
    console.log('đang gọi api gg street map')
    return response.data.display_name;
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Địa chỉ không xác định';
  }
};

module.exports = { reverseGeocode };