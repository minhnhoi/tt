import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getLocalData } from './utils/storage';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Departments from './pages/Department';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import Profile from './pages/Profile';
import AboutTeam from './pages/AboutTeam';

function App() {
  const currentUser = getLocalData('currentUser');
  const isLoggedIn = !!currentUser?.id;

  return (
    <HashRouter>
      <Routes>
        {/* Trang đăng nhập - không cần bảo vệ */}
        <Route path="/login" element={<Login />} />

        {/* Các trang cần đăng nhập - bọc trong ProtectedRoute và Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Layout>
                <Employees />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EmployeeDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <Layout>
                <Departments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <Attendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <Layout>
                <LeaveRequests />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/about-team"
          element={
            <ProtectedRoute>
              <Layout>
                <AboutTeam />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Route gốc: chuyển hướng theo trạng thái đăng nhập */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        {/* Mọi route không khớp -> về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
