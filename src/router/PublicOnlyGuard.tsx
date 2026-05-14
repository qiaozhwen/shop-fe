import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/** 已登录用户访问 /login 等公共页时，跳回首页。 */
export default function PublicOnlyGuard({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
