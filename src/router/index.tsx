import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AuthGuard from './AuthGuard';
import PublicOnlyGuard from './PublicOnlyGuard';

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
  </div>
);

const LoginPage = lazy(() => import('@/pages/login/LoginPage'));
const BindPhonePage = lazy(() => import('@/pages/auth/BindPhonePage'));
const SsoCallbackPage = lazy(() => import('@/pages/auth/SsoCallbackPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const SecurityPage = lazy(() => import('@/pages/account/SecurityPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const PosPage = lazy(() => import('@/pages/pos/PosPage'));
const SalesOrderListPage = lazy(() => import('@/pages/sales/SalesOrderListPage'));
const SalesOrderDetailPage = lazy(() => import('@/pages/sales/SalesOrderDetailPage'));
const ProcessingBoardPage = lazy(() => import('@/pages/processing/ProcessingBoardPage'));
const PoultryCategoryPage = lazy(() => import('@/pages/poultry/PoultryCategoryPage'));
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'));
const ProcurementPage = lazy(() => import('@/pages/procurement/ProcurementPage'));
const SupplierPage = lazy(() => import('@/pages/supplier/SupplierPage'));
const LossPage = lazy(() => import('@/pages/loss/LossPage'));
const MemberPage = lazy(() => import('@/pages/member/MemberPage'));
const StoreListPage = lazy(() => import('@/pages/stores/StoreListPage'));
const StaffPage = lazy(() => import('@/pages/staff/StaffPage'));
const PricingPage = lazy(() => import('@/pages/pricing/PricingPage'));
const ReportPage = lazy(() => import('@/pages/report/ReportPage'));

const Loading = () => (
  <div style={{ padding: 80, textAlign: 'center' }}><PageLoader /></div>
);

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyGuard>
              <LoginPage />
            </PublicOnlyGuard>
          }
        />
        <Route path="/auth/sso/callback" element={<SsoCallbackPage />} />
        <Route path="/auth/bind-phone" element={<BindPhonePage />} />
        <Route
          path="/auth/reset-password"
          element={
            <PublicOnlyGuard>
              <ResetPasswordPage />
            </PublicOnlyGuard>
          }
        />
        <Route
          path="/"
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="sales" element={<Navigate to="/sales/orders" replace />} />
          <Route path="sales/orders" element={<SalesOrderListPage />} />
          <Route path="sales/orders/:id" element={<SalesOrderDetailPage />} />
          <Route path="sales/processing" element={<ProcessingBoardPage />} />
          <Route path="poultry/categories" element={<PoultryCategoryPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="procurement" element={<ProcurementPage />} />
          <Route path="supplier" element={<SupplierPage />} />
          <Route path="loss" element={<LossPage />} />
          <Route path="member" element={<MemberPage />} />
          <Route path="stores" element={<StoreListPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="account/security" element={<SecurityPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

