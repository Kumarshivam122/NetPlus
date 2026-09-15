import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Public pages
const HomePage        = React.lazy(() => import('./pages/public/HomePage'));
const AboutPage       = React.lazy(() => import('./pages/public/AboutPage'));
const ProductsPage    = React.lazy(() => import('./pages/public/ProductsPage'));
const BrandsPage      = React.lazy(() => import('./pages/public/BrandsPage'));
const ServicesPage    = React.lazy(() => import('./pages/public/ServicesPage'));
const ContactPage     = React.lazy(() => import('./pages/public/ContactPage'));
const LoginPage       = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage    = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));

// Retailer Portal
const RetailerDashboard = React.lazy(() => import('./pages/portal/RetailerDashboard'));
const RetailerProducts  = React.lazy(() => import('./pages/portal/RetailerProducts'));
const RetailerOrders = React.lazy(() => import('./pages/portal/RetailerOrders'));
const RetailerCart = React.lazy(() => import('./pages/portal/RetailerCart'));
const RetailerRequest = React.lazy(() => import('./pages/portal/RetailerRequest'));

// Admin Portal
const AdminDashboard     = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminVerifications = React.lazy(() => import('./pages/admin/AdminVerifications'));
const AdminUsers         = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminCustDetails   = React.lazy(() => import('./pages/admin/AdminCustDetails'));
const AdminProducts      = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders        = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminCoupons       = React.lazy(() => import('./pages/admin/AdminCoupons'));

// Pending page
const PendingPage = React.lazy(() => import('./pages/auth/PendingPage'));
const OnboardingPage = React.lazy(() => import('./pages/portal/OnboardingPage'));

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
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <BrowserRouter>
              <ScrollToTop />
              <ErrorBoundary>
                <Suspense fallback={<div className="loading-overlay"><div className="spinner" /></div>}>
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
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
                    <Route path="/portal/cart" element={
                      <RequireAuth allowedRoles={['retailer']}>
                        <RequireApproved>
                          <RetailerCart />
                        </RequireApproved>
                      </RequireAuth>
                    } />
                    <Route path="/portal/request" element={
                      <RequireAuth allowedRoles={['retailer', 'admin']}>
                        <RequireApproved>
                          <RetailerRequest />
                        </RequireApproved>
                      </RequireAuth>
                    } />

                    {/* Admin Portal */}
                    <Route path="/admin" element={
                      <RequireAuth allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RequireAuth>
                    } />
                    <Route path="/admin/verifications" element={
                      <RequireAuth allowedRoles={['admin']}>
                        <AdminVerifications />
                      </RequireAuth>
                    } />
                    <Route path="/admin/users" element={
                      <RequireAuth allowedRoles={['admin']}>
                        <AdminUsers />
                      </RequireAuth>
                    } />
                    <Route path="/admin/customers" element={
                      <RequireAuth allowedRoles={['admin']}>
                        <AdminCustDetails />
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
                    <Route path="/admin/coupons" element={
                      <RequireAuth allowedRoles={['admin']}>
                        <AdminCoupons />
                      </RequireAuth>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
