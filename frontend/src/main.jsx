import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux' 
import { store } from './store/index.js' 

import 'leaflet/dist/leaflet.css';
import './index.css'  
import  App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js') 
      .then((registration) => {
        console.log('Service Worker đã đăng ký thành công với scope:', registration.scope);
      })
      .catch((err) => {
        console.error('Lỗi đăng ký Service Worker:', err);
      });
  });
}

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    // StrictMode là một công cụ của React dành cho môi trường phát triển (Development).
    //  Nó sẽ chủ động render lại component 2 lần và chạy useEffect 2 lần.
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>,
  );
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  )
}