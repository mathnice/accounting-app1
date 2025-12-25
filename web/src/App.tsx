import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@insforge/react';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Statistics from './pages/Statistics';
import Categories from './pages/Categories';
import Accounts from './pages/Accounts';
import Profile from './pages/Profile';
import { Spin } from 'antd';

// Loading component
const LoadingScreen = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" tip="Loading..." />
  </div>
);

// Route guard for protected routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <LoadingScreen />;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Route guard for public routes
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <LoadingScreen />;
  }
  
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="categories" element={<Categories />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
