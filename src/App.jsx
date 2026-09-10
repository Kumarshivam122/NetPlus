import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Public pages
import HomePage        from './pages/public/HomePage';
import AboutPage       from './pages/public/AboutPage';
import ProductsPage    from './pages/public/ProductsPage';
import BrandsPage      from './pages/public/BrandsPage';
import ServicesPage    from './pages/public/ServicesPage';
import ContactPage     from './pages/public/ContactPage';
import LoginPage       from './pages/auth/LoginPage';
import RegisterPage    from './pages/auth/RegisterPage';

// Retailer Portal
import RetailerDashboard from './pages/portal/RetailerDashboard';
import RetailerProducts  from './pages/portal/RetailerProducts';
import RetailerOrders from './pages/portal/RetailerOrders';

// Admin Portal
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

// Pending page
import PendingPage from './pages/auth/PendingPage';
import OnboardingPage from './pages/portal/OnboardingPage';

// Protected Route wrappers
function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RequireApproved({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (user.role === 'admin') return children;
  if (user.status === 'onboarding') return <Navigate to="/onboarding" replace />;
  if (user.status === 'pending')  return <Navigate to="/pending" replace />;
  if (user.status === 'rejected') return <Navigate to="/pending" replace />;
  return children;
}

function RequireOnboarding({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.status !== 'onboarding') return <Navigate to="/portal" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<HomePage />} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/brands"   element={<BrandsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact"  element={<ContactPage />} />

            {/* Auth */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending"  element={<PendingPage />} />
            <Route path="/onboarding" element={
              <RequireOnboarding>
                <OnboardingPage />
              </RequireOnboarding>
            } />

            {/* Retailer Portal */}
            <Route path="/portal" element={
              <RequireAuth allowedRoles={['retailer']}>
                <RequireApproved>
                  <RetailerDashboard />
                </RequireApproved>
              </RequireAuth>
            } />
            <Route path="/portal/products" element={
              <RequireAuth allowedRoles={['retailer']}>
                <RequireApproved>
                  <RetailerProducts />
                </RequireApproved>
              </RequireAuth>
            } />
            <Route path="/portal/orders" element={
              <RequireAuth allowedRoles={['retailer']}>
                <RequireApproved>
                  <RetailerOrders />
                </RequireApproved>
              </RequireAuth>
            } />

            {/* Admin Portal */}
            <Route path="/admin" element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminDashboard />
              </RequireAuth>
            } />
            <Route path="/admin/users" element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminUsers />
              </RequireAuth>
            } />
            <Route path="/admin/products" element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminProducts />
              </RequireAuth>
            } />
            <Route path="/admin/orders" element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminOrders />
              </RequireAuth>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
