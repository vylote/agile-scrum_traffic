import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Tự động cập nhật app khi có phiên bản mới
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Hệ thống Cứu hộ Khẩn cấp',
        short_name: 'Cứu Hộ',
        description: 'Ứng dụng báo cáo và điều phối cứu hộ khẩn cấp',
        theme_color: '#0088FF', // Màu thanh trạng thái trên điện thoại
        background_color: '#F2F2F7',
        display: 'standalone', // Giúp app chạy toàn màn hình, mất thanh địa chỉ
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Hỗ trợ icon bo tròn trên Android
          }
        ]
      }
    })
  ]
})
