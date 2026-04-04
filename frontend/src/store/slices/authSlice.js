import { createSlice } from '@reduxjs/toolkit';

// 1. Quét ổ cứng (localStorage) xem trước đó có ông nào đăng nhập chưa
// vì dữ liệu dc redux lưu trên RAM->f5 thì ram clear
const savedUser = localStorage.getItem('user') //lay ra chuoi JSON 

// authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    isInitialized: false, // <-- Thêm vào để biết khi nào App đã check xong Session
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isInitialized = true; // Đã xác thực xong
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.isInitialized = true; 
      localStorage.removeItem('user');
    },
    // Bổ sung action này để dùng khi không có user hoặc check xong mà fail
    setInitialized: (state) => {
      state.isInitialized = true;
    }
  }
});

export const { loginSuccess, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;