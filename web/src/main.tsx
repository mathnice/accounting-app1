import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { InsforgeProvider } from '@insforge/react';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <InsforgeProvider baseUrl="https://y758dmj4.us-east.insforge.app">
      <ConfigProvider locale={enUS}>
        <App />
      </ConfigProvider>
    </InsforgeProvider>
  </React.StrictMode>
);
