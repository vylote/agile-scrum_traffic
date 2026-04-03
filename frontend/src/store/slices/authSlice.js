import { createSlice } from '@reduxjs/toolkit';

// 1. Quét ổ cứng (localStorage) xem trước đó có ông nào đăng nhập chưa
// vì dữ liệu dc redux lưu trên RAM->f5 thì ram clear
const savedUser = localStorage.getItem('user') //lay ra chuoi JSON 

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null, //chuyen doi thanh object
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user')
    },
  }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;